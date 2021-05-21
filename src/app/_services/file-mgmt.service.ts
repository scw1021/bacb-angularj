import { BehaviorSubject, Observable, Subject, combineLatest, of, zip } from 'rxjs';
import { CONFIRM_SUCCESS, IConfirm, IConfirmDefault, INetsuiteFile, IRequiredType } from '../_interfaces';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { filter, map, pluck, shareReplay, tap, withLatestFrom } from 'rxjs/operators';

import { ApplicationService } from './application.service';
import { AuthenticationService } from '.';
import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { CertificationService } from './certification.service';
import { ContinuingEducationService } from '../continuing-education/continuing-education.service';
import { IDisplayDocument } from '../_interfaces/i-display-document';
import { IDocumentType } from '../_interfaces/i-document-type';
import { IDocumentTypeResponse } from '../_interfaces/i-document-type-response';
import { IUploadedFile } from '../_interfaces/i-uploaded-file';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileMgmtService extends BaseService {

  // We need a service that manages files in and out of NetSuite.
  // We don't need the actual files sent back to the Client app,
  // we will just need the file names and ID's

  // Because this is a solenoid, maybe we should include file types/location stuff?
  public PaintedIntoAnApplicationCornerBoolean = false;
  public FILE_TYPES = ['Physical/Mental Condition Document', 'Investigation Document', 'Transcript'];//?

  public _FileSubject: Subject<IUploadedFile[]> = new Subject<IUploadedFile[]>();

  public _UpdateSubject: Subject<boolean> = new Subject<boolean>();
  public _DocTypesSubject: BehaviorSubject<IDocumentType[]> = new BehaviorSubject<IDocumentType[]>( new Array<IDocumentType>() );
  public _DisplayDocuments: BehaviorSubject<IDisplayDocument[]> = new BehaviorSubject<IDisplayDocument[]>( new Array<IDisplayDocument>() );
  // outward-facing elements of this service
  public Files$: Observable<IDisplayDocument[]>;
  public AllFiles$: Observable<IDisplayDocument[]>;
  public Types$: Observable<IDocumentType[]>;
  public Update$: Observable<boolean>;
  // Storage member for zipped element
  private _nextDisplayDocumentSet: IDisplayDocument[];

  constructor(
    private http: HttpClient,
    private appService: ApplicationService,
    private certService: CertificationService,
    private authService: AuthenticationService,
    private azure: AzureHttpPostService
  ) {
    super();
    this.Files$ = this._DisplayDocuments.asObservable();
    this.AllFiles$ = this._FileSubject.asObservable().pipe(
      map(files => {
        return files.map(file =>{
          return {
            Id: file.Id,
            Document: file
          }
        })
      })
    );
    this.Types$ = this._DocTypesSubject.asObservable();
    this.Update$ = this._UpdateSubject.asObservable();
    // This only happens the one time, and we will zip it with the Read() result for display
    this._readDocTypes();
    // combine the two elements we like into a single observable
    // Perform this every time Read is called with some RXJS
    combineLatest([this._FileSubject, this._DocTypesSubject])
    .pipe(
      withLatestFrom(this.certService.CurrentCertification$),
      tap(([[files, types], certification]) => {
        console.log("## Files", files);

        this._nextDisplayDocumentSet = [];
        if ( certification.Id ) {
          let certId = certification.GetCurrentCycle().Id;
          files = files.filter(file => file.CertCycleId == certId);
        }
        files?.forEach( (file: IUploadedFile) => {
          types.forEach( (type: IDocumentType ) => {
            // if ( file.Type.Id == type.Id ) {
            // FIXME? - IDK if this is the right place to do this, but I'm already
            // painted into a corner, and the paint won't dry until 1/2021...
            if ( (file.Type.Id == type.Id) && !file.CEActivityId ) {
              this._nextDisplayDocumentSet.push({
                Id: file.Id,
                Document: file
              })
            }
          })
        });
      })
    )
    .subscribe(
      (_any) => {
        this._DisplayDocuments.next(this._nextDisplayDocumentSet);
        // console.log(this._nextDisplayDocumentSet)
      }
    );
  }
  public get Types(): IDocumentType[] {
    return this._DocTypesSubject.value;
  }
  public ReadSomething(): void {
    // I'd like to apologize in advance for this wildly unmaintainable POS
    if ( this.PaintedIntoAnApplicationCornerBoolean ) {
      this.ReadApplication();
    }
    else {
      this.Read();
    }
  }
  public Read(): void {
    this.PaintedIntoAnApplicationCornerBoolean = false;
    this.azure.get<IUploadedFile[]>(this.BaseUrl + 'Document/Read')
    // { "AppId": this.appService.AppId })
    .pipe(
      // Just grab the array of returned values
      map( (files) => files.filter( file => {
        console.log(this.certService.CertificationCycleId, file.CertCycleId == this.certService.CertificationCycleId )
        return file.CertCycleId == this.certService.CertificationCycleId
      })),
      // tap(console.log),

    )
    .subscribe(
      (_values: IUploadedFile[] ) => {
        // Grab all values from the result and push to Behavior Subject
        this._FileSubject.next(_values);
      },
      // If we need Error handling or completion tasks, do that here
      _HttpError => {
        console.log('File Mgmt Read Failed: ', _HttpError);
      }
    )
  }
  public ReadApplication(): void {
    this.PaintedIntoAnApplicationCornerBoolean = true;
    this.azure.post<IUploadedFile[]>(this.BaseUrl + 'Document/Read',
    { "AppId": this.appService.AppId })
    .pipe(
      // Just grab the array of returned values
      // tap(console.log),
      // pluck('Message')
    )
    .subscribe(
      (_values: IUploadedFile[] ) => {
        // Grab all values from the result and push to Behavior Subject
        this._FileSubject.next(_values);
      },
      // If we need Error handling or completion tasks, do that here
      _HttpError => {
        console.log('File Mgmt Read Failed: ', _HttpError);
      }
    )
  }
  private _readDocTypes(): void {
    this.http.get<IDocumentType[]>(this.BaseUrl + 'Document/Types')
    .pipe(
      // pluck('Message')
    )
    .subscribe(
      (_types: IDocumentType[]) => {

        this._DocTypesSubject.next(_types);
        // console.log(_types);
      },
      _HttpError => {
        console.log('File Mgmt ReadTypes Failed: ', _HttpError);
      }
    );
  }
  public Write(file: INetsuiteFile, fileType: string, fileTypeId: string, previousFileId: string = null): Observable<IConfirm> {

    // Add certCycleId to the document record, using the CC service.
    // Once the documents are loading with CCId, allow to filter on CCID as well in the display component
    // With the display on CCID without CE Activity ID, filter on w/out CEAID.
    // On write CE, getAll(Docs, filter on CCID where CEAID null)
    // for all results, append new CEID to document records

    // fin
    this.certService.UpdateCertCycleId();


    // Let's get the wonky date string we want for file nomenclature
    // I hate working with dates so much, it's a wonder I've ever gotten any
    console.log('Write', file);
    let now = new Date();
    let stringDay = (now.getDate() < 10 ? '0' + now.getDate() : now.getDate());
    let month = now.getMonth() + 1; // zero indexed
    let stringMonth = (month < 10 ? '0' + month : '' + month);
    let stringYear = (''+ now.getFullYear()).substring(2,4);
    let outputDate = '' + stringYear + stringMonth + stringDay;
    // We really don't want to regex MB of data for a comma that only shows up once like, 20 char in
    let spot = file.Document.indexOf(',');
    let justDoc = file.Document.substring(spot+1, file.Document.length);
    console.log('Split', justDoc)
    let objRequest = {
      Name: file.Name,
      Document: justDoc,// file.Document.split(/(.+(base64,))/, 4)[3],
      AppId: this.appService.AppId,
      CertCycleId: this.certService.CertificationCycleId,
      DocType: file.Type,
      Date: outputDate,
      DocumentRecordType: fileType,
      DocumentRecordTypeId: fileTypeId,
      SingleFileUpload: previousFileId ? previousFileId : null,
      SingleFileUploadId: previousFileId
    }
    console.warn('FILE',objRequest);
    // let objRequest = {
    //   File: file
    // }
    return this.http.post<any>(this.BaseUrl + 'Document/Create', objRequest, {reportProgress: true, observe: 'events'})
    .pipe(
      map( (event) => {
        console.log(event);
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * event.loaded  / event.total);
            return {Response: 'I', Message: 'progress', UrlResponse: {progress: progress}};
          case HttpEventType.Response:
            console.log(event.body);
            return event.body;
          default:
            return {Response: 'I', Message: ''};
        }
      })
    );
  }
  public Delete(file): void {
    this.azure.post<IConfirm>('Document/Delete', file)
    .subscribe(
      _response => {
        if ( _response && _response.Response == 'T' ){
          this.Read();
        }
      }
    )
  }
  public Update() {
    this._UpdateSubject.next(true);
  }
  public GetDocumentIDByTypeCode(typeCode: string): string {
    let response = '';
    this._DisplayDocuments.value.forEach(
      (document: IDisplayDocument) => {
        if ( document && document.Id ) {
          if ( document.Document.Type.Code == typeCode ) {
            response = document.Id;
          }
        }
      }
    )
    return response;
  }

  // Check service for Files
  public Check(types: IRequiredType[]): Observable<IConfirm> {
    return this.Files$.pipe(
      map<IDisplayDocument[], IConfirm>( (files: IDisplayDocument[]) => {
        types.forEach( type => {
          type.RequirementMet = 'F';
        });
        if ( files && files.length ) {
          files.forEach( (file: IDisplayDocument) => {
            let noMatch = true;
            types.forEach( (type: IRequiredType) => {
              // if the requirement is not met, and in a way that allows multiple same-type docs
              if ( noMatch && type.RequirementMet == 'F'
                && file.Document.Type.Code == type.Type.Code
              ) {
                // update type from list, and prevent additional matches
                type.RequirementMet = 'T';
                noMatch = false;
              }
            })
          })
        }
        // Set the check
        var response: IConfirm = {
          Response: 'T',
          // FYI - documents are sorted by submission date, so this is most recent
          Message: files[0]?.Id
        };
        types.forEach( (type: IRequiredType) => {
          if ( type.RequirementMet == 'F') {
            response = IConfirmDefault;
          }
        });
        return response;
      }),
      // tap(x=>console.log('FileCheck', x, types)),
      shareReplay(1)
    )
  }
  private ResearchFileTypes: IRequiredType[] = [{
    Type:{Id: '6ed022e4-ff03-eb11-a813-00224808102a', Code:'LOA2',Description:'Letter of Attestation (BCBA Option 2)'},
    RequirementMet: 'F'
  },{
    Type:{Id: 'ab519b08-0004-eb11-a813-00224808102a', Code:'SYL2',Description:'Teaching/Research Syllabus (BCBA Option 2)'},
    RequirementMet: 'F'
  },{
    Type:{Id: '098320fc-ff03-eb11-a813-00224808102a', Code:'CVR2',Description:'Curriculum Vitae or Resume (BCBA Option 2)'},
    RequirementMet: 'F'
  },{
    Type:{Id: 'f2c72bea-ff03-eb11-a813-00224808102a', Code:'RAR2',Description:'Research Article (BCBA Option 2)'},
    RequirementMet: 'F'
  }];
  public get ResearchCheck(): Observable<IConfirm> {
    return this.Check(this.ResearchFileTypes);
  }
  public PostDocExperienceFileTypes: IRequiredType[] = [{
    Type:{Code:'LOA3',Description:'Letter of Attestation (BCBA Option 3)',Id:'3eadad76-b011-eb11-a813-000d3a5a7103'},
    RequirementMet:'F'
  },{
    Type: {Code:'PCE3',Description:'Professional Credential of Employee (BCBA Option 3)',Id:'56d1ba82-b011-eb11-a813-000d3a5a7103'},
    RequirementMet:'F'
  },{
    Type:{Code:'CVR3',Description:'Curriculum Vitae or Resume (BCBA Option 3)',Id:'57baad8e-b011-eb11-a813-000d3a5a7103'},
    RequirementMet:'F'
  }]
  public get PostDocCheck(): Observable<IConfirm> {
    return this.Check(this.PostDocExperienceFileTypes);
  }
  public get TrainingCheck(): Observable<IConfirm> {
    return this.Check([{
      Type: {Code:'40HR', Description:'Fourty Hour Training', Id:'8eeca1bb-ff03-eb11-a813-00224808102a'},
      RequirementMet: 'F'
    }])
  }
  public get CompetencyCheck(): Observable<IConfirm> {
    return this.Check([{
      Type: {Code:'RBTA', Description:'RBT Supervisor Attestation', Id:'492303ca-ff03-eb11-a813-00224808102a'},
      RequirementMet: 'F'
    }])
  }
  public get BackgroundCheck(): Observable<IConfirm> {
    return this.Check([{
      Type: {Code: 'RBTB',Description:'RBT Background Check', Id:'7cf56caa-0f0f-eb11-a813-000d3a5a7103'},
      RequirementMet: 'F'
    }])
  }
}
