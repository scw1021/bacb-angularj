// declare var braintree: any;

// import * as braintreeWeb from "braintree-web";

import { AlertService, ApplicationService, CertificationService, PaymentService } from "../_services";
import { Component, OnInit } from "@angular/core";
import { IApplication, IConfirm } from '../_interfaces';
import { __AddDays, __GetNetSuiteDate } from '../_helpers/utility-functions';

import { ActivatedRoute } from '@angular/router';
import { IInvoice } from "../_interfaces/i-invoice";
import { MatTableDataSource } from "@angular/material/table";
import { Observable } from "rxjs";
import { tap } from 'rxjs/operators';

@Component({
  selector: "app-invoice",
  templateUrl: "./invoice.component.html",
  styleUrls: ["./invoice.component.css"]
})
export class InvoiceComponent implements OnInit {

  private _StartDate: string = "1/1/2020";

  public paymentNonce: string;

  public InvoiceData: MatTableDataSource<IInvoice> = new MatTableDataSource<IInvoice>();
  public Invoices: Observable<IInvoice[]> = this.paymentService.Invoices$;
  public Invoice$: Observable<IInvoice> = this.paymentService.Invoice$;
  public get DisplayedColumns(): string[] {
    return ["Line Item", "Price", "Paid", "Actions"];
  }
  constructor(
    private alertService: AlertService,
    private activeRoute: ActivatedRoute,
    private applicationService: ApplicationService,
    private paymentService: PaymentService,
    private certificationService: CertificationService
  ) {
    // set up grouped invoices by Actual CRM invoice number.

  }

  ngOnInit() {
  }


  onDropinLoaded(event) {
    console.log("dropin loaded...");
  }

  onPaymentStatus(response: string): void {
    console.log('OnPaymentStatus', response);
    this.paymentNonce = response;
    this.createPurchase();
  }
  getClientTokenSS() {}

  createPurchase() {

    console.log('createPurchase');
    this.paymentService.MakePayment(this.paymentNonce);
  }
  // This is necessary for getting the right invoice
  public get BaseAppId() : string {
    return this.activeRoute.snapshot.queryParamMap.get('AppId');
  }

  public OnRadioDebug(date: string) {
    console.log(date);
    this._StartDate = date;
  }

  // Toggle whether or not you pay a given invoice line item and manage pay value amount
  // Also prevent changes when card is submitted
  public OnClickCheck(invoice: IInvoice) {
    this.paymentService.Next(invoice);

    // console.log('OnClickCheck');
    // this.certificationService.__CreateTestingCertCycle({
    //   Invoice: invoice, StartDate: this._StartDate,
    //   // The 'Big Oof'
    //   EndDate: __GetNetSuiteDate(__AddDays(new Date(this._StartDate), 365*2))
    // })
    // .pipe(
    //   tap(_x => console.log('CTC:', _x))
    // )
    // .subscribe( (_Response: IConfirm) => {
    //   if ( !_Response ) {
    //     _Response = {Response: 'F', Message: 'NULL'}
    //   }
    //   if ( _Response.Response == 'T' ) {
    //     this.alertService.success(_Response.Message);
    //     // fix the Application to paid
    //     this.PaidApplication();
    //   }
    //   else {
    //     this.alertService.error(_Response.Message);
    //   }
    // })
  }
  // This method is good for a full set of invoices, but we are just going to pass in a single invoice for testing
  // This method works as expected, in Dev3 anyway

  private PaidApplication(): void {
    console.log('PaidApplication');
    this.applicationService.PayApplication(this.BaseAppId)
    .subscribe(
      (_response: IConfirm) => {
        console.log('Payment Response:',_response);
      }
    )
  }
}
