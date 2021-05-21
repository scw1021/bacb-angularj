import { AlertService, AttestationService } from 'src/app/_services';
import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

import { ApplicationCompletionService } from 'src/app/_services/application-completion.service';
import { FileMgmtService } from 'src/app/_services/file-mgmt.service';
import { IConfirm } from 'src/app/_interfaces';
import { IResponsibleRelationship } from 'src/app/_interfaces/i-responsible-relationship';
import { RbtApplicationService } from 'src/app/_services/rbt-application.service';
import { RbtBaseTabComponent } from '../rbt-base-tab.component';

@Component({
  selector: 'background-check',
  templateUrl: './background-check.component.html',
  styleUrls: ['./background-check.component.css']
})
export class BackgroundCheckComponent extends RbtBaseTabComponent implements OnInit {

  constructor(
    _alertService: AlertService,
    _completionService: ApplicationCompletionService,
    _fileService: FileMgmtService,
    _rbtService: RbtApplicationService,
    private attestService: AttestationService
  ) {
    super( _alertService, _completionService, _fileService, _rbtService );
    this.FileTypes = [{
      Type: {Code: 'RBTB',Description:'RBT Background Check', Id:'7cf56caa-0f0f-eb11-a813-000d3a5a7103'},
      RequirementMet: 'F'
    }];
  }

  ngOnInit() {
    this.__AttestationCheck$ = this.attestService.CheckObservable('5').pipe(tap(x=>console.log('BGC',x)));
    // this.completionService.Check$[0] = combineLatest([
    //   this.FileCheck.asObservable(),
    //   this.RelationshipCheck.asObservable(),
    //   this.AttestationCheck.asObservable()
    // ]).pipe(
    //   delay(0), // This delay ensures the observable first emits once everything is loaded.
    //   map( (_checks: IConfirm[]) => {
    //     let response = 'T';
    //     _checks.forEach( _check => {
    //       if (_check.Response == 'F') {
    //         response = 'F';
    //         //return { Response: 'F', Message: '' } as IConfirm;
    //       }
    //     });
    //     // console.log('B:', response);
    //     return { Response: response, Message: '' } as IConfirm;
    //   })
    // );
    // Technically, this should happen in the Summary component, which is always visible
    // this.rbtService.ReadBackgroundCheck(this.InstAppData.AppId$.getValue());
  }
  public EvaluateEventResponse(event: IResponsibleRelationship): void {
    let eventResponse: Observable<IConfirm>;
    if ( event.Id == null ) {
      // Default value for ID is null in the Model
      eventResponse = this.rbtService.CreateBackgroundCheck( event );
    }
    else {
      eventResponse = this.rbtService.UpdateBackgroundCheck( event );
    }
    eventResponse
    .pipe(tap(console.log))
    .subscribe(
      (_response: IConfirm) => {
        this.RelationshipCheck.next(_response);
        this.IsSubmitted = false;
        if ( _response && _response.Response == 'T' ) {
          this.alertService.success('Background Check submitted sucessfully');
        }
        else {
          console.log(_response ? _response.Message : 'Background Check Service Update Failed');
          this.alertService.error('Background Check failed to submit');
        }
      }
    )
  }
}
