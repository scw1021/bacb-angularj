import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { CONFIRM_SUCCESS, IConfirm } from '../_interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { concatMap, debounce, debounceTime, distinctUntilChanged, map, share, shareReplay, take, tap, withLatestFrom } from 'rxjs/operators';

import { ApplicationService } from './application.service';
import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { Confirm } from '../_models';
import { FileMgmtService } from './file-mgmt.service';
import { IAccommodation } from '../_interfaces/i-accommodation';
import { IAccommodationResponse } from '../_interfaces/i-accommodation-response';
import { IAccommodationsActual } from '../accommodations/iaccomodationsactual';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AccommodationService extends BaseService {
  private _refetchUserAccoms: BehaviorSubject<any> = new BehaviorSubject(null);
  private _refetchAllAccomodationTypes: BehaviorSubject<any> = new BehaviorSubject(null);

  /*** @description All accommodation types returned from backend. To update this value synchronously, use the updateAccomTypes() method */
  public allAccomTypes$: Observable<IAccommodationsActual[]>;
  public accommodationsForCurrentApplication$: Observable<IAccommodationsActual[]>;

  public accTypesCheckboxes$: Observable<IAccommodationsActual[]> ;
  public accTypesDropdowns$: Observable<[IAccommodationsActual[], string][]>;
  private dropDowns: Observable<string[]> = of(["extra time", "separate room"]);

  private FileCheck = this.file.Check([{
    Type:{Id: '09b18c29-bb08-eb11-a813-00224808102a', Code:'ACCO',Description:'Proof of Accommodation Eligibility'},
    RequirementMet: 'F'
  }]).pipe(shareReplay(1))

  constructor(
    private http: HttpClient,
    private file: FileMgmtService,
    private azure: AzureHttpPostService,
    private appService: ApplicationService,
  ) {
    super();
    // These two http calls are setup this way to be refetchable with a single call. They refire the http call every time the behavior subject emits a new value
    this.allAccomTypes$ = this._refetchAllAccomodationTypes.asObservable()
    .pipe(
      concatMap(() => this.http.get<IAccommodationsActual[]>(this.BaseUrl + 'AccommodationsGet/ReadAccommodationTypes')),
      shareReplay(1)
    )

    this.accommodationsForCurrentApplication$ = this._refetchUserAccoms.asObservable()
    .pipe(
      concatMap(() => this.http.post<IAccommodationsActual[]>(this.BaseUrl + 'AccommodationsPost/ReadUserAccommodations', {"Application": this.appService.AppId} )),
      shareReplay(1)
    )

    // combine all accoms, and dropdown strings
    this.accTypesDropdowns$ = this.allAccomTypes$.pipe(
      withLatestFrom(this.dropDowns),
      map(([allAccomsArr, dropdownTypeArr]) => {
        // create tuple for each string that indicates dropdown
        var dropdownTypeAndValueArray: [IAccommodationsActual[],string][] = [];
          dropdownTypeArr.forEach((dropdownType) => {
            const filteredAccoms = allAccomsArr
            // filter out accoms that include dropdown type string(could be filtered on acutal prop later)
            .filter((accom) =>
              accom
              .ShortDescription
              .toLowerCase()
              .includes(dropdownType.toLowerCase()))
            dropdownTypeAndValueArray.push([filteredAccoms, dropdownType])
          })
        // return [accomsfordropdowntype[], dropdowntypestring]
        return dropdownTypeAndValueArray
      })
    )
    this.accTypesCheckboxes$ = this.accTypesDropdowns$.pipe(
      tap(x=>console.log('AccommodationTypesPre',x)),
      // Start by recombining the dropdown tuples back into straight arrays for efficient comparison
      map<[IAccommodationsActual[], string][], IAccommodationsActual[]>((dropDownTupleArr) =>{
        var accomodationsThatAreDropdowns: IAccommodationsActual[] = []
        dropDownTupleArr.forEach((tuple: [IAccommodationsActual[], string]) =>
          accomodationsThatAreDropdowns.push(...tuple[0])
        )
        // console.log(accomodationsThatAreDropdowns)
        return accomodationsThatAreDropdowns
      }),
      // Then pull in the whole array
      withLatestFrom(this.allAccomTypes$),
      map(([toRemove, allaccoms]) =>{
          // This may look strange, but by doing it this way instead of a straight all.filter((accom) => !<in dropdown array via search>),
          // we achieve O(1) as opposed to O(n)
          const toRemoveMap = toRemove.reduce((memo, item) =>({
            ...memo,
            [item.ShortDescription]: true,
          }), {})
          return allaccoms.filter(x => !toRemoveMap[x.ShortDescription])
      }),
      tap(x=>console.log('AccommodationTypes',x)),
      map(x => {
        return x.sort( (a, b) => {
          if ( a.ShortDescription == 'Other' ) return 1;
          else if ( b.ShortDescription == 'Other' ) return -1;
          else if ( a.ShortDescription > b.ShortDescription ) {
            return 1;
          }
          else { return -1 }
        })
      }),
      shareReplay(1)
    )
  }

  public Submit(accommodationIds: string[], otherText: string ) {
    // Just making an array of JSON objs with an app id and accom type Id per elem

    // I don't want to hear it, I'm just putting out fires.
    var documentId = null;
    this.FileCheck.subscribe(response => {
      console.log('fc in submit', response);
      documentId = response.Message;
    })
    var normalizedPostData = accommodationIds.map((accomId) => {
      // if other, we need the text with it
      let response = {"TypeId": accomId, "Application": this.appService.AppId, "Document": documentId, "Text": ""};
      if ( accomId == "2a1f7671-6d07-eb11-a813-000d3a5a7103") {
       response.Text = otherText;
      }
      return response;
    })
    this.http.post<Confirm>(this.BaseUrl + 'AccommodationsPost/SubmitUserAccommodations', {"AccomsToCreate": normalizedPostData }).pipe(
      tap(() => this.fetchUserAccomodations())
    ).subscribe(response=>console.log("Submission Result", response))
  }

  public Check(): Observable<IConfirm>{
    return combineLatest([this.accommodationsForCurrentApplication$, this.FileCheck]).pipe(
      map<[IAccommodationsActual[], IConfirm], IConfirm>(response => {
        console.log("Accommodations Check", response)
        if (response[0] && response[0].length) {
          return response[1]
        }
        else {
          return CONFIRM_SUCCESS;
        }
      }),
      shareReplay(1)
    );
  }

  /** @description The ONLY way you should force a fetch of User Accommodations*/
  public fetchUserAccomodations(){
    this._refetchUserAccoms.next(null);
  }
  /** @description The ONLY way you should force a fetch of Accommodaion Types*/
  public fetchAllAccomodationTypes(){
    this._refetchAllAccomodationTypes.next(null);
  }
  public deleteAccom(accommodationId: string, reloadUserAccoms: boolean = true){
    this.http.post(this.BaseUrl + 'AccommodationsPost/DeleteAccommodation', {"AccommodationToDelete": accommodationId }).pipe(
      tap(() => {if(reloadUserAccoms) {this.fetchUserAccomodations()}})
    ).subscribe();
  }
}
