import { Component, OnInit } from '@angular/core';
import { EmailCommunicationsService } from './email-communications.service';
import { __NSDateToJSDate } from '../_helpers';
import { Observable, of } from 'rxjs';
import { IEmail } from './temp-model-interface-const';

@Component({
  selector: 'app-email-communications',
  templateUrl: './email-communications.component.html',
  styleUrls: ['./email-communications.component.css']
})
export class EmailCommunicationsComponent implements OnInit {

  constructor(private emailService: EmailCommunicationsService) { }
  public emailArray: Observable<IEmail[]>;
  ngOnInit() {
    this.emailArray = this.emailService.emailArray;
  }
  setSelectedEmail(email: IEmail){
    this.emailService.setSelectedDetailEmail(email)
  }
}


