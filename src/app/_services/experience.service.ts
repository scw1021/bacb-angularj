import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { IConfirm, IExperienceSupervision } from '../_interfaces';
import { map, shareReplay } from 'rxjs/operators';

import { ApplicationService } from './application.service';
import { AuthenticationService } from './authentication.service';
import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { Confirm } from '../_models';
import { HttpClient } from '@angular/common/http';
import { IExperience } from '../_interfaces/i-experience';
import { IResponseObject } from '../_interfaces/i-response-object';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService extends BaseService {

  // Subjects
  private _ExperienceSubject: BehaviorSubject<IExperience[]> = new BehaviorSubject<IExperience[]>( new Array<IExperience>() );
  private _CheckSubject: BehaviorSubject<IConfirm> = new BehaviorSubject<IConfirm>( new Confirm().Export() );
  private _SupervisionSubject: BehaviorSubject<IExperienceSupervision[]> = new BehaviorSubject<IExperienceSupervision[]>([]);

  // Observables
  public Experience$: Observable<IExperience[]> = this._ExperienceSubject.asObservable();
  public Check$: Observable<IConfirm> = this._CheckSubject.asObservable().pipe(shareReplay(1));
  public Supervision$: Observable<IExperienceSupervision[]> = this._SupervisionSubject.asObservable();


  constructor(
    private Http: HttpClient,
    private appService: ApplicationService,
    private authService: AuthenticationService,
    private azure: AzureHttpPostService
  ) {
    super();
  }

  public Check() : void {
    this.azure.post<IConfirm>(this.BaseUrl + "Experience/Check", {'AppId': this.appService.AppId} )
      .subscribe(
        (CheckNext: IConfirm) => {
          if (CheckNext && CheckNext.Response) {
            this._CheckSubject.next(new Confirm(CheckNext).Export());
          }
          else {
            this._CheckSubject.next(new Confirm({'Response': 'F', 'Message': 'No response from check function.'}).Export());
          }
        },
        CheckError => {

        },
        () => { // OnComplete

        }
      );
  };

  public Create(NewExperience: IExperience) : Observable<IConfirm> {
    // oh snap, did I just create a temp object with all the fields of the NewExperience and add the AppId so I don't have to touch our wildly fragile
    // front end? You BET I did
    return this.azure.post<IConfirm>(this.BaseUrl + "Experience/Create", {...NewExperience,...{'ApplicationId': this.appService.AppId}});
  }

  public Delete(ExpToRemove : IExperience) : Observable<IConfirm> {
    return this.azure.post<IConfirm>(this.BaseUrl + "Experience/Delete", {'Id': ExpToRemove.Id});
  }

  // public DeleteAll(AppId: string) : Observable<IConfirm> {
  //   return this.azure.post<IConfirm>(this.BaseUrl + "Experience/DeleteAll", {'AppId': AppId});
  // }

  public Read() : void {
    this.azure.post<IExperience[]>(this.BaseUrl + "Experience/Read",{'AppId' : this.appService.AppId})
      .subscribe(
        (ExperienceNext: IExperience[]) => {
          if (ExperienceNext && ExperienceNext.length) {
            console.log('Experience READ', ExperienceNext)
            this._ExperienceSubject.next(ExperienceNext)
          }
        },
        ExperienceError => {

        },
        () => { // OnComplete

        }
      );
  };

  public Update(SelectedExperience : IExperience) : Observable<IConfirm> {
    return this.azure.post<IConfirm>(this.BaseUrl + "Experience/Update",
    { ...SelectedExperience,...{'ApplicationId': this.appService.AppId} });
  }
  public CreateSupervisor(Supervisor: IExperienceSupervision) : Observable<IConfirm> {
    return this.azure.post<IConfirm>(this.BaseUrl + "Experience/CreateSupervision", Supervisor);
  }

  public DeleteSupervisor(Supervisor: IExperienceSupervision) : Observable<IConfirm> {
    return this.azure.post<IConfirm>(this.BaseUrl + "Experience/DeleteSupervision", Supervisor);
  }
  public UpdateSupervisionSubject(obj: IExperienceSupervision[]) {
    this._SupervisionSubject.next(obj);
  }
}
