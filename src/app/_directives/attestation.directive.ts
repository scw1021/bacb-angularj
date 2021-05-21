import { ComponentFactoryResolver, Directive, Input, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[Attestation]'
})
export class AttestationDirective {

  public constructor(private AttestResolver: ComponentFactoryResolver,
                     private AttestContainer: ViewContainerRef) { }


}
