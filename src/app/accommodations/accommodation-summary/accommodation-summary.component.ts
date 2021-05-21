
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AccommodationService } from 'src/app/_services/accommodation.service';
import { IAccommodationsActual } from '../iaccomodationsactual';

@Component({
  selector: 'app-accommodation-summary',
  templateUrl: './accommodation-summary.component.html',
  styleUrls: ['./accommodation-summary.component.css']
})
export class AccommodationSummaryComponent implements OnInit {
  public displayedCols: string[] = ["Type", "Status", "DateSubmitted", "Delete"];
  public data: Observable<IAccommodationsActual[]>;
  constructor(
    private accSvc: AccommodationService
  ) {
    this.data = accSvc.accommodationsForCurrentApplication$;
  }

  public deleteAccommodation(accommodationId: string){
    this.accSvc.deleteAccom(accommodationId);

  }
  ngOnInit() {
  }

}
