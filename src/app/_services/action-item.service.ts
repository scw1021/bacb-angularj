import { AlertService, BaseService, CertificationService } from 'src/app/_services';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IConfirm, IResponseObject } from 'src/app/_interfaces';
import { concatMap, map, pluck } from 'rxjs/operators';

import { ActionItem } from '../_models/action-item'
import { AzureHttpPostService } from './azure-http-post.service';
import { Certification } from 'src/app/_models';
import { HttpClient } from '@angular/common/http';
import { IActionItem } from '../_interfaces/i-action-item'
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ActionItemService extends BaseService {
  public currentCertificaction: Certification;
  public actionItemsArr$: Observable<ActionItem[]>;
  public selectionActionItemId$: Observable<string>;
  public _selectionActionItemId: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(private http: HttpClient,
    private azure: AzureHttpPostService,
    private certificationSvc: CertificationService,
    private alertSvc: AlertService
  ) {
    super();
    this.selectionActionItemId$ = this._selectionActionItemId.asObservable();
    this.actionItemsArr$ = this.fetchActionItems();

  }
  /**
   * @description Method called when a user indicates completion of action item. .
   * @param actionItem The backend will reflect the ENTIRE contents of this action item object.
   */
  public updateActionItem(actionItem: IActionItem): Observable<IConfirm>{
    // maybe change to obj param type after POC
    return this.azure.post<IConfirm>(this.BaseUrl + 'ActionItems/Update', { 'ActionItem': actionItem})
  }

  public fetchActionItems(): Observable<ActionItem[]>{
      return this.certificationSvc.CurrentCertification$.pipe(
        concatMap((CurrentCertificaction: Certification ) =>
          {
            return this.azure.post<IActionItem[]>(this.BaseUrl+ 'ActionItems/Read', {'CertificationCycleId': CurrentCertificaction.GetCurrentCycle().Id}).pipe(
              // Rob say: pluck no nullsafe. Or typesafe
              // pluck("Array"),
              map<IActionItem[], ActionItem[]>((actionItemMapArr: IActionItem[]) =>
                {
                  if ( !actionItemMapArr || !actionItemMapArr.length ) {return null;}
                  else {
                    return  actionItemMapArr.map((actionItemMapArrayElement: IActionItem) =>
                      new ActionItem(actionItemMapArrayElement)
                    )
                  }
                }
              )
            )
          }
        )
      )
  }


  /**
   * @description method accepts a string that should represents the id of an action item.
   * This is used to toggle whether or not an action item should show the custom text by default.
   * @param newId string representing the Id of the action item to toggle
   */
  public setSelectedActionItemId(newId: string): void{
    this._selectionActionItemId.next(newId);
  }

}
