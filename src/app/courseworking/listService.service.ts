import { Injectable, OnInit } from '@angular/core';
import { map, shareReplay, tap } from 'rxjs/operators';

import { AzureHttpPostService } from '../_services/azure-http-post.service';
import { BaseService } from '../_services/base.service';
import { IHoursAllocationType } from '../_interfaces/i-hours-allocation-type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListService extends BaseService  implements OnInit{

  public allocationTypes$: Observable<IHoursAllocationType[]>;
  public fourthHeaders: IHoursAllocationType[];
  public fifthHeaders: IHoursAllocationType[];
  public fourthHeaders$: Observable<IHoursAllocationType[]>;
  public fifthHeaders$: Observable<IHoursAllocationType[]>;

  constructor(
    private Http: AzureHttpPostService
  ) {
    super();
    this.allocationTypes$ = this.Http.get<IHoursAllocationType[]>(
      this.BaseUrl + 'Coursework/Types')
    .pipe(
      shareReplay(1)
    );
    this.fourthHeaders$ = this.allocationTypes$.pipe(
      map<IHoursAllocationType[], IHoursAllocationType[]>((typesArr) =>
        typesArr.filter((type) => type.Edition == "4"))
    );
    this.fifthHeaders$ = this.allocationTypes$.pipe(
      map<IHoursAllocationType[], IHoursAllocationType[]>((typesArr) =>
        typesArr.filter((type) => type.Edition == "5"))
    );
    this.allocationTypes$.subscribe((allTypes) => {
      this.fourthHeaders = allTypes.filter((types) => types.Edition == "4"),
      this.fifthHeaders = allTypes.filter((types) => types.Edition == "5");
    });
  }
  ngOnInit(): void {

  }
}
