import { ActivatedRoute, Params } from '@angular/router';
import { AlertService, CertificationService } from '../_services';
import { AppData, ComponentData } from '../_models';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IConfirm, IDisplayDocument, IRequiredType } from '../_interfaces';

import { FileMgmtService } from '../_services/file-mgmt.service';
import { IDocumentType } from '../_interfaces/i-document-type';
import { INetsuiteFile } from '../_interfaces/i-netsuite-file';

@Component({
  selector: "app-large-file-upload",
  templateUrl: "./large-file-upload.component.html",
  styleUrls: ["./large-file-upload.component.css"]
})

export class LargeFileUploadComponent implements OnInit {
  @Input() public AllowDeleteButton: boolean = false;
  @Input() public SingleFileOnly: boolean = false;
  @Input() public DisplayAllFiles: boolean = false;

  @Input() public InstComponentData: ComponentData;
  // DO NOT PROVIDE NON NULL DEFAULT This executes logic based on whether it's null(see constructor). MM 3.13.20
  @Input() public InstAppData: AppData;
  @Input() public FileTypes: IRequiredType[];
  // Optional modification of header
  @Input() public LegendText: string = 'File Upload';
  public DropdownFileTypes: IDocumentType[];
  @Output() public FileCheck: EventEmitter<any> = new EventEmitter<IConfirm>();
  // For components where we need the DocID, let's have that available
  @Output() public DocumentID: string;

  public InstFile: INetsuiteFile;
  public SelectedFileType: IDocumentType;
  public uploadForm: FormGroup;
  public _AppId: string = '';
  private _progress = 0;

  private _displayedDocuments: IDisplayDocument[] = [];

  constructor(
    private alertService: AlertService,
    protected changeDetectorRef: ChangeDetectorRef,
    protected fileService: FileMgmtService,
    private formBuilder: FormBuilder,
    protected activatedRoute: ActivatedRoute,
    private certService: CertificationService
  ) {
    this.uploadForm = this.formBuilder.group({
      Upload_File: [""], // LOA2
      FileType_Dropdown: [""]
    });
  }

  ngOnInit() {
    // If File Types are provided by the parent, we will only allow those
    if (this.FileTypes) {
      this.DropdownFileTypes = [];
      this.FileTypes.forEach( (_type: IRequiredType) => {
        this.DropdownFileTypes.push(_type.Type);
      })
    }
    else {
      this.fileService.Types$
      .subscribe(
        (_types: IDocumentType[]) => {
          this.DropdownFileTypes = _types;
        }
      )
    }
    // NEW ADDITION
    // Init with default file type because people complained.
    // console.warn('Dropdown Types', this.DropdownFileTypes)
    this.uploadForm.get('FileType_Dropdown').setValue(this.DropdownFileTypes[0]);
    this.SelectedFileType = this.DropdownFileTypes[0];
  }
  public get UploadProgress() {
    return this._progress;
  }
  public SetUploadProgress(response: IConfirm) {
    const progress = response.UrlResponse['progress'];
    this._progress = parseInt(progress, 10);
  }
  // This gets the summary component decision on all required files submission status

  public File_Event(event: INetsuiteFile): void {
    this._progress = 0;
    this.InstFile = event;
  }
  public GetterOfFileSets(event: IDisplayDocument[]): void {
    this._displayedDocuments = event;
  }
  public File_Check_Event(event: IConfirm): void {
    // We just need to send it to the parent component
    // This upload component doesn't actually need the information
    this.FileCheck.emit(event);
  }
  public OnSubmit(): void {
    console.log('onSubmit');
    let uploadType = this.uploadForm.get("FileType_Dropdown").value;
    if (uploadType == "") {
      this.alertService.error("No File Type Selected");
      return;
    }
    this.SelectedFileType = uploadType;
    console.log('onSubmit');
    if (this.InstFile && this.InstFile.Name != "") {
      console.log('onSubmit write called', this.InstFile);
      if ( this.SingleFileOnly && this._displayedDocuments.length ) {
        console.log('SingleFileUpload with PreExisting Condition');
        this.fileService
        .Write(this.InstFile, this.SelectedFileType.Code, this.SelectedFileType.Id, this._displayedDocuments[0].Id)
        .subscribe(
          (_result: IConfirm) => {
            this.SubmisionHelper(_result);
        });
      }
      else {
        this.fileService
        .Write(this.InstFile, this.SelectedFileType.Code, this.SelectedFileType.Id)
        .subscribe(
          (_result: IConfirm) => {
            this.SubmisionHelper(_result);
        });
      }
    }
  }
  private SubmisionHelper(_result: IConfirm): void {
    if (_result.Response == "T") {
      this.alertService.success(
        `${this.InstFile.Name} submitted successfully!`
      );
      // We need the DocID for some other components, so let's steal it from the response
      this.DocumentID = _result.Message;
      // Update the Summary file set
      this.fileService.ReadSomething();
      this._progress = -1; // tells the component to show 'complete'
      // Call load table for child/summary component
      this.fileService.Update();
    }
    else if ( _result.Response == 'I' ) {
       // there's a handful of conditions of HttpResponse that we don't really need
       // so just tag 'progress' messages
      if ( _result.Message == 'progress' ) {
        this.SetUploadProgress(_result)
      }
    }
    else if ( _result.Response == 'X' ){

    }
    else {
      this._progress = 0;
      this.alertService.error(
        `${this.InstFile.Name} failed to submit!`
      )
    }
  }
}
