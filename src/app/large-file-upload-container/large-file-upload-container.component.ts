import { Component, Input, OnInit } from '@angular/core';

import { IConfirm } from '../_interfaces';
import { IDocumentType } from '../_interfaces/i-document-type';

@Component({
  selector: 'app-large-file-upload-container',
  templateUrl: './large-file-upload-container.component.html',
  styleUrls: ['./large-file-upload-container.component.css']
})
export class LargeFileUploadContainerComponent implements OnInit {

  // protected FileTypes: IDocumentType[];
  public FileCheck: IConfirm;

  constructor() {
    this.FileCheck = {
      Response: 'F',
      Message: 'Init'
    }
  }

  ngOnInit() {
    // this.CheckResult.asObservable().subscribe(console.log);
    // this.FileTypes = [
    //   {Code: 'LOA2',Description: 'Letter of Attestation (BCBA Option 2)',id: 11, detected:false},
    //   {Code: 'SYL2',Description: 'Teaching/Research Syllabus (BCBA Option 2)',id: 14, detected:false}
    // ]
  }
  public FileEvent(event: IConfirm): void {
    this.FileCheck = event;

  }

}
