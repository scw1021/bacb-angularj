import { Component, OnInit } from '@angular/core';
import { finalize, map, tap } from 'rxjs/operators';

import { ApplicationService } from '../_services';
import { IApplication } from '../_interfaces';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-applications-card',
  templateUrl: './applications-card.component.html',
  styleUrls: ['./applications-card.component.css']
})
export class ApplicationsCardComponent implements OnInit {

  public Applications$: Observable<IApplication[]>;
  constructor(
    private AppServ: ApplicationService,
    private router: Router
  ) {
    this.Applications$ = this.AppServ.Application$.pipe(
      map( applications => {
        return applications.filter( application => {
          return application.Status != 'Complete';
        });
      })
    );
  }

  ngOnInit(): void {
  }
  public NewApplicationsScreen : ApplicationLink[] = [
    { ApplicationTitle: 'New BCBA', Link: '/bcba', CertType: '1' },
    { ApplicationTitle: 'New BCaBA', Link: '/bcaba', CertType: '2' },
    { ApplicationTitle: 'New RBT', Link: '/rbt', CertType: '3' },
  ];
  public DisplayColumns = ['Application', 'Link'];
  public DisplayColumnStatus = ['Application', 'Status', 'Link'];
  public LinkNewApplication(Application: ApplicationLink): void {
    this.AppServ.Create('1', Application.CertType).pipe( tap( x => {
      console.log(`OnClick ${Application.ApplicationTitle}: ${JSON.stringify(x)}`)
    }),
    finalize(()=> this.router.navigate([Application.Link]))
    ).subscribe();
  }
  public LinkExistingApplication(Application: IApplication): void {
    this.AppServ.SetApplication(Application.Id);
    this.router.navigate(['/'+Application.CertType.Abbrev.toLowerCase()], {queryParams: {AppId: Application.Id}} )
  }
  public ManageApplications(): void {
    this.router.navigate(['/application-home']);
  }
}
interface ApplicationLink {
  ApplicationTitle: string, Link: string, CertType: string
}
