import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Address } from 'src/app/_models';
import { ModelToolsService, PersonalProfileService } from 'src/app/_services';
import { PersonalInfoRewriteComponent } from '../personal-info-rewrite.component';

@Component({
  selector: 'app-personal-info-summary',
  templateUrl: './personal-info-summary.component.html',
  styleUrls: ['./personal-info-summary.component.css']
})
export class PersonalInfoSummaryComponent implements OnInit {
  @Input() passedInForm: FormGroup;
  @Input() summaryLock: boolean;
  @Output() toggleEdit= new EventEmitter<boolean>();
  shippingAddr;
  billingAddr;
  constructor(
    private personalProfileSvc: PersonalProfileService,
    private router: Router,
    private route: ActivatedRoute) {
    }
  ngOnInit(): void {

    
    this.passedInForm.get('AddressGrp.BillingGrp').valueChanges.subscribe((val)=>{
      this.billingAddr = val
    })
    this.passedInForm.get('AddressGrp.ShipGrp').valueChanges.subscribe((val)=>{
      this.shippingAddr = val
    })
  }

  onClickEdit(){
    console.log("edit clicked")
    if(this.summaryLock == true){
      console.log("summaryLock true")
      this.router.navigate(["../personal-profile"],{relativeTo: this.route, queryParams: {showSummary: false} })
    } else {
      console.log("summaryLock false")
      this.toggleEdit.next(true)
    }
  }
}
