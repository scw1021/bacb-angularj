import { Component, OnInit } from '@angular/core';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-init-header',
  templateUrl: './init-header.component.html',
  styleUrls: ['./init-header.component.css']
})
export class InitHeaderComponent implements OnInit {
  public AssetUrl: string =
  `${environment.Assets}` + "/images/BACB_Logo_200.png";
  constructor() { }

  ngOnInit() {
  }

}
