import { BehaviorSubject, Observable } from 'rxjs';
import { IAppType, ICertType, IConfirm } from '../_interfaces';

import { Application } from './application';

export class AppData {
    public CertType$: Observable<ICertType> = null;
    public AppType$: Observable<IAppType> = null;
    public AppId$: BehaviorSubject<string> = null;
    public Check: Observable<IConfirm>[] = [];
    public Application$: Observable<Application> = null;

    // Vestigial element, we don't even have an interface
    public constructor() {};

    public Erase() : void {
        this.CertType$ = null;
        this.AppType$ = null;
        this.AppId$ = null;
        this.Check.slice(0,this.Check.length);
        this.Application$ = null;
    }
}
