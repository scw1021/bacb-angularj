import { AlertService, AttestationService } from 'src/app/_services';
import { ApplicationCompletionService, CheckEnum } from 'src/app/_services/application-completion.service';
import { CONFIRM_SUCCESS, IConfirm, IConfirmDefault, IDocumentType } from 'src/app/_interfaces';
import { Component, OnInit } from '@angular/core';
import { Confirm, DocumentType } from 'src/app/_models';
import { Observable, combineLatest } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

import { FileMgmtService } from 'src/app/_services/file-mgmt.service';
import { IResponsibleRelationship } from 'src/app/_interfaces/i-responsible-relationship';
import { RbtApplicationService } from 'src/app/_services/rbt-application.service';
import { RbtBaseTabComponent } from '../rbt-base-tab.component';

@Component({
  selector: 'forty-hour-training',
  templateUrl: './forty-hour-training.component.html',
  styleUrls: ['./forty-hour-training.component.css']
})
export class FortyHourTrainingComponent extends RbtBaseTabComponent implements OnInit {

  constructor(
    _alertService: AlertService,
    _completion: ApplicationCompletionService,
    _fileService: FileMgmtService,
    _rbtService: RbtApplicationService,
    private attestService: AttestationService
  ) {
    super( _alertService, _completion, _fileService, _rbtService );
    let initialDocumentType: IDocumentType =  new DocumentType().Export();
    initialDocumentType.Code = '40HR';
    initialDocumentType.Description = 'Fourty Hour Training';
    initialDocumentType.Id = '8eeca1bb-ff03-eb11-a813-00224808102a';
    this.FileTypes = [{
      Type:  initialDocumentType,
      RequirementMet: 'F'
    }];

   }

  ngOnInit() {
    this.__AttestationCheck$ = this.attestService.CheckObservable('4').pipe(tap(x=>console.log('40HR attestation',x)));
    // combineLatest([
    //   this.FileCheck.asObservable(),
    //   this.RelationshipCheck.asObservable(),
    //   this.__AttestationCheck$
    // ]).pipe(
    //   delay(0), // This delay ensures the observable first emits once everything is loaded.
    //   map( (_checks: IConfirm[]) => {
    //     // console.error(_checks);
    //     let response: IConfirm = IConfirmDefault;
    //     if(_checks.length){
    //       response.Response = 'T';
    //       _checks.forEach( (_check: IConfirm) => {
    //         if (_check.Response == 'F') {
    //           response.Response = 'F';
    //         }
    //       });
    //       // console.log('40:', response);
    //     }
    //     return response;
    //   })
    // ).subscribe( _response => this.completionService.TrainingSubject.next(_response))
  }
  public EvaluateEventResponse(event: IResponsibleRelationship): void {
    // console.log(event);
    let eventResponse: Observable<IConfirm>;
    if ( event.Id == null ) {
      // Default value for ID is null in the Model
      eventResponse = this.rbtService.CreateTraining( event );
    }
    else {
      eventResponse = this.rbtService.UpdateTraining( event );
    }
    eventResponse
    .pipe(tap(console.log))
    .subscribe(
      (_response: IConfirm) => {
        this.RelationshipCheck.next(_response);
        this.IsSubmitted = false;
        if ( _response && _response.Response == 'T' ) {
          this.alertService.success('Training submitted sucessfully');
        }
        else {
          console.log(_response ? _response.Message : 'RBT Training Service Update Failed');
          this.alertService.error('Training failed to submit');
        }
      }
    )
  }
}
