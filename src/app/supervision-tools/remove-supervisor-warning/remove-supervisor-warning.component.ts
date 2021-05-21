import { Component, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-remove-supervisor-warning',
  templateUrl: './remove-supervisor-warning.component.html',
  styleUrls: ['./remove-supervisor-warning.component.css']
})
export class RemoveSupervisorWarningComponent  {
  public heknowwhatitdo = false
  constructor(public dialogRef: MatDialogRef<RemoveSupervisorWarningComponent>,
    ) { }

  onClickYes(){
    this.dialogRef.close(true);
  }
  onClickNo(){
    this.dialogRef.close(false);
  }
}
