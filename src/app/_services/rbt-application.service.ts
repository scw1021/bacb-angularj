import { ApplicationService, AuthenticationService } from '.';
import { BehaviorSubject, Observable } from 'rxjs';
import { IConfirm, IListObject } from '../_interfaces';
import { ListObject, ResponseObject } from '../_models';
import { map, pluck, shareReplay, tap } from 'rxjs/operators';

import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { ICompetency } from '../_interfaces/i-competency';
import { IResponsibleRelationship } from '../_interfaces/i-responsible-relationship';
import { Injectable } from '@angular/core';
import { ResponsibleRelationship } from '../_models/responsible-relationship';

@Injectable({
  providedIn: 'root'
})

export class RbtApplicationService extends BaseService {
  private _TrainingsSubject: BehaviorSubject<ResponsibleRelationship> = new BehaviorSubject<ResponsibleRelationship>(new ResponsibleRelationship());
  public Trainings$: Observable<ResponsibleRelationship> = this._TrainingsSubject.asObservable().pipe(shareReplay(1));
  private _CompetencySubject: BehaviorSubject<ICompetency> = new BehaviorSubject<ICompetency>(null);
  public Competency$: Observable<ResponsibleRelationship> = this._CompetencySubject.asObservable().pipe(
    map(x => { return new ResponsibleRelationship(x as IResponsibleRelationship)}), shareReplay(1)
  ); // YEET this actually works hfs
  public CompetencyRelationship$: Observable<ResponsibleRelationship>;
  private _BackgroundCheckSubject: BehaviorSubject<ResponsibleRelationship> = new BehaviorSubject<ResponsibleRelationship>(null);
  public BackgroundCheck$: Observable<ResponsibleRelationship> = this._BackgroundCheckSubject.asObservable().pipe(shareReplay(1));
  private _CompetencySkillListSubject: BehaviorSubject<IListObject[]> = new BehaviorSubject<IListObject[]>(new Array<IListObject>());
  public CompetencySkillList$: Observable<IListObject[]> = this._CompetencySkillListSubject.asObservable().pipe(shareReplay(1));
  public SkillsAssessedSubject$: BehaviorSubject<IListObject[]> = new BehaviorSubject<IListObject[]>([]);
  public SkillsAssessedObservable$: Observable<IListObject[]> = this.SkillsAssessedSubject$.asObservable().pipe(shareReplay(1));
  constructor(
    private authService: AuthenticationService,
    private azure: AzureHttpPostService,
    private applicationService: ApplicationService
  ) {
    super();
    this.CompetencyRelationship$ = this._CompetencySubject.asObservable()
    .pipe(tap(x=>console.log('competency',x)),map( (_competency: ICompetency) => {
      if ( _competency ) {
        this.SkillsAssessedSubject$.next(_competency.Skills)
        return new ResponsibleRelationship(_competency);
      }
      return new ResponsibleRelationship();
    }),tap(x=>console.log('competency2',x)),shareReplay(1))
    this._LoadSkillList();
  }

  // RBT 40 Hour Training Elements
  public CreateTraining(objRequest: IResponsibleRelationship): Observable<IConfirm> {
    return this.azure.post<IConfirm>(this.BaseUrl + 'ResponsibleRelationship/UpsertTraining',
    {CustomerId: this.authService.CustomerIdSubject.value, Training: objRequest, Type: '100000001'});
  }
  public UpdateTraining(objRequest: IResponsibleRelationship): Observable<IConfirm> {
    // console.log('Update Training: ', objRequest);
    return this.azure.post<IConfirm>(this.BaseUrl + 'ResponsibleRelationship/UpsertTraining', {Training: objRequest, Type: '100000001'});
  }

  public ReadTraining(): void {
    // It's a 3 because that's the list item ID. For 40 hr training.
    this.azure.get<any>(this.BaseUrl + 'ResponsibleRelationship/ReadTraining')
    .pipe(
      tap(_response => console.log('Piped Training: ', _response)),
      // pluck('Trainings'),
      map(_response => _response.length ? _response[0] : null),
      tap( (_training: IResponsibleRelationship ) => {
          this._TrainingsSubject.next(new ResponsibleRelationship( _training));
      })
    ).subscribe();
  }

  // RBT Competency Examination Elements
  public UpsertCompetency(objRequest: IResponsibleRelationship, skillList: IListObject[]): Observable<IConfirm> {
    console.error('the fuck is this', objRequest);
    console.log('UpsertCompetency ObjRequest: ', objRequest);
    console.log('UpsertCompetency SkillList: ', skillList)
    console.log('UpsertCompetency AppId: ', this.applicationService.AppId);
    return this.azure.post<IConfirm>(this.BaseUrl + 'ResponsibleRelationship/UpsertCompetency',
    {Relationship: objRequest, Skills: skillList, AppId: this.applicationService.AppId});
  }

  public ReadCompetency(): void {
    this.azure.post<ICompetency[]>(this.BaseUrl + 'ResponsibleRelationship/ReadCompetency', {AppId: this.applicationService.AppId})
    .pipe(
      tap(_response => {console.log('Piped Competency: ', _response)}),
      // pluck('Trainings'),
      tap( (_competency: ICompetency[] ) => {
        if ( _competency && _competency.length ) {
            this._CompetencySubject.next(_competency[0]);
            this.SkillsAssessedSubject$.next(_competency[0].Skills)
        }
      })
    ).subscribe();
  }
  public get CompetencyValue(): ICompetency {
    return this._CompetencySubject.value;
  }

  // RBT Background Check Elements
  public CreateBackgroundCheck(objRequest: IResponsibleRelationship): Observable<IConfirm> {
    return this.azure.post<IConfirm>(this.BaseUrl + 'ResponsibleRelationship/UpsertBackgroundCheck', {Relationship: objRequest, AppId: this.applicationService.AppId});
  }
  public UpdateBackgroundCheck(objRequest: IResponsibleRelationship): Observable<IConfirm> {
    return this.azure.post<IConfirm>(this.BaseUrl + 'ResponsibleRelationship/UpsertBackgroundCheck', {Relationship: objRequest, AppId: this.applicationService.AppId});
  }

  public ReadBackgroundCheck(): void {
    this.azure.post<IResponsibleRelationship[]>(this.BaseUrl + 'ResponsibleRelationship/ReadBackgroundCheck', {AppId: this.applicationService.AppId})
    .pipe(
      tap(_response => {console.log('Piped BackgroundCheck: ', _response)}),
      // pluck('Trainings'),
      tap( (_background: IResponsibleRelationship []) => {
        if ( _background !== null ) {
            this._BackgroundCheckSubject.next(new ResponsibleRelationship( _background[0]));
        }
      })
    ).subscribe();
  }

  // RBT Competency Skill List Elements
  public _LoadSkillList(): void {
    this.azure.get<IListObject[]>(this.BaseUrl + 'ResponsibleRelationship/ReadCompetencySkillsList')
    .pipe(
      tap(x=>console.warn('Skills List', x)),
      // While pluck is easier, I suppose we need to null-check anyway?
      map( (_response: IListObject[] ) => {
        if ( _response ) {
          return _response;
        }
        else {
          return [
            { Id: 1, Value: 'Measurement 1'},
            { Id: 2, Value: 'Measurement 2'}
          ];
        }
      }),
    )
    .subscribe(
      (_response: IListObject[]) => {
        this._CompetencySkillListSubject.next(_response);
      }
    )
  }
}
