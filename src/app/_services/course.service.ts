import { BehaviorSubject, Observable, ReplaySubject, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators'

import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { ICourse } from '../_interfaces/i-course';
import { IListObject } from '../_interfaces';
import { IResponseObject } from '../_interfaces/i-response-object';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CourseService extends BaseService {

  // Subject
  private _CourseSubject: BehaviorSubject<ICourse[]> = new BehaviorSubject<ICourse[]>(new Array<ICourse>());

  // Observable
  public Course$: Observable<ICourse[]> = this._CourseSubject.asObservable();

  public constructor(private Http: HttpClient, private azure: AzureHttpPostService,) {
    super()
  };

  public Find(AppID: string, CourseID: string) : Observable<ICourse> {
    this.Read(AppID);
    return this.Course$
      .pipe(
        map((CourseMap : ICourse[]) => CourseMap.find((CourseFind : ICourse) => CourseFind.Id == CourseID))
      )
  }

   public Read(AppID: string) : void {
         // Killed to unFk the Console.logs mm 9.2.20
    return null;
    this.azure.post<IResponseObject<ICourse>>(this.BaseUrl + "/POST/224/Read", {'AppId': AppID})
      .subscribe(
        (CourseNext: IResponseObject<ICourse>) => {
          this._CourseSubject.next(CourseNext.Array)
        },
        CourseError => {

        },
        () => { // OnComplete

        }
      )
   }
}
