import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { ActionItem } from '../_models/action-item';
import { ActionItemService } from '../_services/action-item.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'action-items',
  templateUrl: './action-items.component.html',
  styleUrls: ['./action-items.component.css']
})
export class ActionItemsComponent implements OnInit {
  public actionItems$: Observable<ActionItem[]> = new Observable<ActionItem[]>();
  @Input() navigateToDetailPage: boolean;

  constructor(private actionItemSvc: ActionItemService,
              private router: Router) { }

  ngOnInit() {
    this.actionItems$ = this.actionItemSvc.actionItemsArr$;
  }

  /**
   * @description This method passes an actionitem id to the action item service.
   * @param actionItem Action Item to toggle in the action item service.
   */
  public OnSelectItem(actionItem: ActionItem){
    this.actionItemSvc.setSelectedActionItemId(actionItem.Id);
    if(this.navigateToDetailPage){
      this.router.navigate(['/action-item-detail'],)
    }
  }

}






