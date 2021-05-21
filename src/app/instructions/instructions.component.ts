import { AlertService, ApplicationService, InstructionService } from '../_services';
import { AppData, AppInstruction, Application, ComponentData } from '../_models';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IAppInstruction, IAppType, IApplication, ICertType } from '../_interfaces';
import { Observable, of } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent implements OnInit {


  public Instruction$: Observable<IAppInstruction>;
  public constructor(
    private InstructionServ: InstructionService,
    private appService: ApplicationService,
  ) {
  }

  public ngOnInit() {
    this.ReadInstructions();
    this.TestInstruction();
  }

  public TestInstruction() : void {
    this.Instruction$
      .pipe()
  }

  public ReadInstructions() : void {
    this.Instruction$ = this.InstructionServ.Find(
      // This actually uses the REAL ID's, so we won't use the getters
      this.appService.SelectedApplication.CertType.Id,
      this.appService.SelectedApplication.AppType.Id);
  }
}

