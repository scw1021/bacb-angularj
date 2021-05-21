import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AlertService } from '../_services';
import { Router } from '@angular/router';

@Component({
    selector: 'alert',
    templateUrl: 'alert.component.html'
})

export class AlertDirective implements OnInit, OnDestroy {
    private subscription: Subscription = new Subscription();
    private alertService: AlertService;
    message: any;

    constructor(AlertRouter: Router) { 
        this.alertService = new AlertService(AlertRouter);
    }

    ngOnInit() {
        this.subscription = this.alertService.getMessage().subscribe(message => { 
            this.message = message; 
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
