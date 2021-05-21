import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-application-warning',
  templateUrl: './delete-application-warning.component.html',
  styleUrls: ['./delete-application-warning.component.css']
})
export class DeleteApplicationWarningComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DeleteApplicationWarningComponent>) { }
  public iUnderstand= false;
  ngOnInit(): void {
  }

  onClickDelete(){
    this.dialogRef.close(true)
  }

  onClickCancel(){
    this.dialogRef.close(false)
  }
}
