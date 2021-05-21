import { Component, OnInit } from '@angular/core';
import { IConfirm, IListObject } from 'src/app/_interfaces';
import { Observable, combineLatest } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

import { AlertService } from 'src/app/_services';
import { ApplicationCompletionService } from 'src/app/_services/application-completion.service';
import { FileMgmtService } from 'src/app/_services/file-mgmt.service';
import { IResponsibleRelationship } from 'src/app/_interfaces/i-responsible-relationship';
import { RbtApplicationService } from 'src/app/_services/rbt-application.service';
import { RbtBaseTabComponent } from '../rbt-base-tab.component';

@Component({
  selector: 'competency-assessment',
  templateUrl: './competency-assessment.component.html',
  styleUrls: ['./competency-assessment.component.css']
})
export class CompetencyAssessmentComponent extends RbtBaseTabComponent implements OnInit {

  // This belongs in the service
  // protected SkillsAssessedSubject: BehaviorSubject<IListObject[]>;

  constructor(
    _alertService: AlertService,
    _completionService: ApplicationCompletionService,
    _fileService: FileMgmtService,
    _rbtService: RbtApplicationService,
  ) {
    super( _alertService, _completionService, _fileService, _rbtService );
    this.FileTypes = [{
      Type: {Code:'RBTA', Description:'RBT Supervisor Attestation', Id:'492303ca-ff03-eb11-a813-00224808102a'},
      RequirementMet: 'F'
    }];
    // this.SkillsAssessedSubject = new BehaviorSubject<IListObject[]>([]);
   }

  ngOnInit() {
    // this.__AttestationCheck$ = this.attestService.CheckObservable('4').pipe(tap(x=>console.log('ass',x)));

    // this.completionService.Check$[0] = combineLatest([
    //   this.FileCheck.asObservable(),
    //   this.RelationshipCheck.asObservable(),
    //   this.AttestationCheck.asObservable()
    // ]).pipe(
    //   delay(0), // This delay ensures the observable first emits once everything is loaded.
    //   map( (_checks: IConfirm[]) => {
    //     let response = 'T';
    //     _checks.forEach( _check => {
    //       // console.log('Check: ', _check);
    //       if (_check.Response == 'F') {
    //         response = 'F';
    //         //return { Response: 'F', Message: '' } as IConfirm;
    //       }
    //     });
    //     // console.log('C:', response);
    //     return { Response: response, Message: '' } as IConfirm;
    //   })
    // );
    // Technically, this should happen in the Summary component, which is always visible
    // this.rbtService.ReadCompetency(this.InstAppData.AppId$.getValue());
  }

  public EvaluateEventResponse(event: IResponsibleRelationship): void {
    // console.log('Competency Eval: ', event);
    if ( this.rbtService.SkillsAssessedSubject$.value == [] ) {
      this.alertService.error('You must select client skills assessed');
      return;
    }
    this.rbtService.UpsertCompetency( event, this.rbtService.SkillsAssessedSubject$.value )
    .pipe(tap(_val => console.log('Event Response: ', _val)))
    .subscribe(
      (_response: IConfirm) => {
        if ( _response && _response.Response == 'T' ) {
          this.RelationshipCheck.next(_response);
          this.IsSubmitted = false;
          this.alertService.success('Competency Assessment submitted sucessfully');
        }
        else {
          console.log(_response ? _response.Message : 'Competency Assessment Service Update Failed');
          this.alertService.error('Competency Assessment failed to submit');
        }
      }
    )
  }

  public EvaluateSkillsResponse(event: IListObject[]): void {
    if ( event && event.length > 0 ) {
      // this.AttestationCheck.next({Response: 'T', Message: 'Skills Selected'});
      this.rbtService.SkillsAssessedSubject$.next(event);
    }
    else {
      // this.AttestationCheck.next( {Response: 'F', Message: 'No Competency Skills Selected'} );
    }
  }
}
