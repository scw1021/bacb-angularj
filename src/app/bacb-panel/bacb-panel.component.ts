import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'bacb-panel',
  templateUrl: './bacb-panel.component.html',
  styleUrls: ['./bacb-panel.component.css']
})
export class BacbPanelComponent implements OnInit {
  @Input() PanelTitle: string = "";
  constructor() { }

  ngOnInit(): void {
  }

}
