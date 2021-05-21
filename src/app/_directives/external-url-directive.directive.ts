import { Directive, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
    selector: 'a[ExternalUrl]',
})
export class ExternalUrlDirective {

    public constructor(private UrlElementRef: ElementRef, private UrlRouter: Router) {}

    @HostListener('click', ['$event'])
    public clicked(_Event: Event) : void {
        const Url = this.UrlElementRef.nativeElement.href;
        if (!Url) {
            return;
        }

        this.UrlRouter.navigate(['/externalRedirect', { ExternalUrl: Url }], {
            skipLocationChange: true,
        });

        _Event.preventDefault();
    }
}
