import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment'
@Component({
  selector: 'error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {
  public imgurl = environment.bacbLogoUrl;
  constructor() { }

  ngOnInit() {
  }

}
