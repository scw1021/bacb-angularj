import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DisplayDocument, DocumentType } from 'src/app/_models';
import { IConfirm, IDisplayDocument, IDocumentType, IRequiredType, IUploadedFile } from 'src/app/_interfaces';
import { MatTable, MatTableDataSource } from '@angular/material/table';

import { FileMgmtService } from 'src/app/_services/file-mgmt.service';
import { getMatInputUnsupportedTypeError } from '@angular/material/input';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-large-file-upload-summary',
  templateUrl: './large-file-upload-summary.component.html',
  styleUrls: ['./large-file-upload-summary.component.css']
})
export class LargeFileUploadSummaryComponent implements OnInit {

  @Input() public DisplayAllFiles: boolean = false;
  @Input() public AppId: string;
  @Input() public AllowDeleteButton: boolean = false;
  // @Input() public InstComponentData: ComponentData;
  // @Input() public InstAppData: AppData;
  @Input() public FileTypes: IRequiredType[];

  @Output() public FileCheck = new EventEmitter<IConfirm>();
  @Output() public ComponentFileSet = new EventEmitter<IDisplayDocument[]>();
  @ViewChild(MatTable) FileTable: MatTable<IDisplayDocument>;

  private useSpecifiedFileTypes = true;
  public FileDataSource: MatTableDataSource<IDisplayDocument>;
  public get DisplayedColumns(): string[] {
    return ["Type", "FileName", "Date"];//, "Action"];
  }
  private positiveCheckMessage: IConfirm = {
    Response: 'T',
    Message: 'All required files submitted'
  }
  private negativeCheckMessage: IConfirm = {
    Response: 'F',
    Message: 'Not all files submitted'
  }
  private requiredFile: IUploadedFile = {
    Id: '',
    Name: 'Required File',
    Date: null,
    Type: new DocumentType().Export()
  }

  public constructor(
    protected fileService: FileMgmtService,
  ) { }

  public ngOnInit() {
    this.FileCheck.emit( this.negativeCheckMessage );
    this.FileDataSource = new MatTableDataSource<IDisplayDocument>();
    // this.fileService.Read();
    // Utilize the shared service to update the table
    // this.fileService.Update$.subscribe(
    //   _value => {
    //     this.LoadTable();
    //   }
    // )
    if (!this.FileTypes) {
      this.FileTypes = [];
      console.log(`No File types selected for file import`);
      this.useSpecifiedFileTypes = false;
      this.fileService.Types$
      .subscribe(
        (_types: IDocumentType[]) => {
          if ( _types != null && _types.length ) {
            _types.forEach( (docType: IDocumentType) => {
              this.FileTypes.push({Type: docType, RequirementMet: 'F'} as IRequiredType );
            })
            this.LoadTable();
          }
        }
      )
    }
    // because this is async, we need to call LoadTable when the filetypes are present
    else {
      this.LoadTable();
    }

  }

  public LoadTable(): void {
    ( this.DisplayAllFiles ? this.fileService.AllFiles$ : this.fileService.Files$ ).pipe(
      tap((_files: IDisplayDocument[]) => {
        let fileSet = [];
        this.FileTypes.forEach( _type => {
         _type.RequirementMet = 'F';
        });
        this.FileDataSource = new MatTableDataSource<IDisplayDocument>();
        if (_files && _files.length) {
          _files.forEach((_file: IDisplayDocument) => {
            // If file types are specified we need to only show applicable
            if (this.useSpecifiedFileTypes) {
              this.FileTypes.forEach((_type: IRequiredType) => {
                if (_file.Document.Type.Code == _type.Type.Code) {
                  // console.log(`Type: ${_type.Type.Code} was used`);
                  _type.RequirementMet = 'T';
                  this.FileDataSource.data.push(_file);
                  fileSet.push(_file); // this only needed when we can only have one
                }
              });
            } else {
              this.FileDataSource.data.push(_file);
            }
          });
        }
        // Send our set of files up the chain
        // With how complex this is, probably would have been better to just
        // rewrite all this logic to live in the service, though we did need to have
        // multiple fileboxes technically rendered at the same time earlier.
        this.ComponentFileSet.emit(fileSet);
        // Set the check
        let checkType = true;
        if ( this.useSpecifiedFileTypes ) {
          this.FileTypes.forEach((_type: IRequiredType) => {
            if ( _type.RequirementMet=='F' ) {
              // console.log(`Type: ${_type.Code} is unused`);

              checkType = false;
              // Toss the required file note up front

              this.FileDataSource.data.unshift({
                Id: '',
                Document: {
                  Id: '',
                  Type: new DocumentType(_type.Type),
                  Date: null,
                  Name: 'Required File'
                }
              })
            }
          })
        }
        this.FileCheck.emit( checkType ? this.positiveCheckMessage : this.negativeCheckMessage );
      })
    ).subscribe();
  }
  public OnClickDelete(file: IDisplayDocument) {
    this.fileService.Delete(file);
  }
}
