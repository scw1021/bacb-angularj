import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { Component, Input, OnDestroy, OnInit, Pipe } from "@angular/core";
import { IConfirm, IRequiredType } from "src/app/_interfaces";

import { ActionItem } from "../_models/action-item";
import { ActionItemService } from "../_services/action-item.service";
import { AlertService } from "src/app/_services";
import { __GetNetSuiteDate } from "./../_helpers/utility-functions";
import { tap } from "rxjs/operators";

@Component({
  selector: "app-action-item-detail",
  templateUrl: "./action-item-detail.component.html",
  styleUrls: ["./action-item-detail.component.css"],
})
export class ActionItemDetailComponent implements OnInit, OnDestroy {
  public actionItemIdUpdateSubscription: Subscription;
  public actionItemDataArrSubscription: Subscription;
  public actionItemServiceUpdateActionItemSubscription: Subscription;
  public actionItemDataArr: ActionItem[];

  // Rob's additions to this stuff
  // IConfirm storage for completion of required file types, when all files uploaded: get 'T'
  public FileCheck: BehaviorSubject<IConfirm> = new BehaviorSubject<
    IConfirm
  >({
    Response: "F",
    Message: "",
  });
  // Array of required file types with requirement-met addition, See DocumentTypes record in NS and
  // add new ones as necessary, but add through Dev3 and use SuiteBundle install
  public FileTypes: IRequiredType[] = [
    {
      Type: {
        Code: "RBTB", // This must be an alpha-numeric code length 4, it is appended to the file name on upload
        Description: "RBT Background Check", // This can be anything, just needs to be 'user friendly'
        Id: "19", // actual internal ID in netsuite
      },
      RequirementMet: "F", // setting this to T doesn't work like you'd expect
    },
  ];
  // Event handler for file uploader, if needed

  // array of action item ids that should have custom text shown.
  public actionItemIdArray: string[];
  constructor(
    protected actionItemSvc: ActionItemService,
    protected alertSvc: AlertService
  ) {}

  ngOnInit() {
    this.actionItemIdArray = [];
    this.actionItemDataArrSubscription = this.actionItemSvc.actionItemsArr$.subscribe(
      (actionItems: ActionItem[]) => (this.actionItemDataArr = actionItems)
    );
    this.actionItemIdUpdateSubscription = this.actionItemSvc.selectionActionItemId$
      .pipe(
        tap((actionItemId: string) => {
          let findIndexResult = this.actionItemIdArray.findIndex(
            (findActionItemId) => findActionItemId == actionItemId
          );
          if (findIndexResult == -1) {
            // This block if the new id is not in the array
            this.actionItemIdArray.push(actionItemId);
          } else {
            this.actionItemIdArray.splice(findIndexResult, 1);
          }
        })
      )
      .subscribe();
  }

  /**
   * @warning Because this function is embedded in the template(and aggressive default change detection is on), it is run A LOT.
   * If performance issues arise in this component in the future, this function could likely be the culprit. A more performant option would likely be a [actionitem, boolean]tuple(with rxjs) or a pipe.
   * @description This is a function to check whether the custom text should be shown in the dom or not.
   * @param actionItem
   */
  checkDisplayCustomTextInTemplate(actionItem: ActionItem): boolean {
    let returnDisplayCustomTextBool: boolean = true;
    let localActionItemId = actionItem.Id;
    let findIndexOfIdInActionItem = this.actionItemIdArray.findIndex(
      (stringPredicate) => {
        return stringPredicate == localActionItemId;
      }
    );
    if (findIndexOfIdInActionItem == -1) {
      returnDisplayCustomTextBool = false;
    } else {
      returnDisplayCustomTextBool = true;
    }
    return returnDisplayCustomTextBool;
  }
  serviceActionItemIdUpdate(newActionItem: ActionItem): void {
    if (newActionItem.Id) {
      this.actionItemSvc.setSelectedActionItemId(newActionItem.Id);
    }
  }

  ngOnDestroy(): void {
    this.actionItemIdUpdateSubscription.unsubscribe();
    this.actionItemDataArrSubscription.unsubscribe();
  }

  onUserClicksActionItemCompletedButton(actionItem: ActionItem) {
    actionItem.DateSubmitted = new Date();
    // This is setting the status to 60, which is Submitted. If this changes on the backend, we have to change it here
    actionItem.Status.Id = "60";
    this.actionItemServiceUpdateActionItemSubscription = this.actionItemSvc
      .updateActionItem(actionItem.Export())
      .subscribe((serverResponseFromActionItemUpdate: IConfirm) => {
        console.trace(
          " ACTION ITEM COMPLETED: ",
          serverResponseFromActionItemUpdate
        );
        if (serverResponseFromActionItemUpdate.Response == "T") {
          this.alertSvc.success("Successfully submitted action item");
        } else if (serverResponseFromActionItemUpdate.Response == "F") {
          this.alertSvc.error("Something went wrong. Please try again later");
        }
      });
  }

  public fileEvent(event: IConfirm, actionItem: ActionItem): void {
    this.FileCheck.next(event);
  }
}
