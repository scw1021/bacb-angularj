import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent {

  @Input() public Progress : number;
  
  public constructor() { }

}
