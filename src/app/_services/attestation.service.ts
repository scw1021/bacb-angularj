import { AttestQuestion, Confirm, ResponseObject } from '../_models';
import { BehaviorSubject, Observable, ReplaySubject, combineLatest, of } from 'rxjs';
import { CONFIRM_SUCCESS, IConfirm, IConfirmDefault } from '../_interfaces/i-confirm';
import { filter, map, shareReplay, subscribeOn, tap } from 'rxjs/operators';

import { ApplicationService } from './application.service';
import { AttestAnswer } from '../_models/attest-answer';
import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IAttestAnswer } from '../_interfaces/i-attest-answer';
import { IAttestQuestion } from '../_interfaces/i-attest-question';
import { IAttestationObject } from '../_interfaces/i-attestation-object';
import { IResponseObject } from '../_interfaces/i-response-object';
import { Injectable, } from '@angular/core';

//import { AttestationComponent } from '../attestation/attestation.component';


type AttestationSection = {[questionid:string]:IAttestation};
type AttestationSections = {[sectionid:string]: {Check: boolean, Group: AttestationSection}};
export interface IAttestation {
  Answer: IAttestAnswer,
  Question: IAttestQuestion,
  FormControl: FormControl
}

@Injectable({
  providedIn: 'root'
})
export class AttestationService extends BaseService {

  // Subjects
  private _QuestionSubject: BehaviorSubject<IAttestQuestion[]> = new BehaviorSubject<IAttestQuestion[]>([]);
  private _AnswerSubject: BehaviorSubject<IAttestAnswer[]> = new BehaviorSubject<IAttestAnswer[]>([]);

  private _CheckSubjectArray: BehaviorSubject<IConfirm>[] = [];

  // Observables
  public Question$ : Observable<IAttestQuestion[]> = this._QuestionSubject.asObservable().pipe(shareReplay(1));
  public Answer$ : Observable<IAttestAnswer[]> = this._AnswerSubject.asObservable().pipe(shareReplay(1));

  // NWO
  private _AttestationSubject: BehaviorSubject<AttestationSections> = new BehaviorSubject<AttestationSections>({});
  public Attestations$: Observable<AttestationSections>;

  // Local variable, for clarity of use within service
  private AttestationSections: AttestationSections = {};

  public constructor(
    private azure: AzureHttpPostService,
    private appService: ApplicationService
  ) {
    super();
    this.ReadQuestions();
    // Set up the mgmt of checks immediately
    this.Attestations$ = this._AttestationSubject.asObservable().pipe(
      map( Sections => {
        for ( var index in Sections ) {
          // Like most of my life, I start positive until I find the negative
          let response = true;
          let Group = Sections[index].Group;
          for( var Question in Group ) {
            if( Group[Question].Answer == null ) {
              response = false;
            }
            // We also need to check that if we DO have a response,
            // that response is allowed. Looking at YOU T&C
            else if ( Group[Question].Question.CanBeFalse == 'F'
              && Group[Question].Answer.Answer == 'F' ) {
                response = false;
            }
          }
          // Commit the result
          Sections[index].Check = response;
        }
        // Propogate the slight changes
        // console.warn(Sections);
        return Sections;
      }),
      shareReplay(1));

    // Convert Questions from CDS to usable FE material
    // I will need to fix this to run more frequently, as this will only run once

    // With our Questions sorted, let's add existing Answers if we have them
    combineLatest([this.Question$, this.Answer$]).pipe(
      // Load Formgroup
      tap( ([questions, answers] ) => {
        this.AttestationSections = {};
        // update questions.
        questions.forEach(question => {
          // only GaS about our application, this also uses ACTUAL IDs, not NS
          if ( this.appService.SelectedApplication.AppType.Id == question.AQAppType.Id
            && this.appService.SelectedApplication.CertType.Id == question.AQCertType.Id) {

            // ensure we have Section maps created
            if ( !this.AttestationSections[question.Section] ) {
              this.AttestationSections[question.Section] = {Group: {}, Check: false};
            }
            // with that guaranteed, let's populate
            this.AttestationSections[question.Section].Group[question.Id] = {
              Question: question, Answer: null, FormControl: new FormControl()
            };
          }
        });
        answers.forEach( answer => {
          for ( var index in questions ) {
            if ( questions[index].Id == answer.QuestionId ) {
              // EasyRef is the Attestation indexed by QuestionID
              let easyRef = this.AttestationSections[questions[index].Section].Group[questions[index].Id];
              easyRef.Answer = answer;
              // Let's apply the answer too
              if ( easyRef.Question.CanBeFalse ) {
                // If it can be false, we seed the drop down value
                easyRef.FormControl.setValue(answer.Answer);
              }
              else {
                // Else we seed the checkbox value
                easyRef.FormControl.setValue(answer.Answer == 'T');
              }
            }
          }
        })
        // when this function completes, we need to update the service
        this._AttestationSubject.next(this.AttestationSections);
      }),
    ).subscribe(
      value => {

      }
    );

  }

  public GetSection(section: string): Observable<AttestationSection> {
    return this.Attestations$.pipe(
      // tap(x=>console.log("GetSection:"+section, x)),
      map(value => value[section]?.Group), shareReplay(1));
  }





  // Unused function
  // public Check(CertTypeID: string, AppTypeID: string, AppID: string, SectionID: string) : Observable<IConfirm> {
  //   return this.azure.post<IConfirm>(this.BaseUrl + "Attestations/Check", { 'AppId' : AppID, 'SectionId': SectionID, 'CertTypeId': CertTypeID, 'AppTypeId': AppTypeID })
  //     .pipe(
  //       tap(
  //         (CheckNext: IConfirm) => {
  //           // console.log(CheckNext);
  //           while (this._CheckSubjectArray.length <= parseInt(SectionID,10)) {
  //             this._CheckSubjectArray.push(new BehaviorSubject<IConfirm>(new Confirm().Export()));
  //           }
  //           if (CheckNext && CheckNext.Response) {
  //             this._CheckSubjectArray[SectionID].next(new Confirm(CheckNext).Export());
  //           }
  //           else {
  //             this._CheckSubjectArray[SectionID].next(new Confirm({'Response': 'F', 'Message': 'No response from check function.'}).Export());
  //           }
  //         }
  //       )
  //     );
  // }
  public SeedCheckSubject(count: number): void {
    for( var index = 0; index < count; index++) {
      this._CheckSubjectArray.push(new BehaviorSubject<IConfirm>(IConfirmDefault))
    }
  }
  public CheckObservable(section: string): Observable<IConfirm> {
    // console.log('CheckObservable init ' + section);
    return this.Attestations$.pipe(
      map( value => {
        // console.warn('Check'+section, value[section]?.Check)
        if ( value[section]?.Check ) {
          // console.log('a');
          return CONFIRM_SUCCESS;
        }
        else {
          // console.log('b');
          return IConfirmDefault;
        }
      }),
      shareReplay(1)
    )
  }
  public CheckSubjectNext(SectionID: string, value: IConfirm) {
    // Love me an off-by-one error, it's why I always pair program
    this._CheckSubjectArray[+SectionID - 1 ].next(value)
  }
  // also unused
  // public Check$(SectionID) : Observable<IConfirm> {
  //   while (this._CheckSubjectArray.length <= parseInt(SectionID,10)) {
  //     this._CheckSubjectArray.push(new BehaviorSubject<IConfirm>(new Confirm().Export()));
  //   }
  //   return this._CheckSubjectArray[SectionID].asObservable();
  // }

  // unused
  // public CreateAll(Answers: AttestAnswer []) : Observable<IConfirm> {
  //   let AnswerArray : IAttestAnswer [];
  //   for (let InstAnswer of Answers){
  //     AnswerArray.push(InstAnswer.Export())
  //   }
  //   return this.azure.post<IConfirm>(this.BaseUrl + "Attestations/CreateAll", { 'Attestations' : AnswerArray });
  // }

  // public Delete(AttestId : string) : Observable<IConfirm> {
  //   return this.azure.post<IConfirm>(this.BaseUrl + "Attestations/Delete", {'Id' :AttestId});
  // }

  public GetQuestionsByType(CertTypeID: string, AppTypeID: string) : Observable<IAttestQuestion[]> {
    return this.Question$.pipe(
      // tap(_x => console.log("GQBT", _x, CertTypeID, AppTypeID)),
      map((QuestionMap : IAttestQuestion[]) => QuestionMap.filter(
      (QuestionFilter : IAttestQuestion) => QuestionFilter.AQCertType.Id == CertTypeID && QuestionFilter.AQAppType.Id == AppTypeID)));
  }

  public GetQuestionsBySection(CertTypeID: string, AppTypeID: string, SectionID: string) : Observable<IAttestQuestion[]> {
    return this.GetQuestionsByType(CertTypeID, AppTypeID).pipe(
      // tap(_x => console.log("GQBS", _x, SectionID)),
      map((QuestionMap: IAttestQuestion[]) => QuestionMap.filter(
      (QuestionFilter: IAttestQuestion) => QuestionFilter.Section == SectionID)));
  }

  public GetAnswersByQuestion(QuestionID : string) : Observable<IAttestAnswer> {
    return this.Answer$.pipe(
      map((AnswerMap : IAttestAnswer[]) => AnswerMap.find((AnswerFilter : IAttestAnswer) => AnswerFilter.QuestionId == QuestionID)));
  }

  // RVI - I don't think we use this, and it will be hard to implement in CDS, so rm -rf
  // public GetAnswersBySection(SectionID: string) : Observable<IAttestAnswer[]> {
  //   return this.Answer$.pipe(map((AnswerMap: IAttestAnswer[]) => AnswerMap.filter((AnswerFilter: IAttestAnswer) => AnswerFilter.SectionId === SectionID)))
  // }

  public Create(Answer: IAttestAnswer) : Observable<IConfirm> {
    Answer.AppId = this.appService.AppId;
    return this.azure.post<IConfirm>(this.BaseUrl + "Attestations/Create", Answer);
  }
  public Update(answer: IAttestAnswer) : Observable<IConfirm> {
    console.warn('ANSWER', answer);
    return this.azure.post<IConfirm>(this.BaseUrl + "Attestations/Update", answer);
  }

  public ReadAnswers() : void {
    // console.log('AttServ ReadAnswers');
    this.azure.post<IAttestAnswer[]>(this.BaseUrl + "Attestations/ReadAnswer", {"AppId" : this.appService.AppId})
    // .pipe(tap(console.log))
      .subscribe(
        (AnswerNext: IAttestAnswer[]) => {
          // console.log(AnswerNext)
          if (AnswerNext&& AnswerNext.length) {
            this._AnswerSubject.next(AnswerNext)
          }
          else {
            this._AnswerSubject.next([]);
          }
        },
        AnswerError => {

        },
        () => { // OnComplete

        }
      );
  };

  public ReadQuestions() : void {
    this.azure.get<IAttestQuestion[]>(this.BaseUrl + "Attestations/ReadQuestion")
      // .pipe(tap( _value => {console.log('Questions:', _value )}))
      .subscribe(
        (QuestionNext: IAttestQuestion[]) => {
          if (QuestionNext && QuestionNext.length) {
            this._QuestionSubject.next(QuestionNext)
          }
        },
        QuestionError => {

        },
        () => { // OnComplete
        }
      )
  }

}
