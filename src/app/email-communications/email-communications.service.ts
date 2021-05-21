import { Injectable } from '@angular/core';
import { BaseService } from '../_services';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { IEmail, mockEmails, Email } from './temp-model-interface-const';

@Injectable({
  providedIn: 'root'
})
export class EmailCommunicationsService extends BaseService {
  public emailArray: Observable<IEmail[]>;
  public selectedDetailEmail: Observable<IEmail>;
  public _selectedDetailEmail: BehaviorSubject<IEmail> = new BehaviorSubject<IEmail>(new Email().Export());
  constructor(private http: HttpClient) {
    super();
    this.emailArray = of(mockEmails).pipe(shareReplay(1));
    this.selectedDetailEmail = this._selectedDetailEmail.asObservable();
    //this.fetchEmailArray();

  }

  setSelectedDetailEmail(selectedEmail: IEmail){
    this._selectedDetailEmail.next(selectedEmail)
  }

  fetchEmailArray(){
    // This is where real data will be called from the backend, which is largely to be written/implemented asof 4.10.20
    //console.log('this is options' , httpOptions);
    //this.http.post<IEmail[]>('https://2058485.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=72&deploy=1',{"custId": "458616"}, httpOptions).pipe(shareReplay(1)).subscribe((c) => console.log("MessageListServerResponse: ", c));

  }

}

