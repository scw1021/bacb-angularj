import { AlertService, PaymentService } from '../_services';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { IConfirm } from '../_interfaces';
import { Observable } from 'rxjs';
import { PaymentDropinService } from '../_services/payment-dropin.service';
import { pluck } from 'rxjs/operators';

// import * as braintree from 'braintree-web';



declare var braintree: any;
const CONFIRM_PAYMENT_TEXT: string = 'Confirm Payment Method';

@Component({
  selector: 'app-alt-payment',
  templateUrl: './alt-payment.component.html',
  styleUrls: ['./alt-payment.component.css'],
  providers: [
    PaymentDropinService
  ]
})
export class AltPaymentComponent implements OnInit {
  @Output() dropinLoaded: EventEmitter<any> = new EventEmitter<any>();
  @Output() paymentStatus: EventEmitter<any> = new EventEmitter<any>();
  @Output() payButtonStatus: EventEmitter<any> = new EventEmitter<any>();

  @Input() clientTokenURL: string;
  @Input() createPurchaseURL: string;
  @Input() chargeAmount: number;
  @Input() chargeTitle: string;
  @Input() transactionId: string;

  // Optional inputs
  @Input() buttonText = 'Make Payment'; // to configure the pay button text
  @Input() allowChoose = false;
  @Input() showCardholderName = false;
  @Input() enablePaypalCheckout = true;
  @Input() enablePaypalVault = false;
  @Input() enableCVV = true;
  @Input() currency: string;
  @Input() locale: string;
  @Input() enabledStyle: any;// = 'bacb-primary-btn';
  @Input() disabledStyle: any;// = 'back-btn';
  @Input() hideLoader = false;

  public clientToken: string = 'sandbox_4x8wybmx_5vsr6bz3bmm6zpgs';
  public nonce: string = '';
  showDropinUI = true;
  errorMessage: string;

  showPayButton = false; // to display the pay button only after the dropin UI has rendered.
  clientTokenNotReceived = false; // to show the error, "Error! Client token not received."
  interval: any;
  instance: any;
  dropinConfig: any = {};
  enablePayButton = false;
  enablePayment = false;
  showLoader = true;
  // tslint:disable-next-line:max-line-length

  constructor(
    private service: PaymentService,
    private alertService: AlertService,
    private configureDropinService: PaymentDropinService,
    private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    if (this.enablePaypalCheckout && this.enablePaypalVault) {
      this.errorMessage = 'Please make sure either Paypal Checkout or Paypal Vault is set to true. Both cannot be true at the same time.';
    } else if (this.enablePaypalCheckout && !this.currency) { // user should provide currency for paypal checkout.
      this.errorMessage = 'Please provide the currency for Paypal Checkout. ex: [currency]="\'USD\'"';
    } else {
      this.createDropin();
    }
  }
  private form = document.getElementById('dropin-container');
  createDropin() {
    if (typeof braintree !== 'undefined') {
      this.dropinConfig.authorization = this.clientToken;
      this.dropinConfig.container = '#dropin-container';

      if (this.showCardholderName) {
        this.configureDropinService.configureCardHolderName(this.dropinConfig);
      }
      if (this.enablePaypalCheckout) {
        this.configureDropinService.configurePaypalCheckout(this.dropinConfig, this.chargeAmount, this.currency);
      }
      if (this.enablePaypalVault) {
        this.configureDropinService.configurePaypalVault(this.dropinConfig);
      }
      if (this.locale) {
        this.configureDropinService.configureLocale(this.dropinConfig, this.locale);
      }
      if (this.enableCVV) {
        this.configureDropinService.configureCVV(this.dropinConfig);
      }

      braintree.dropin.create(this.dropinConfig, (createErr, instance) => {
        if (createErr) {
          console.error('braintree.dropin.create', createErr);
          this.errorMessage = createErr;
          this.showLoader = false;
          return;
        }
        this.dropinLoaded.emit();

        this.showPayButton = true;
        this.showLoader = false;
        this.instance = instance;
        console.warn("Instance", instance);
        if (this.instance.isPaymentMethodRequestable()) {
          this.enablePayButton = true;
          this.payButtonStatus.emit(this.enablePayButton);
        }
        this.instance.on('paymentMethodRequestable', (event) => {
          console.log('paymentMethodRequestable', event);
          this.enablePayButton = true;
          this.enablePayment = event.paymentMethodIsSelected;
          this.payButtonStatus.emit(this.enablePayButton);
          this.changeDetectorRef.detectChanges();
        });
        this.instance.on('noPaymentMethodRequestable', (event) => {
          console.log('noPaymentMethodRequestable', event);
          this.enablePayButton = false;
          this.payButtonStatus.emit(this.enablePayButton);
          this.changeDetectorRef.detectChanges();
        });
      });
      clearInterval(this.interval);
    }
  }

  confirmPaymentMethod(): void {
    // So this is where JS gets WEIRD. Because we are passing in this callback function
    // we do not actually have access to the component, but the script executes in the
    // JS compiled component. So, we need to stash the nonce in the DOM itself so we
    // can use it later.
    this.instance.requestPaymentMethod( function (err, payload) {
      if (err) {
        console.error('Tokenize', err);
      }
      else {
        console.log('Payment payload', payload);
        document.getElementById('payment_nonce').setAttribute('value', payload.nonce);
      }
    });
    console.log('instance.requestPaymentMethod', this.instance);
  }
  pay(): void {
    console.log('PAY', document.getElementById('payment_nonce').getAttribute('value'));
    this.paymentStatus.emit(document.getElementById('payment_nonce').getAttribute('value'));
    // because we have the nonce - we want to allow the parent component to reset the CC form.
    // so let's emit the nonce so we can handle successful payment from there.

  }
  loaderImage = 'data:image/gif;base64,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';
}
