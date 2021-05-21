import { AuthenticationService, BaseService } from '.';
import { IConfirm, IListObject, IResponseObject } from '../_interfaces';
import { Observable, zip } from 'rxjs';
import { filter, map, pluck, take, tap } from 'rxjs/operators';

import { AzureHttpPostService } from './azure-http-post.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ListObject } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class MarketingOptionsService extends BaseService {
  // As of getting the marketing options feature area up and running, this is not used(2.27.20).
  // However, to conform with the rest of the application, I have provided a publicly consumable Observable.
  /**
   * @param MarketingOptionAndOptedInBoolTupleArray
   * 1: array of all marketing options 2: array of marketing options that the user has opted to recieve.
   *  */
  public MarketingOptionAndOptedInBoolTupleArray: Observable<[IListObject, boolean][]> = this.combineAllOptionsAndOptInOptions();
  constructor(
    private http: HttpClient,
    private authService: AuthenticationService,
    private azure: AzureHttpPostService
  ) {
    super();
  }

  private fetchAllMarketingOptions(): Observable<IListObject[]>{
    return this.http.get<IListObject[]>(this.BaseUrl + 'MarketingOptionsGet/GetAllMarketingOptions').pipe(
      take(1)
  );
  }

  private fetchUsersOptedInMarketingOptions(): Observable<IListObject[]>{
    return this.azure.get<IListObject[]>(this.BaseUrl + 'MarketingOptionsGet/GetUserOptedInMarketingOptions').pipe(
      pluck<any, IListObject[]>('MarketingOptions')
    );
  }

  /**
   * @description This method calls two gets from the backend. 1: array of all marketing options 2: array of marketing options that the user has opted to recieve.
   * It returns an array(with a length of all marketing options) of tuples. Each tuple represents[marketingOption: IListObject, userHasOptedIntoThisMarketingOption: boolean]
   */
  public combineAllOptionsAndOptInOptions(): Observable<[IListObject, boolean][]> {
    const allmarketingoptionsArr$: Observable<IListObject[]> = this.fetchAllMarketingOptions();
    const userSelectedMarketingOptionsArr$: Observable<IListObject[]> = this.fetchUsersOptedInMarketingOptions();
    return zip(allmarketingoptionsArr$, userSelectedMarketingOptionsArr$).pipe(
      map(([allOptions, userSelectedOptions]) => {
        let outputArray: [IListObject, boolean][] = new Array();
        allOptions.forEach((singlePredicateOption: IListObject) => {
          // Iterate through complete option list. If user has already opted in, set bool in tuple to true and push.
          if (userSelectedOptions.findIndex((singleUserSelectedPredicateOption: IListObject) => singleUserSelectedPredicateOption.Id == singlePredicateOption.Id) == -1) {
            outputArray.push([singlePredicateOption, false]);
          } else {
            outputArray.push([singlePredicateOption, true]);
          }
        })
        return outputArray;
      })
    );
  }

  /**
   *
   * @param marketingOptionAndBooleanTupleArr Tuple of options and whether or not the user has Opted into them.
   */
  public backendUpdateUserMarketingOptionPreferences(marketingOptionAndBooleanTupleArr: [IListObject, boolean][]): Observable<string> {
    let outputArr: IListObject[] = new Array();
    marketingOptionAndBooleanTupleArr.forEach((singleTuple: [ListObject, boolean]) => {
      if(singleTuple[1] == true){
        outputArr.push(singleTuple[0]);
      }
    })
    return this.azure.post<string>(this.BaseUrl + 'MarketingOptionsPost/UpdateUserMarketingOptions', {"MarketingOptions": outputArr}).pipe(
    );
  }
}
