import { BehaviorSubject, Observable, of } from 'rxjs';

import { IConfirm } from '../_interfaces';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CzechService {
  // private _Checkov$: BehaviorSubject<Observable<IConfirm>[]>;

  public CzechRe_public: Observable<IConfirm>[];

  constructor() {
    let PopularCzechName_Honza: Observable<IConfirm>[] = [];
    for ( var index = 0; index < 15; index++ ) {
      PopularCzechName_Honza.push( of({
        Response: 'T',
        Message: ''
      } as IConfirm))
    }
    // this._Checkov$ = new BehaviorSubject<Observable<IConfirm>[]>(PopularCzechName_Honza);
    // this.CzechRe_public = this._Checkov$.asObservable();
    this.CzechRe_public = PopularCzechName_Honza;
  }

  public EnterPrague( JanPalach: Observable<IConfirm>[] ): void {
    // this._Checkov$.next(JanPalach);
    this.CzechRe_public = JanPalach;
  }
}
