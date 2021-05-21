import { AlertObject, AppData, ComponentData } from '../_models';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { AlertDialogComponent } from './alert-dialog-component/alert-dialog.component';
import { AlertService } from '../_services';
import { IAlertObject } from '../_interfaces';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})


export class AlertComponent implements OnInit {

  @Input() public InstAppData: AppData;
  @Input() public InstComponentData: ComponentData;
  // @Input() public Message: Observable<IAlertObject>;

  public Alert = {
    Message: '',
    Response: false

  };
  public dialogRef: MatDialogRef<AlertDialogComponent>;
  public IsError: boolean = true;
  public IsAlert: boolean = false;
  public IsLoading: boolean = false;
  constructor(
    private AlertServ: AlertService,
    public dialog: MatDialog,
  ) {
    this.AlertServ.getMessage().pipe(
      tap( (_message: IAlertObject) => {
        // Any response should clear the loading screen element
        this.IsLoading = false;
        // If the last value is valid, we display the error message by type
        if ( _message && _message.Type != '' ) {
          if ( _message.Type == "loading" ) {
            console.log('loading...')
            // If we send a loading message, start the loading screen
            this.IsLoading = true;
          }
          else {
            this.Alert.Response = true;
            this.Alert.Message = _message.Text;
            this.IsError = (_message.Type == 'error');
            this.IsAlert = (_message.Type == 'alert');
          }

          if( _message.Type == 'error' ||  _message.Type == 'alert'){
            this.openDialog(_message);
          }

        }
        // Otherwise, we simply hide the Alert message
        else {
          this.Alert.Response = false;
        }
      } ),
    ).subscribe();
  }

  ngOnInit() {
    this.Alert.Message = "",
    this.Alert.Response = false;
    this.IsError = false;
    this.IsAlert = false;
  }

  public openDialog(alert: IAlertObject) : void{
    // IMPORTANT. This line specifies that
    if (this.dialog.openDialogs.length > 0){
      return;
    }
    this.dialogRef  = this.dialog.open(AlertDialogComponent,
      {width: '33%',
       data: alert});
  }

}
