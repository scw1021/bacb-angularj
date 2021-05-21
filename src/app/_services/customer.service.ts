import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { ICustomer, ICustomerExt } from '../_interfaces/i-customer';
import { map, shareReplay, tap } from 'rxjs/operators';

import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { IResponseObject } from '../_interfaces';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomerService extends BaseService {

  // Subject
  private _CustomerSubject: BehaviorSubject<ICustomer[]> = new BehaviorSubject<ICustomer[]>( new Array<ICustomer>() );
  private _SelectedCustomer: BehaviorSubject<ICustomerExt> = new BehaviorSubject<ICustomerExt>(null);
  // Observable
  public Customer$: Observable<ICustomer[]> = this._CustomerSubject.asObservable();
  public SelectedCustomer$: Observable<ICustomerExt> = this._SelectedCustomer.asObservable().pipe(shareReplay(1));

  constructor(
    private Http: HttpClient,
    private azure: AzureHttpPostService
  ) {
    super();
    this.ReadAll();
  }

  public Find(BACBID: string) : Observable<ICustomer> {
    return this.Customer$.pipe(map((ResponseMap : ICustomer[]) => ResponseMap.find((CustomerFind : ICustomer) => CustomerFind.BACBID == BACBID)));
  }

  public ReadAll() : void {
    this.Http.get<ICustomer[]>(this.BaseUrl + "PersonalInfo/GetAllCustomers")
      .subscribe(
        (CustomerNext: ICustomer[]) => {
          if (CustomerNext) {
            this._CustomerSubject.next(CustomerNext)
          }
        },
        CustomerError => {

        },
        () => { // OnComplete

        }
      );
  };
  public Read(id: string): void {
    this.azure.post<ICustomerExt>(this.BaseUrl + 'PersonalInfo/GetCustomer', {Id: id})
    .subscribe(
      (response: ICustomerExt) => {
        this._SelectedCustomer.next(response);
      }
    )
  }
  public Customer(id: string): Observable<ICustomerExt> {
    return this.azure.post<ICustomerExt>(this.BaseUrl + 'PersonalInfo/GetCustomer', {Id: id})
  }
}


