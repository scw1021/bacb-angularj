import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { IDocumentType } from 'src/app/_interfaces';
import { DigitsOnly } from 'src/app/_validators';
import { IsBACBID } from '../../_validators/supervision-validators';

@Component({
  selector: 'app-supervisor-eligibility',
  templateUrl: './supervisor-eligibility.component.html',
  styleUrls: ['./supervisor-eligibility.component.css']
})
export class SupervisorEligibilityComponent implements OnInit {
  public fg: FormGroup
  private _findBy: Subject<"AceNumber" | "BACBID"> = new Subject<"AceNumber" | "BACBID">();
  public findBy: "AceNumber" | "BACBID" = null
  public disableSubmit = false;
  public eightHour;
  constructor(private fb: FormBuilder) { 
    this.eightHour = [{
      Type: <IDocumentType>{
        Code: '08HR',
        Description: "Eight Hour Training",
        Id: '6a5c3eb5-ff03-eb11-a813-00224808102a'
      },
      RequirementMet: 'F'
    }];
  }

  ngOnInit(): void {
    this.fg = this.fb.group({
      TrainingType: this.fb.control(null, Validators.required),
      EndDate: this.fb.control(null, Validators.required),
      AceGroup: this.fb.group({
        AceProviderNumber: this.fb.control(null, Validators.required),
        AceName: this.fb.control(null, Validators.required),
      }),
      BACBIDGroup: this.fb.group({
        InstructorBACBID: this.fb.control(null, [Validators.required, IsBACBID(), DigitsOnly()]),
        InstructorName: this.fb.control(null, Validators.required),
      }) 
    })
    this.fg.get('TrainingType').reset({value: 'Eight hour supervision training', disabled: true})
    this.fg.get('AceGroup').get('AceName').disable()
    this.fg.get('BACBIDGroup').get('InstructorName').disable()
    this.fg.valueChanges.subscribe(() => {
      if(this.fg.status == 'VALID'){
        // Providing way to make submit button submittable again
        this.disableSubmit = false
      }
    })
    
    this._findBy.asObservable().subscribe((findbyval) => {
      this.findBy = findbyval
      if(findbyval == "AceNumber"){
        this.fg.get("BACBIDGroup.InstructorBACBID").disable();
        this.fg.get("AceGroup.AceProviderNumber").enable();
        
      } else if(findbyval == "BACBID"){
        this.fg.get("AceGroup.AceProviderNumber").disable();
        this.fg.get("BACBIDGroup.InstructorBACBID").enable();
        //turn off Ace Stuff
      }
    })
    this.setFindBy("BACBID");
    merge(
      this.fg.get("AceGroup.AceProviderNumber").valueChanges,
      this.fg.get("BACBIDGroup.InstructorBACBID").valueChanges
    ).subscribe((val) => {
      if(this.findBy == "AceNumber" && this.fg.get("AceGroup.AceProviderNumber").errors == null){
        console.log("rdytosendace")
      } else if(this.findBy == "BACBID"&& this.fg.get("BACBIDGroup.InstructorBACBID").errors == null){
        console.log("rdytosendbacb")
      }
    })
  }
  public setFindBy(which: "AceNumber" | "BACBID"){
    this._findBy.next(which);
  }
  public trySubmit(){
    if(this.fg.invalid){
      this.fg.markAllAsTouched();
      this.disableSubmit = true;
    } else {
      //Do submit
    }
  }
  public checkTrainer(){
    
  }
  public fileCheck(file: any){
    console.log(file)
  } 
}

