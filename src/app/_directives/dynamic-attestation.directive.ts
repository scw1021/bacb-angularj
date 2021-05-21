import { ComponentFactoryResolver, Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[DynamicAttestation]'
})
export class DynamicAttestationDirective {

  public constructor( private AttestResolver: ComponentFactoryResolver,
                      private AttestContainer: ViewContainerRef) { }

}
