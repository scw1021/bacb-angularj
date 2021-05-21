import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { IConfirm, IDocumentType, IListObject, INameChangeRequest } from '../_interfaces';
import { ListObject } from '../_models';
import { AlertService, ModelToolsService, PersonalProfileService } from '../_services';

@Component({
  selector: 'app-name-change-request',
  templateUrl: './name-change-request.component.html',
  styleUrls: ['./name-change-request.component.css']
})
export class NameChangeRequestComponent implements OnInit {
  fg: FormGroup;
  prefixes$: IListObject[];
  suffixes$: IListObject[];
  fileHasBeenSubmitted: boolean = null;
  showFileRequiredError: boolean = false;
  nameChangeReq: INameChangeRequest = <INameChangeRequest>{};
  nameChangeReqFileType = [{
    Type: <IDocumentType>{
      Code: 'NCRQ',
      Description: "Name Change Record",
      Id: '2283512a-d081-eb11-a812-000d3a31da2f'
    },
    RequirementMet: 'F'
  }];
  constructor(private fb: FormBuilder,
              private mts: ModelToolsService,
              private personalProfileSvc: PersonalProfileService,
              private alertSvc: AlertService) { }

  ngOnInit(): void {
    this.personalProfileSvc.PersonalProfile$.subscribe((persProf) => 
    {
      this.nameChangeReq.OriginalFirstName = persProf.FirstName
      this.nameChangeReq.OriginalMiddleName = persProf.MiddleName
      this.nameChangeReq.OriginalLastName = persProf.LastName
      // this.nameChangeReq.OriginalPrefix = persProf.Prefix
      // this.nameChangeReq.OriginalSuffix = persProf.Suffix
      this.nameChangeReq.OriginalPrefix = null;
      this.nameChangeReq.OriginalSuffix = null;
    }
    )
    /// TODO: Replace this, and model toolsvc with proper option set vals when its time;
    this.prefixes$ = prefixes;
    this.suffixes$ = suffixes;
    this.fg = this.fb.group({
      NameGroup: this.fb.group({
        FirstName: this.fb.control(null, Validators.required),
        MiddleName: this.fb.control(null),
        LastName: this.fb.control(null, Validators.required)
      }),
      PrefixSuffix: this.fb.group({
        Prefix: this.fb.control(null),
        Suffix: this.fb.control(null)
      })
    })
    this.fg.get("NameGroup").valueChanges.subscribe((vals) => {
      this.nameChangeReq.RequestedFirstName = vals["FirstName"]
      this.nameChangeReq.RequestedLastName = vals["LastName"]
      this.nameChangeReq.RequestedMiddleName = vals["MiddleName"]
      console.log(this.nameChangeReq) 
    })
    this.fg.get("PrefixSuffix").valueChanges.subscribe((vals) => {
      this.nameChangeReq.RequestedPrefix = vals["Prefix"]
      this.nameChangeReq.RequestedSuffix = vals["Suffix"] 
    })
  }
  public displayLObj(a: IListObject, b: IListObject) {
    return a && b ? b.Id === a.Id : a === b;
  }
  public fileCheck(response: any){
    console.log(response, "res")
    if(response.Response == "F"){
      this.fileHasBeenSubmitted = false;
    } else {
      this.fileHasBeenSubmitted = true;
      this.showFileRequiredError = false;
    }
  }

  public onClickSubmit(){
    if(!this.fg.valid){
      this.fg.markAllAsTouched();
    }
    if(this.fileHasBeenSubmitted != true){
      this.fileHasBeenSubmitted = false;
      this.showFileRequiredError = true;
    }
    if(this.fileHasBeenSubmitted == true && this.fg.valid){
      this.showFileRequiredError = false;

      this.personalProfileSvc.submitNameChangeRequest(this.nameChangeReq).subscribe(
        (success) => {},
        (error: HttpErrorResponse) => {this.alertSvc.error("something went wrong:" +  error.message)}
      )
    }
  }
}


export const suffixes = [
  {
  "Id": "100000000",
  "Value": "II"
  },
  {
  "Id": "100000001",
  "Value": "IV"
  },
  {
  "Id": "100000002",
  "Value": "III"
  },
  {
  "Id": "100000003",
  "Value": "Jr."
  }
]

export const prefixes = [
  {
      "Id": "100000000",
      "Value": "Ms."
  },
  {
      "Id": "100000001",
      "Value": "Mrs."
  },
  {
      "Id": "100000002",
      "Value": "Dr."
  },
  {
      "Id": "100000003",
      "Value": "Mr."
  }
]