import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  @Input() public IsFirst: boolean = false;
  @Input() public IsLast: boolean = false;
  @Output() public PageChange: EventEmitter<number> = new EventEmitter<number>();

  public constructor() { }

  public ngOnInit() {
  }

  public OnClickForward() : void {
    this.PageChange.emit(1);
  }

  public OnClickBack() : void {
    this.PageChange.emit(-1);
  }

}
