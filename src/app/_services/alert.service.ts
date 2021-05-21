import { BehaviorSubject, Observable, ReplaySubject, of, timer } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { debounceTime, first, take, tap } from 'rxjs/operators';

import { AlertObject } from '../_models';
import { IAlertObject } from '../_interfaces';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class AlertService {
    private subject = new BehaviorSubject<IAlertObject>(new AlertObject);
    private keepAfterNavigationChange = false;

    public constructor(private router: Router) {
        // clear alert message on route change
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (this.keepAfterNavigationChange) {
                    // only keep for a single location change
                    this.keepAfterNavigationChange = false;
                } else {
                    // clear alert
                    this.subject.next(new AlertObject);
                }
            }
        });
    }

    public success(message: string, keepAfterNavigationChange = false) {
      console.log('Success: ' + message);
      this.keepAfterNavigationChange = keepAfterNavigationChange;
      //this.subject.next(new AlertObject('success', message));
      //window.alert('OHSHOOT, success'+ message)
      this.setTimer();
    }

    public error(input: string | {}, keepAfterNavigationChange = false) {
      console.log('Error: ' + input);
        let message: string = ""
      if(typeof(input) == "object") {
          Object.entries(input).forEach((objectProp) => message += objectProp[0] + ": " + objectProp[1])
        } else {
          message = input.toString();
        }
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next(new AlertObject('error', message));
        this.setTimer();
    }
    public alert(message: string, keepAfterNavigationChange = false) {
      console.log('Alert: ' + message);
      this.keepAfterNavigationChange = keepAfterNavigationChange;
      this.subject.next(new AlertObject('alert', message));
  }
    public clear() {
      this.subject.next(new AlertObject('',''));
    }
    public getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
    public loading(): void {
      this.subject.next(new AlertObject('loading', ''));
    }
    private setTimer() {
      // 10 seconds? That enough?
      timer(10000)
      .subscribe(
        () => {
          this.clear();
        }
      );
    }
}

