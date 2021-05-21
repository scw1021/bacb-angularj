import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { ICourseSequence } from 'src/app/_interfaces/i-course-sequence';
import { IResponseObject } from 'src/app/_interfaces/i-response-object';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CourseSequenceService extends BaseService {

  // Subjects
  private _CourseSequenceSubject: BehaviorSubject<ICourseSequence[]> = new BehaviorSubject<ICourseSequence[]>(new Array<ICourseSequence>());

  // Observable
  public CourseSequence$: Observable<ICourseSequence[]> = this._CourseSequenceSubject.asObservable();

  public constructor(private Http: HttpClient,private azure: AzureHttpPostService,) {
    super()
  };

  public Find(InstitutionID: string, CourseSequenceID : string) : Observable<ICourseSequence> {
    this.Read(InstitutionID);
    return this.CourseSequence$
      .pipe(
        map((ResponsibleObjectMap : ICourseSequence[]) => ResponsibleObjectMap.find((ArrayFind : ICourseSequence) => ArrayFind.Id == CourseSequenceID))
      )
  }

  public Read(InstitutionID: string) : void {
    this.azure.post<IResponseObject<ICourseSequence>>(this.BaseUrl + "/CourseSequences.ss?param=Read", {'Id': InstitutionID})
      .subscribe(
        (CourseSequenceNext: IResponseObject<ICourseSequence>) => {
          this._CourseSequenceSubject.next(CourseSequenceNext.Array)
        },
        CourseSequenceError => {

        },
        () => { // OnComplete

        }
      )
  }

}
