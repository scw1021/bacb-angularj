import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MarketingOptionsService } from '../_services/marketing-options.service';
import { Observable, of, Subscription } from 'rxjs';
import { IListObject, IConfirm } from '../_interfaces';
import { Router } from '@angular/router';
import { AlertObject } from '../_models';
import { AlertService } from '../_services';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'marketing-options',
  templateUrl: './marketing-options.component.html',
  styleUrls: ['./marketing-options.component.css']
})
export class MarketingOptionsComponent implements OnInit, OnDestroy {

  /**
   * @param MarketingOptionandIsPickedTuple This is an array of tuples. Each tuple represents
   * [MarketingOption: IListObject, UserIsOptedIn: boolean]
   * The array should contain every Marketing Option possible from the backend.
   */
  public MarketingOptionandIsOptedInTupleArr: [IListObject, boolean][] | null = null;
  private dataTupleSubscription: Subscription;
  private backendOptInUpdateResponse: Subscription;
  public showSuccess = false;
  // This is a tiple of the array of marketing options from the backend;

  constructor(protected marketingOptionsSvc: MarketingOptionsService,
              protected router: Router,
              protected alertSvc: AlertService) { }

  ngOnInit() {
    this.dataTupleSubscription =
    this.marketingOptionsSvc.combineAllOptionsAndOptInOptions().subscribe((dataBoolTuple: [IListObject, boolean][]) =>{
      this.MarketingOptionandIsOptedInTupleArr = dataBoolTuple
    });
  }

  SaveMarketingOptionsToBackend(){
    this.backendOptInUpdateResponse =
    this.marketingOptionsSvc.backendUpdateUserMarketingOptionPreferences(this.MarketingOptionandIsOptedInTupleArr).pipe(
    ).subscribe(
      (success) => {this.showSuccess=true; setTimeout(() => {this.showSuccess = false}, 3000)  },
      (error) => {this.alertSvc.error("Something went wrong. Please try again later")}
    )
  }

  ngOnDestroy(): void {
    // backendOptInUpdateResponse WILL be undefined if user navigates away without saving changes
    this.backendOptInUpdateResponse? this.backendOptInUpdateResponse.unsubscribe(): null;
    this.dataTupleSubscription.unsubscribe();
  }
}
