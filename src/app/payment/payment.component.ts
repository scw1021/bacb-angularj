// declare var braintree: any;
// declare var paypal: any;
// import * as braintree from "braintree-web";

// import { AlertService, PaymentService } from "../_services";

import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

// import { FormBuilder, FormGroup, Validators } from "@angular/forms";

// import { environment } from "src/environments/environment";

// import { PaymentDropinService } from "../_services/payment-dropin.service";


// declare module braintree-web;

// declare var require: any;
//declare var Card: any;
@Component({
  selector: "app-payment",
  templateUrl: "./payment.component.html",
  // providers: [PaymentDropinService],
  styleUrls: ["./payment.component.css"]
})
export class PaymentComponent implements OnInit {
  // public AssetUrl: string =
  //   `${environment.Assets}` + "/images/BACB_Logo_200.png";

  // @Output() dropinLoaded: EventEmitter<any> = new EventEmitter<any>();
  // @Output() paymentStatus: EventEmitter<any> = new EventEmitter<any>();
  // @Output() payButtonStatus: EventEmitter<any> = new EventEmitter<any>();

  // // @Input() clientTokenURL: string;
  // // @Input() createPurchaseURL: string;
  // @Input() chargeAmount: number;

  // // Optional inputs
  // @Input() buttonText = "Buy"; // to configure the pay button text
  // @Input() allowChoose = true;
  // @Input() showCardholderName = true;
  // @Input() enablePaypalCheckout = true;
  // @Input() enablePaypalVault = true;
  // @Input() currency: string;
  // @Input() locale: string;
  // @Input() enabledStyle: any;
  // @Input() disabledStyle: any;
  // @Input() hideLoader = false;

  // clientToken: string;
  // nonce: string;
  // showDropinUI = true;
  // errorMessage: string;

  // showPayButton = false; // to display the pay button only after the dropin UI has rendered.
  // clientTokenNotReceived = false; // to show the error, "Error! Client token not received."
  // interval: any;
  // instance: any;
  // dropinConfig: any = {};
  // enablePayButton = false;
  // showLoader = true;
  // //hostedFieldsInstance: braintree.HostedFields;
  // cardholdersName: string;

  // button = document.querySelector("#submit-button");
  // public PaymentForm: FormGroup;

  // // @Input() getClientToken: Function = () => this.paymentService.getClientToken(this.clientTokenURL);
  // // @Input() createPurchase: Function = (nonce, chargeAmount) => this.paymentService.createPurchase(this.createPurchaseURL, nonce, chargeAmount);

  constructor(
    // private paymentService: PaymentService,
    // // private paymentDropinService: PaymentDropinService,
    // private changeDetectorRef: ChangeDetectorRef,
    // private PaymentAlertServ: AlertService
  ) {}

  ngOnInit(): void {

  }
}
