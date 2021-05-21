// @Component({
//   selector: 'app-rbt-base-tab',
//   templateUrl: './rbt-base-tab.component.html',
//   styleUrls: ['./rbt-base-tab.component.css']
// })

import { AppData, ComponentData, Confirm } from '../_models';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { Directive, Input } from '@angular/core';
import { IConfirm, IRequiredType } from '../_interfaces';
import { delay, map, tap } from 'rxjs/operators';

import { AlertService } from '../_services';
import { ApplicationCompletionService } from '../_services/application-completion.service';
import { FileMgmtService } from '../_services/file-mgmt.service';
import { IResponsibleRelationship } from '../_interfaces/i-responsible-relationship';
import { IResponsibleRelationshipPercolation } from '../_interfaces/i-responsible-relationship-percolation';
import { RbtApplicationService } from '../_services/rbt-application.service';

@Directive()
export abstract class RbtBaseTabComponent {

  @Input() protected InstComponentData : ComponentData;
  public get ComponentData(): ComponentData {
    return this.InstComponentData;
  }
  @Input() protected InstAppData : AppData;
  public get BaseAppData(): AppData {
    return this.InstAppData;
  }
  @Input() protected InstSectionId: string;
  public get SectionId(): string {
    return this.InstSectionId;
  }

  public FileCheck: BehaviorSubject<IConfirm>;
  public RelationshipCheck: BehaviorSubject<IConfirm>;
  public AttestationCheck: BehaviorSubject<IConfirm>;

  public __FileCheck$: Observable<IConfirm>;
  public __RelationshipCheck$: Observable<IConfirm>;
  public __AttestationCheck$: Observable<IConfirm> ;

  public FileTypes: IRequiredType[] = new Array<IRequiredType>();

  public IsSubmitted: boolean = false;

  public constructor(
    protected alertService: AlertService,
    protected completionService: ApplicationCompletionService,
    private fileService: FileMgmtService,
    protected rbtService: RbtApplicationService,
  ) {
    this.FileCheck = new BehaviorSubject<IConfirm>({
      Response: 'F',
      Message: ''
    });
    this.RelationshipCheck = new BehaviorSubject<IConfirm>({
      Response: 'F',
      Message: ''
    });

    this.__FileCheck$ = this.FileCheck.asObservable();
    this.__RelationshipCheck$ = this.RelationshipCheck.asObservable();
  }

  public FileEvent(event: IConfirm): void {
    this.FileCheck.next(event);
  }
  public RelationshipEvent(fullEvent: IResponsibleRelationshipPercolation): void {
    // If we already submitted, then let's just get this event out of the way
    if ( fullEvent.ComponentType == '-1') {
      this.RelationshipCheck.next({Response: 'T', Message: 'Relationship Exists'} as IConfirm);
      return;
    }
    // If the file check comes back false, we cannot actually have a Relationship value
    if ( this.FileCheck.value.Response == 'T' ) {
      let event = fullEvent.ResponsibleRelationship;
      // if we have submitted a file already, we can proceed
      // If we have submitted a relationship already, we need to update, else create
      event.Document = this.fileService.GetDocumentIDByTypeCode(this.FileTypes[0].Type.Code);

      // Prevent duplicate requests, not positive where the second request comes from unfortunately
      if ( this.IsSubmitted ) {
        return;
      }
      this.IsSubmitted = true;

      this.EvaluateEventResponse(event);
    }
    else {
      // The file has not been uploaded
      this.alertService.error('Please upload a supporting document first');
    }
  }
  public SectionEvent(event: IConfirm): void {
    this.AttestationCheck.next(event);
  }

  public abstract EvaluateEventResponse(event: IResponsibleRelationship): void;
}
