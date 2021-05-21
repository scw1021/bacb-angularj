import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, share, shareReplay, tap } from 'rxjs/operators';

import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { IConfirm } from '../_interfaces';
import { IInvoice } from '../_interfaces/i-invoice';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaymentService extends BaseService {

  private InvoiceSubject: BehaviorSubject<IInvoice[]> = new BehaviorSubject<IInvoice[]>([]);
  public Invoices$: Observable<IInvoice[]>;
  private SelectedInvoice$: BehaviorSubject<IInvoice> = new BehaviorSubject<IInvoice>(null);
  public Invoice$:Observable<IInvoice> = this.SelectedInvoice$.asObservable().pipe(shareReplay(1));
  constructor(private azure: AzureHttpPostService) {
    super();
    this.Invoices$ = this.InvoiceSubject.asObservable().pipe(shareReplay(1));
    this.Read();
  }
  private Read(){
    this.azure.get<IInvoice[]>(this.BaseUrl + 'Payment/Read').pipe(
      tap(x => this.InvoiceSubject.next(x))
    ).subscribe();
  }
  public MakePayment(nonce: string): void {
    let invoice = this.SelectedInvoice$.value;
    this.azure.post<string>(this.BaseUrl + 'Payment/Create', {
      TransactionId: invoice.Id,
      Nonce: nonce,
      ChargeAmount: invoice.Version.Price,
      DeviceData: null // maybe we use this later? if we want more data?
    }).pipe(
      tap( x=> console.log(x) )
    ).subscribe(
      response => {
        console.log('MakePayment', response)
        this.SelectedInvoice$.next(null);
        this.Read();
      }
    );
    console.log('FIN');
  }
  public Next(invoice: IInvoice) {
    this.SelectedInvoice$.next(invoice);
  }

}
