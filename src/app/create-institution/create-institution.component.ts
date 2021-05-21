import { AlertService, ModelToolsService } from '../_services';
import { Component, OnInit } from '@angular/core';
import { Country, StateSet } from '../_models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICountry, IInstitution, IListObject, IStateSet } from '../_interfaces';
import { Observable, of } from 'rxjs';

import { map } from 'rxjs/operators';

@Component({
  selector: 'create-institution',
  templateUrl: './create-institution.component.html',
  styleUrls: ['./create-institution.component.css']
})
export class CreateInstitutionComponent implements OnInit {

  public InstitutionForm: FormGroup;
  public SelectedCountry: Country = new Country();

  public Countries: ICountry[] = this.InstitutionModelServ.Countrie$;
  public Institutions: Observable<IInstitution[]> = this.InstitutionModelServ.Institution$;

  public constructor(private InstitutionAlertServ: AlertService,
                     private InstitutionFormBuilder: FormBuilder,
                     private InstitutionModelServ: ModelToolsService) {
      this.InstitutionForm = this.InstitutionFormBuilder.group({
        Name: ['', Validators.required],
        Website: [''],
        Address1: [''],
        Address2: [''],
        Country: [''],
        State: [''],
        City: [''],
        PostalCode: ['']
      })
    }

  public ngOnInit() {
  }

  // Accessors
  public get StateSet() : IStateSet {
    if (this.SelectedCountry) {
      return this.InstitutionModelServ.ReadStates(this.SelectedCountry.Export());
    }
    else {
      return (new StateSet().Export());
    }
  }

  public get DefaultCountry() : ICountry {
    return this.InstitutionModelServ.DefaultCountry;
  }

  // Methods
  public CompareListObj(Param1: IListObject, Param2: IListObject) : boolean {
    return Param1 && Param2 ? Param1.Id === Param2.Id : false;
  }

  public CompareCountry(Param1: ICountry, Param2 : ICountry) : boolean {
    return Param1 && Param2 ? Param1.Id === Param2.Id : false;
  }

  public OnSelectCountry(SelectedICountry : ICountry) : void {
    if (SelectedICountry && SelectedICountry.Id) {
      this.SelectedCountry = new Country(SelectedICountry);
      if (this.SelectedCountry.DialCode === '1') {
        this.InstitutionForm.controls['State'].setValidators([Validators.required]);
      }
      else {
        this.InstitutionForm.controls['State'].clearValidators();
        this.InstitutionForm.controls['State'].updateValueAndValidity();
      }
    }
  }

  private EnableValidators() : void {
    this.InstitutionForm.controls['Name'].setValidators([Validators.required]);
    this.InstitutionForm.controls['Address1'].setValidators([Validators.required]);
    this.InstitutionForm.controls['Country'].setValidators([Validators.required]);
    this.InstitutionForm.controls['City'].setValidators([Validators.required]);
    this.InstitutionForm.controls['PostalCode'].setValidators([Validators.required]);
  }

  private DisableValidators() : void {
    this.InstitutionForm.controls['Name'].clearValidators();
    this.InstitutionForm.controls['Name'].updateValueAndValidity();
    this.InstitutionForm.controls['Address1'].clearValidators();
    this.InstitutionForm.controls['Address1'].updateValueAndValidity();
    this.InstitutionForm.controls['Country'].clearValidators();
    this.InstitutionForm.controls['Country'].updateValueAndValidity();
    this.InstitutionForm.controls['City'].clearValidators();
    this.InstitutionForm.controls['City'].updateValueAndValidity();
    this.InstitutionForm.controls['PostalCode'].clearValidators();
    this.InstitutionForm.controls['PostalCode'].updateValueAndValidity();
  }

  public OnClickCancel() : void {
    this.InstitutionForm.reset();
    this.DisableValidators();
    this.SelectedCountry.Erase();
  }

  public OnSubmitInstitution() : void {
    this.InstitutionAlertServ.error('Institution Submission not implemented');
    // stop here if form is invalid
    if (this.InstitutionForm.invalid) {
      return;
    }



  }

}
