import { AppType, CertType } from 'src/app/_models';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ICertType } from 'src/app/_interfaces';

@Component({
  selector: 'app-submitted-header',
  templateUrl: './submitted-header.component.html',
  styleUrls: ['./submitted-header.component.css']
})
export class SubmittedHeaderComponent implements OnInit {

  // @Input() SummaryTitle: Observable<CertType> = of( new CertType() );
  constructor() { }

  ngOnInit() {
  }

}
