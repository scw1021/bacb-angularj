import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { AccommodationService } from '../_services/accommodation.service';
import { IAccommodationsActual } from './iaccomodationsactual';
import { IConfirm } from '../_interfaces';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'accommodations',
  templateUrl: './accommodations.component.html',
  styleUrls: ['./accommodations.component.css']
})
export class AccommodationsComponent implements OnInit, OnDestroy {
    private subscriptionsArr$: Array<Subscription> = [];
    /**@description Accomdations which are already saved to the application ID */
    public savedAccomsForApp: Observable<IAccommodationsActual[]>;
    /**@description Accmodation Types (checkboxes) */
    public accomTypesCB$: Observable<IAccommodationsActual[]>;
    /**@description Accmodation Types (dropdowns) */
    public accomTypesDD$: Observable<[IAccommodationsActual[], string][]>;
    public userHasAccoms: boolean = false;
    public check: boolean = true;
    public showOther: boolean = false;
    public otherVal: string;
    public hasSubmittedFile = false;


    public dropdownFormGroup: FormGroup = new FormGroup({});
    public checkboxFormGroup: FormGroup = new FormGroup({});
    public accommodationForm: FormGroup = new FormGroup({
      "checkboxFormGroup": this.checkboxFormGroup,
      "dropdownFormGroup": this.dropdownFormGroup
    });
    public FileTypes = [{
      // This ID is a dynamics ID
      Type:{Id: '09b18c29-bb08-eb11-a813-00224808102a', Code:'ACCO',Description:'Proof of Accommodation Eligibility'},
      RequirementMet: 'F'
    }];

  public constructor(
    private accService: AccommodationService
  ){
    this.accomTypesCB$ = this.accService.accTypesCheckboxes$;
    this.accomTypesDD$ = this.accService.accTypesDropdowns$;
    this.savedAccomsForApp = this.accService.accommodationsForCurrentApplication$.pipe(
      tap((backendAccomsArr) => this.userHasAccoms = backendAccomsArr.length > 0? true: false)
    );
  }

  public ngOnInit() {
    var otherSub;
    const dropdownSub = this.accomTypesDD$.subscribe((tupleArr: [IAccommodationsActual[], string][]) =>
      tupleArr.forEach((tuple) =>
        this.dropdownFormGroup.addControl(tuple[1], new FormControl()),
      )
    )
    const checkboxSub = this.accomTypesCB$.subscribe((accommsArr: IAccommodationsActual[]) =>
      accommsArr.forEach((accom) =>{
        this.checkboxFormGroup.addControl(accom.ShortDescription, new FormGroup(
          {
            "Id": new FormControl(accom.Id),
            "Value": new FormControl()
          }
        ))
        if(accom.ShortDescription == "Other"){
          otherSub = this.checkboxFormGroup.get("Other").valueChanges.subscribe((other) => {
            if(other["Value"] == true){
              this.showOther = true;
            } else {
              this.showOther = false
            }
          })
        }
      })
    )


    this.checkboxFormGroup.addControl("OtherAccommodationText", new FormControl())
    const exsitingAccomsSub = this.savedAccomsForApp.subscribe((res) => {
      console.log(res)
    });
    const fileCheckStatusSub = this.accService.Check().subscribe((res: IConfirm) => {});
    this.subscriptionsArr$.push(fileCheckStatusSub);
    this.subscriptionsArr$.push(otherSub);
    this.subscriptionsArr$.push(exsitingAccomsSub);
    this.subscriptionsArr$.push(dropdownSub);
    this.subscriptionsArr$.push(checkboxSub);
  }

  public submit(){
    var idsToSubmit: string[] = []
    const checkboxkeys = Object.keys(this.checkboxFormGroup.controls);
    console.warn(this.accommodationForm);
    checkboxkeys.forEach((key) => {
      const control = this.checkboxFormGroup.get(key);
      // if control is dirty, if it's text we can grab its value else we need the value of the Checkbox
      if(control.dirty && control.get("Value")?.value ){
        idsToSubmit.push(this.checkboxFormGroup.get(key).get("Id").value);
      }
    })
    const dropdownKeys = Object.keys(this.dropdownFormGroup.controls);
    console.log("dropdownKeys",dropdownKeys);
    dropdownKeys.forEach((key) => {
      const control = this.dropdownFormGroup.get(key);
      if(control?.dirty && control?.value){
        console.log("key", key, "val", control.value);
        idsToSubmit.push(control.value["Id"])
      }
    })

    console.log("count of ID's" + idsToSubmit.length)
    idsToSubmit.forEach((id) => console.log(id));

    this.accService.Submit(idsToSubmit, this.checkboxFormGroup.get("OtherAccommodationText").value );

  }

  public checkForFileUpload(){
    this.accService.Check().subscribe((filecheckres) => console.log("file check result", filecheckres))
  }


  public compareAccoms(a: IAccommodationsActual, b: IAccommodationsActual){
    return a?.ShortDescription == b?.ShortDescription? true: false;
  }

  public ngOnDestroy(){
    this.subscriptionsArr$.forEach((sub: Subscription) =>{
      if(sub && !sub.closed){
        sub.unsubscribe();
      }
    })
  }
}
