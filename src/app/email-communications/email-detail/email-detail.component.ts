import { Component, OnInit } from '@angular/core';
import { EmailCommunicationsService } from '../email-communications.service';
import { Observable } from 'rxjs';
import { IEmail } from '../temp-model-interface-const';

@Component({
  selector: 'app-email-detail',
  templateUrl: './email-detail.component.html',
  styleUrls: ['./email-detail.component.css']
})
export class EmailDetailComponent implements OnInit {

  public email: Observable<IEmail>;
  public emailArray: Observable<IEmail[]>
  constructor(private emailCommsService: EmailCommunicationsService) { }

  ngOnInit() {
    this.email = this.emailCommsService.selectedDetailEmail;
    this.emailArray = this.emailCommsService.emailArray;
  }

  setSelected(email: IEmail){
    this.emailCommsService.setSelectedDetailEmail(email)
  }

}
