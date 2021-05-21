import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Address, ListObject, PersonalProfile, Phone } from '../_models';
import { Component, Input, OnInit } from '@angular/core';
import { IAddress, ICountry, IListObject, IPersonalProfile, IState } from '../_interfaces';
import { ModelToolsService, PersonalProfileService } from '../_services';
import { Observable, merge, of } from 'rxjs';
import { PhoneFieldsAreCompleteOrEmpty, isObj, validCountryAndNumberCombination } from '../_validators/personal-profile-validators';
import { filter, map, startWith, take, tap } from 'rxjs/operators';

import { ActivatedRoute } from '@angular/router';
import { PhoneCrossFieldErrorStateMatcher } from './personal-info-error-state-matcher';
import { StaticCountryList } from '../_models/country'
import { StaticUnitedStatesList } from '../_models/state'
import { ThrowStmt } from '@angular/compiler';
import { stringify } from '@angular/compiler/src/util';

@Component({
  selector: 'personal-inf',
  templateUrl: './personal-info-rewrite.component.html',
  styleUrls: ['./personal-info-rewrite.component.css']
})
export class PersonalInfoRewriteComponent implements OnInit {
  @Input() summaryLock: boolean;
  public onSubmitShowSummary = true;
  public errorStateMatcher: PhoneCrossFieldErrorStateMatcher = new PhoneCrossFieldErrorStateMatcher()
  public fg: FormGroup;
  public Countries: ICountry[] = this.modelToolsServ.Countrie$;
  public filteredCountries: Observable<ICountry[]>;
  public states = StaticUnitedStatesList;
  public filteredStates: Observable<IState[]>;
  public defaultCountries: ICountry[] = [];
  public genders$: IListObject[] = this.modelToolsServ.GenderType$
  public ethnicities$: IListObject[] = this.modelToolsServ.EthnicityType$
  public prefixes$: IListObject[] = this.modelToolsServ.Prefixe$
  public suffixes$: IListObject[] = this.modelToolsServ.Suffixe$
  constructor(private fb: FormBuilder,
    private modelToolsServ: ModelToolsService,
    private personalProfileSvc: PersonalProfileService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {

    this.activatedRoute.queryParamMap.subscribe((params) => {
      console.log(params)
      console.log()
      params.get("showSummary") == "false"? this.onSubmitShowSummary = false: this.onSubmitShowSummary = true;
    })

    //this.defaultCountries.push(...this.Countries.filter((allcountires) => allcountires.Name.includes("United States") || allcountires.Name.includes("Canada")))
    this.defaultCountries.push(...this.Countries);


    this.fg = this.fb.group({
      NameGrp: this.fb.group({
        // Prefix: this.fb.control(null),
        // Suffix: this.fb.control(null),
        FullName: this.fb.control(null)
      }),
      DemographicGrp: this.fb.group({
        DateOfBirth: this.fb.control(null, Validators.required),
        Gender: this.fb.control(null, Validators.required),
        Ethnicity: this.fb.control(null, Validators.required)
      }),
      EmailGrp: this.fb.group({
        Primary: this.fb.control(null, Validators.email),
        Secondary: this.fb.control(null, Validators.email),
      }),
      PhoneGrp: this.fb.group({
        Primary: this.fb.group({
          Country: this.fb.control(null, [Validators.required, isObj]),
          Number: this.fb.control(null, Validators.required),
          Ext: this.fb.control(null),
          IsMobile: this.fb.control(null),
        }, { validators: validCountryAndNumberCombination }),
        Alternative: this.fb.group({
          Country: this.fb.control(null, isObj),
          Number: this.fb.control(null),
          Ext: this.fb.control(null),
          IsMobile: this.fb.control(null),
        }, { validators: [PhoneFieldsAreCompleteOrEmpty, validCountryAndNumberCombination] })
      }),
      AddressGrp: this.fb.group({
        BillingGrp: this.fb.group({
          Address1: this.fb.control(null, Validators.required),
          Address2: this.fb.control(null),
          Country: this.fb.control(null, [Validators.required, isObj]),
          City: this.fb.control(null, Validators.required),
          State: this.fb.control(null, [Validators.required, isObj]),
          PostalCode: this.fb.control(null, Validators.required )
        }),
        ShipGrp: this.fb.group({
          Address1: this.fb.control(null, Validators.required),
          Address2: this.fb.control(null),
          Country: this.fb.control(null, [Validators.required, isObj]),
          City: this.fb.control(null, Validators.required),
          State: this.fb.control(null, [Validators.required, isObj]),
          PostalCode: this.fb.control(null, Validators.required)
        }),
        /**@description This means that shipping and billing are different addresses*/
        BillingAndShippingDiffer: this.fb.control(false)
      }),
      Id: this.fb.control(null)
    })


    this.fg.get("AddressGrp.BillingAndShippingDiffer").valueChanges.subscribe((billingAndMailingAreSeparate) => {
      this.toggleMailing(billingAndMailingAreSeparate);
    })
    this.personalProfileSvc.PersonalProfile$.pipe(
      filter((data: PersonalProfile) => data !== null),
      filter((data: PersonalProfile) => data?.BACBID !== "")

    ).subscribe((stuff: PersonalProfile) => {
      console.log("PersProf", stuff)
      const phones = this.fg.get("PhoneGrp");
      phones.get("Primary").setValue(stuff.Phone)
      const primCtry = this.Countries.find((country) => country.Id === stuff.Phone.Country.Id)
      primCtry ? this.displayCountryWithDialCode(primCtry) : null
      phones.get("Primary.Country").setValue(primCtry);

      if(stuff.AltPhone.Number){
        const altCtry = this.Countries.find((country) => country.Id === stuff.AltPhone.Country.Id)
        // debugger
        phones.get("Alternative").setValue(stuff.AltPhone)
        this.displayCountryWithDialCode(altCtry);
        phones.get("Alternative.Country").setValue(altCtry);
      }
      this.fg.get("EmailGrp.Primary").setValue(stuff.Email);
      this.fg.get("EmailGrp.Secondary").setValue(stuff.AltEmail);

      const demo = this.fg.get("DemographicGrp")
      demo.get("DateOfBirth").setValue(stuff.Birthdate);

      // As long as the MW is configured to provide a blank lobj, we must not set the value unless its a valid id field MM 2.3.21
      if(stuff.Gender.Id !== ""){
        demo.get("Gender").setValue(stuff.Gender);
        this.displayLObj(stuff.Gender, stuff.Gender);
      }
      if(stuff.Ethnicity.Id !== ""){
        demo.get("Ethnicity").setValue(stuff.Ethnicity);
        this.displayLObj(stuff.Ethnicity, stuff.Ethnicity);
      }
      this.addressLoadLogic(stuff);
      this.fg.get("NameGrp.FullName").setValue(stuff.FullName)
      //this.fg.get("NameGrp.Prefix").setValue(stuff.Prefix.Value);
      //this.fg.get("NameGrp.Suffix").setValue(stuff.Suffix.Value);
      this.fg.get("Id").setValue(stuff.Id)
    })
    this.clearStatesOnNonUs();
    this.fg.get("NameGrp").disable();
    this.fg.get("EmailGrp.Primary").disable();
    // This simply combines all relevant val change observables so we only have to store and filter one list of countries and do all the logic in one place.
    const phoneCntryAutocompleteValChanges = merge(
      this.fg.get("PhoneGrp.Primary.Country").valueChanges,
      this.fg.get("PhoneGrp.Alternative.Country").valueChanges,
      this.fg.get("AddressGrp.BillingGrp.Country").valueChanges,
      this.fg.get("AddressGrp.ShipGrp.Country").valueChanges)

    this.filteredCountries = phoneCntryAutocompleteValChanges.pipe(
      startWith(""),
      map(value => typeof value === 'string' ? value : null),
      map(value => this._filter(value))
    )
    const stateAutocompleteValChanges = merge(
      this.fg.get("AddressGrp.BillingGrp.State").valueChanges,
      this.fg.get("AddressGrp.ShipGrp.State").valueChanges
    )
    this.filteredStates = stateAutocompleteValChanges.pipe(
      startWith(""),
      map(value => typeof value === 'string' ? value : null),
      map(value => this._filterStates(value))
    )
  }
  public _filter(country: string) {
    if (country === null || country === "") { return this.defaultCountries }
    const filterCountry = country.toLowerCase();
    return this.Countries.filter((allcountires) => allcountires?.Name?.toLowerCase()?.includes(filterCountry))
  }

  public _filterStates(state: string) {
    if (state == "" || state == null) { return this.states }
    const filterState = state.toLowerCase();
    return this.states.filter((allStates) => allStates.Name.toLowerCase().includes(filterState))
  }

  public displayCountryWithDialCode(country: ICountry) {
    return country && country.Name && country.DialCode ? country.Name + '(' + country.DialCode + ')' : ''
  }
  public displayCountry(country: ICountry) {
    return country && country.Name ? country.Name : ''
  }
  public displayState(state: IState) {
    return state && state.Name ? state.Name : '';
  }
  public displayLObj(a: IListObject, b: IListObject) {
    return a && b ? b.Id === a.Id : a === b;
  }

  public clearStatesOnNonUs() {
    this.fg.get('AddressGrp.BillingGrp.Country').valueChanges
      .pipe(
        filter(input => typeof (input) === 'object')
      )
      .subscribe((country: ICountry) => {
        if (country?.Abbrev !== "US") {
          this.fg.get("AddressGrp.BillingGrp.State").disable();
        } else {
          this.fg.get("AddressGrp.BillingGrp.State").enable();
        }
      })
    this.fg.get('AddressGrp.ShipGrp.Country').valueChanges
      .pipe(
        filter(input => typeof (input) === 'object')
      )
      .subscribe((country: ICountry) => {
        if (country?.Abbrev !== "US") {
          this.fg.get("AddressGrp.ShipGrp.State").disable();
        } else {
          this.fg.get("AddressGrp.ShipGrp.State").enable()
        }
      })
  }

  public toggleMailing(checkboxValue: boolean) {
    checkboxValue == true ? this.fg.get("AddressGrp.ShipGrp").enable() : this.fg.get("AddressGrp.ShipGrp").disable()
    this.fg.get('AddressGrp.ShipGrp').updateValueAndValidity({ onlySelf: true })
  }
  // Is here to isolate address loading logic. Addresses are hot garbage in their current form(is shipping, is billing and an index? trash) and should be improved.
  public addressLoadLogic(prof: PersonalProfile) {
    console.warn(prof)
    const bill = this.fg.get("AddressGrp.BillingGrp")
    const main = prof.Addresses[0];
    const sec = prof.Addresses[1];
    if(main.Country.Id){

      bill.get("Address1").setValue(main.Address1);
      bill.get("Address2").setValue(main.Address2);
      bill.get("Country").setValue(main.Country);
      bill.get("City").setValue(main.City);
      bill.get("State").setValue(main.State);
      bill.get("PostalCode").setValue(main.PostalCode);
    }

    const ship = this.fg.get("AddressGrp.ShipGrp")
    if(sec.Country.Id !== ""){
      ship.get("Address1").setValue(sec.Address1);
      ship.get("Address2").setValue(sec.Address2);
      ship.get("Country").setValue(sec.Country);
      ship.get("City").setValue(sec.City);
      ship.get("State").setValue(sec.State);
      ship.get("PostalCode").setValue(sec.PostalCode);
    } else {
      this.toggleMailing(false);
    }

  }
  public onSubmit() {
    if (!this.fg.valid) {
      this.fg.markAllAsTouched();
      this.fg.get('AddressGrp.ShipGrp.Country').markAllAsTouched();
      return
    }
    var upsertProfile: PersonalProfile = new PersonalProfile();
    upsertProfile.Birthdate = this.fg.get("DemographicGrp.DateOfBirth").value;
    const upesertGender = new ListObject( this.fg.get("DemographicGrp.Gender").value);
    const upsertEthnicity = new ListObject(this.fg.get("DemographicGrp.Ethnicity").value);
    upsertProfile.Ethnicity = upsertEthnicity;
    upsertProfile.Gender = upesertGender;
    var phone = new Phone(this.fg.get("PhoneGrp.Primary").value);
    var altPhone = new Phone(this.fg.get("PhoneGrp.Alternative").value);
    phone.IsMobile = this.fg.get("PhoneGrp.Primary.IsMobile").value == true ? true : false;
    altPhone.IsMobile = this.fg.get("PhoneGrp.Alternative.IsMobile").value == true ? true : false;
    upsertProfile.Phone = phone;
    upsertProfile.AltPhone = altPhone;
    upsertProfile.Id = this.fg.get('Id').value
    upsertProfile.AltEmail = this.fg.get("EmailGrp.Secondary").value;
    upsertProfile = this.addressUpsertLogic(upsertProfile, this.fg.get("AddressGrp"))
    this.personalProfileSvc.Update(upsertProfile.Export())
      .subscribe(
        (response) => {
          console.log(response)

        },
        (err) => { },
        () => {
          this.personalProfileSvc.Read();
          this.onSubmitShowSummary = true
        },
      )
  }
  // Same as above, for upsert
  public addressUpsertLogic(profile: PersonalProfile, addresses: AbstractControl): PersonalProfile {
    if (addresses.get("BillingAndShippingDiffer").value == false) {
      let defaultAddr = new Address()
      defaultAddr.Country.Id = "";
      profile.Addresses = [new Address(addresses.get("BillingGrp").value)];
    } else {
      profile.Addresses = [new Address(addresses.get("BillingGrp").value), new Address(addresses.get("ShipGrp").value)]
    }
    return profile;
  }
}
