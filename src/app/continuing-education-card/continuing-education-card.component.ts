import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'continuing-education-card',
  templateUrl: './continuing-education-card.component.html',
  styleUrls: ['./continuing-education-card.component.css']
})
export class ContinuingEducationCardComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  public OnClickNavigate(Route: string) : void {
    this.router.navigate([Route]);
  }
}
