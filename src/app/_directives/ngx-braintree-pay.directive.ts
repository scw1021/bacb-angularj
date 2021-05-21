import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';

import { PaymentComponent } from '../payment/payment.component';

@Directive({
  selector: '[ngxPay]'
})
export class NgxBraintreePayDirective implements OnInit, OnDestroy {



  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private paymentComponent: PaymentComponent) {

    // Disable the pay button initially. This will be enabled after the user fills the dropin information.
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', true);

    // Subscribe the payButtonStatus event to enable disable the pay button
    this.paymentComponent
      .payButtonStatus
      .subscribe((status: boolean) => {
        this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', !status);
      });

    // Handle click event for the pay button
    this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
      // this.paymentComponent.pay();
    });
  }

  ngOnInit() {
    // Set the text on the button to the buttonText property that was sent.
    // this.renderer.setProperty(this.elementRef.nativeElement, 'innerText', this.paymentComponent.buttonText);
  }

  ngOnDestroy() {
  }

}
