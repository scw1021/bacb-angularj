import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class JournalService extends BaseService{

  constructor(private http: HttpClient) { 
    super();
  }

  read(journalName: "Behavioral Interventions"| "Journal of Applied Behavior Analysis (JABA)"|"Journal of the Experimental Analysis of Behavior (JEAB)"){
    var journalId = null;
    switch(journalName){
      case "Behavioral Interventions": 
        journalId = "1099078x";
        break;
      case "Journal of Applied Behavior Analysis (JABA)":
        journalId = "19383703";
        break;
      case "Journal of the Experimental Analysis of Behavior (JEAB)":
        journalId = "19383711";
        break;
      default:
        throw new Error("A misconfigured journal request has been made.");
    }
    return this.http.post(this.BaseUrl + "JournalPost/Read", {JournalId: journalId}, {responseType: 'text'})
  }
}
