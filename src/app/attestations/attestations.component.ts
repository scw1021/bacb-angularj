import { ApplicationService, AttestationService, IAttestation } from '../_services';
import { AttestAnswer, AttestQuestion } from '../_models';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { CONFIRM_SUCCESS, IAttestAnswer, IConfirm, IConfirmDefault, IRequiredType } from '../_interfaces';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { debounceTime, filter, map, pluck } from 'rxjs/operators';

import { ActivatedRoute } from '@angular/router';

type Debouncer = { [questionId: string]: BehaviorSubject<IAttestAnswer>};
@Component({
  selector: 'app-attestations',
  templateUrl: './attestations.component.html',
  styleUrls: ['./attestations.component.css']
})
export class AttestationsComponent implements OnInit {

  public SectionId: string;
  public SectionTitle: string = 'Attestations';
  // public CheckIndex: string; Not Sure I need this just yet

  public Attestations: Observable<IAttestation[]> = new Observable<IAttestation[]>();
  public RequireFileUpload = false;
  public FileTypes: IRequiredType[];

  private _SubmissionDebouncer: Debouncer = {};
  private FileCheck: BehaviorSubject<IConfirm> = new BehaviorSubject<IConfirm>(CONFIRM_SUCCESS);
  public DebounceSubscriptions: Subscription[] = [];

  public Forms = new FormArray([]);
  private SectionTitles = ['Info Release', 'Attestations', 'Terms and Conditions', 'Training', 'Background Check', 'AttestationsSix', 'AttestationsSeven', 'AttestationsEight' ]

  constructor(
    private activeRoute: ActivatedRoute,
    private attestServ: AttestationService,
  ) {
    this.FileTypes = [{
      Type:{Id:'3d7d1489-ff03-eb11-a813-00224808102a',Code:'LEGL',Description:'Legal Document'},
      RequirementMet: 'F'
    }];
  }

  ngOnInit(): void {
    if (this.activeRoute.snapshot.data['section']){
      this.SectionId = this.activeRoute.snapshot.data['section'];
      this.SectionTitle = this.SectionTitles[+this.SectionId - 1];
      // this.CheckIndex = this.activeRoute.snapshot.data['index'];
    }
    this.DebounceSubscriptions.push( this.FileCheck.asObservable().subscribe(
      (value: IConfirm) => {
        console.warn('FileCheck Debounce', value);
        if ( value.Response == 'T' ){
          // true condition
        }
        else {
          // false condition
        }
      }
    ))
    // Now this is the fun bit - we take our section from the service and convert it to our local array?
    this.Attestations = this.attestServ.GetSection(this.SectionId).pipe(
      map( attestationSection => {
        let response: IAttestation[] = [];
        // Check for FileRequirements
        var requireFile = false;
        for( const questionId in attestationSection ) {
          // we need to create an array for component display
          response.push(attestationSection[questionId]);
          // Check for FileRequirements
          var question = attestationSection[questionId];
          // If question answered and a document can be required
          if ( question.Answer && question.Question.DocRequired == 'T') {
            // Then we seed the FileImport Wizard with FALSE
            // if the document required answer is the client's Answer
            if ( question.Question.DocRequiredOn == question.Answer.Answer ) {
              // We must display the import wizard
              requireFile = true;
            }
          }
          // but we also want to debounce each answer to prevent spam
          var subject = new BehaviorSubject<IAttestAnswer>(null);
          this._SubmissionDebouncer[questionId] = subject;
          this.DebounceSubscriptions.push(subject.asObservable().pipe(
            debounceTime(500),
            filter(_answer => _answer != null)
          ).subscribe(
            (answer: IAttestAnswer) => {
              console.log('DebounceSub: ', answer);
              // It's the exact same logic for both.
              let serviceFuntion: Observable<IConfirm> = (answer.Id === '')
                ? this.attestServ.Create(answer)
                : this.attestServ.Update(answer);
              serviceFuntion.subscribe(
                (_response: IConfirm) => {
                  console.log('Subscription: ', _response);
                  if ( _response ) {
                    this.attestServ.ReadAnswers();
                  }
                  else {
                    console.error('Your connection has timed out, please refresh the browser', false);
                  }
                }
              )
            }
          ));
        }
        // Once we are out of per-question logic, we finish the file stuff, but FANCY as assignment lol
        if ( this.RequireFileUpload = requireFile ) {
          this.FileCheck.next(IConfirmDefault);
        }
        console.log(this.SectionId, response, this.DebounceSubscriptions.length);
        return response;
      })
    )
  }
  public GetErrorMessage() {

  }
  public OnSelect(event, attestation: IAttestation): void {
    // console.warn(event, attestation);
    this.percolate(attestation, attestation.FormControl.value)
  }
  public OnCheck(event, attestation: IAttestation): void {
    console.log(event.checked);
    // console.warn(event, attestation);
    // console.log(attestation.FormControl.value);
    var answer = event.checked ? 'T' : 'F';
    this.percolate(attestation, answer);
  }
  private percolate(attestation: IAttestation, value: string): void {
    // if ( attestation.FormControl.value == 'T' ) {
    //   console.log('true');
    // }
    // else {
    //   console.log('false');
    // }
    if ( attestation.Answer ) {
      console.log('update')
      // update new value
      attestation.Answer.Answer = value;
      this._SubmissionDebouncer[attestation.Question.Id].next(attestation.Answer);
    }
    else {
      // create new
      console.log('create')
      var request: IAttestAnswer = {
        Id: '', QuestionId: attestation.Question.Id,
        AppId: '', Answer: value
      }
      this._SubmissionDebouncer[attestation.Question.Id].next(request);
    }
  }

  public FileEvent(event: IConfirm): void {
    this.FileCheck.next(event);
  }

}

