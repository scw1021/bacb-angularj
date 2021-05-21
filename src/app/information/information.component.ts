import { Component, Input, OnInit } from '@angular/core';

import { InformationServiceService } from './information-service.service';
@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css']
})
export class InformationComponent implements OnInit {


  @Input() public BodyTextA: string = '';
  @Input() public BodyTextB: string = '';
  @Input() public BodyTextC: string = '';
  @Input() public BodyTextD: string = '';

  public Debugging: boolean = false;
  public ShowText: boolean = false;
  constructor(
    private service: InformationServiceService
  ) {
    this.Debugging = service.DISPLAY_TESTING_INFORMATION;
  }

  ngOnInit(): void {
  }
  public ClickInfo(): void {
    this.ShowText = !this.ShowText;
  }
}
