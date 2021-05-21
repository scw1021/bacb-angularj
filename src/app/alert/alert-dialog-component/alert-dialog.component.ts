import { Component, OnInit, Inject } from '@angular/core';
import { AlertObject } from 'src/app/_models';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-alert-dialog-component',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.css']
})
export class AlertDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AlertObject) { }

  ngOnInit() {
  }

  onCloseClick(){
    this.dialogRef.close()

  }

}
