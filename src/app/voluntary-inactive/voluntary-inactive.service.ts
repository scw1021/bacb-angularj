import { BaseService, CertificationService } from '../_services';
import { BehaviorSubject, Observable } from 'rxjs';

import { AzureHttpPostService } from '../_services/azure-http-post.service';
import { CertCycle } from '../_models';
import { EntityStatus } from '../_models/entity-status';
import { ICertCycle } from '../_interfaces/i-cert-cycle';
import { IConfirm } from '../_interfaces';
import { IEntityStatus } from '../_interfaces/i-entity-status';
import { Injectable } from '@angular/core';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VoluntaryInactiveService extends BaseService {
  private InactivePeriodSubject: BehaviorSubject<VoluntaryInactivePeriod[]> = new BehaviorSubject<VoluntaryInactivePeriod[]>([]);
  public InactivePeriods$: Observable<VoluntaryInactivePeriod[]> = this.InactivePeriodSubject.asObservable().pipe(shareReplay(1));
  constructor(
    private azure: AzureHttpPostService,
    private certService: CertificationService,
  ) {
    super();
    this.Read();
    this.certService.CurrentCertification$.subscribe();
  }
  public Read(): void {
    this.azure.get<VoluntaryInactivePeriod[]>(this.BaseUrl + "VoluntaryInactive/Read").subscribe(
      response => {
        if ( response ) {
          console.log(response);
          this.InactivePeriodSubject.next(response);
        }
        else {
          console.warn("No VI returned");
        }
      }
    )
  }
  public Upsert(inactivePeriod: VoluntaryInactivePeriod): void {
    this.certService.UpdateCertCycleId();
    inactivePeriod.CycleId = this.certService.CertificationCycleId;
    this.azure.post<IConfirm>(this.BaseUrl + 'VoluntaryInactive/Create', inactivePeriod).subscribe(
      response => {
        if (response) {
          console.log(response);
          this.Read();
        }
        else {
          console.warn('FUCK', response);
        }
      }
    )
  }
}
export interface VoluntaryInactivePeriod {
  Status?: IEntityStatus,
  StatusId?: string,
  Cycle?: ICertCycle,
  CycleId: string,
  StartDate: string,
  EndDate: string,
  Reason: string
}
// export const TestVoluntaryInactivePeriod = {
//   Status: new EntityStatus().Export(),
//   StatusId: "1000000",
//   Cycle: new CertCycle().Export(),
//   CycleId: "100000",
//   StartDate: '',
//   EndDate: '',
//   Reason: "Some Reason"
// } as VoluntaryInactivePeriod;
