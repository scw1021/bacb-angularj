import { AttestationService, IAttestation } from 'src/app/_services';
import { Component, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-attestations-summary',
  templateUrl: './attestations-summary.component.html',
  styleUrls: ['./attestations-summary.component.css']
})
export class AttestationsSummaryComponent implements OnInit {

  @Input() public SectionId: string;

  public Attestations: Observable<IAttestation[]> = new Observable<IAttestation[]>();
  public RequireFileUpload = false;
  constructor(
    private attestServ: AttestationService,
  ) { }

  ngOnInit(): void {
    // Now this is the fun bit - we take our section from the service and convert it to our local array?
    this.Attestations = this.attestServ.GetSection(this.SectionId).pipe(
      map( dict => {
        let response: IAttestation[] = [];
        for( var key in dict ) {
          response.push(dict[key]);
        }
        // console.log(this.SectionId, response);
        return response;
      })
    )
  }

}
