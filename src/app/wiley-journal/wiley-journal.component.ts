import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AlertService } from '../_services';
import { JournalService } from '../_services/journal.service';

@Component({
  selector: 'app-wiley-journal',
  templateUrl: './wiley-journal.component.html',
  styleUrls: ['./wiley-journal.component.css']
})
export class WileyJournalComponent implements OnInit {
  public journals = [
    "Behavioral Interventions",  
    "Journal of Applied Behavior Analysis (JABA)",
    "Journal of the Experimental Analysis of Behavior (JEAB)" 
  ]
  public navigating: boolean = false;
  constructor(private journalService: JournalService,
              private alertService: AlertService) { }

  ngOnInit(): void {
  }

  navToJournal(journal: "Behavioral Interventions"| "Journal of Applied Behavior Analysis (JABA)"|"Journal of the Experimental Analysis of Behavior (JEAB)"): void{
    this.navigating = true;
    this.journalService.read(journal).subscribe(
      (wileyURL) => {
        window.open(wileyURL);
      },
      (error) => this.alertService.error("Something went wrong. Plese try again later."),
      () => this.navigating = false,
    )
  
  }

}
