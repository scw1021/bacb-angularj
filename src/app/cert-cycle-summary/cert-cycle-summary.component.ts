import { CertCycle, CertType, Certification, Customer } from '../_models';
import { Component, OnInit } from '@angular/core';
import { map, tap } from 'rxjs/operators';

import { CertificationService } from '../_services';
import { Observable } from 'rxjs';
import { __GetNetSuiteDate } from '../_helpers/utility-functions';

@Component({
  selector: 'app-cert-cycle-summary',
  templateUrl: './cert-cycle-summary.component.html',
  styleUrls: ['./cert-cycle-summary.component.css']
})
export class CertCycleSummaryComponent implements OnInit {

  public SummaryElements: Observable<Certification[]> = new Observable<Certification[]>();
  public get DisplayColumns() {
    return [
      'CertificationType', 'RenewalDate', 'Number', 'Status'
    ]
  }

  public GetStringDate = __GetNetSuiteDate;

  constructor(
    private certService: CertificationService,
  ) {
    this.SummaryElements = this.certService.Certifications$.pipe(
      // tap(_val => console.log('yeet: ', _val)),
      map(
        (_certs: Certification[]) => {
          let flatCerts: Certification[] = [];
          _certs.forEach( (_cert: Certification) => {
            // console.log('cert');
            _cert.Cycles.forEach( (_cycle: CertCycle) => {
              // console.log('cycle')
              flatCerts.push( new Certification( {
                Id: _cert.Id,
                Number: _cert.Number,
                Contact: new Customer(_cert.Customer.Export()),
                Type: new CertType(_cert.Type.Export()),
                Cycles: [_cycle.Export()]
              }));
            })
          })
          return flatCerts;
        }
      )
    );
    this.certService.ReadAll();
  }

  ngOnInit() {
  }

}
