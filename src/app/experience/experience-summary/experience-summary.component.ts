import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ExperienceService } from 'src/app/_services';
import { IExperience } from 'src/app/_interfaces';
import { MatTableDataSource } from '@angular/material/table';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'experience-summary',
  templateUrl: './experience-summary.component.html',
  styleUrls: ['./experience-summary.component.css']
})
export class ExperienceSummaryComponent implements OnInit {

  @Input() public CanEdit: boolean = false;
  @Output() public EditExperience: EventEmitter<IExperience> = new EventEmitter<IExperience>();
  @Output() public AddExperience: EventEmitter<boolean> = new EventEmitter<boolean>();

  public DataSource: MatTableDataSource<IExperience> = new MatTableDataSource<IExperience>([]);

  public SummaryTotals: TotalHours = {
    SH: 0, IH: 0, TH: 0, CH: 0
  };

  public DisplayedColumns: string[] = ['Type','Supervisors','StartDate','EndDate','SupervisedHours','IndependentHours','TotalHours','CalculatedHours','Actions'];

  public constructor (
    private experienceService : ExperienceService,
  ) {

  };
  ngOnInit() {
    this.experienceService.Experience$
    .pipe(
      tap(
        // We care about this in exactly zero places but here. so w/e.
        experiences => {
          this.SummaryTotals.CH = 0;
          this.SummaryTotals.IH = 0;
          this.SummaryTotals.SH = 0;
          this.SummaryTotals.TH = 0;
          experiences.forEach(experience => {
            this.SummaryTotals.SH += experience.SupervisedHours;
            this.SummaryTotals.IH += experience.IndependentHours;
            this.SummaryTotals.TH += experience.TotalHours;
            this.SummaryTotals.CH += experience.CalculatedHours;
          });
        }
      )
    )
    .subscribe(
      (response) => {
        this.DataSource.data = response;
      }
    )
  }

  public OnClickEdit(experience: IExperience) {
    this.EditExperience.emit(experience);
  }
  public OnClickNew() {
    this.AddExperience.emit(true);
  }
  public OnClickDelete(experience: IExperience) {
    this.experienceService.Delete(experience).subscribe(
      (response) => {
        this.experienceService.Read();
      }
    );
  }
}
interface TotalHours {
  SH: number, IH: number, TH: number, CH: number
}
