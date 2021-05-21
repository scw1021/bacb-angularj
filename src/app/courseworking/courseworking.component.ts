import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { CheckCompletionService, HourTotal } from './checkCompletion.service';
import { Component, Input, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import { ICourseFlat, IDepartment, IInstitution } from '../_interfaces';
import { shareReplay, tap } from 'rxjs/operators';

import { ApplicationService } from '../_services';
import { CourseSubmissionService } from './courseSubmission.service';
import {ICourseworkFlat} from './tmp/i-coursework-flat';
import { IHoursAllocationType } from '../_interfaces/i-hours-allocation-type';
import { ListService } from './listService.service';
import { NewCourseworkSelectionService } from './tmp/courseworkmeta.service';

type HourTotals = {[key: string]: HourTotal};
@Component({
  selector: 'app-courseworking',
  templateUrl: './courseworking.component.html',
  styleUrls: ['./courseworking.component.css']
})

export class CourseworkingComponent implements OnInit {
  @Input() CanEdit: boolean = true;
  public allInstitutions$: Observable<IInstitution[]>;
  public allDepartmentsForSelectedInstitution: Observable<IDepartment[]>;

  public standardColumns: string[] = [
    'Institution',
    'Department',
    'Title',
    'Edition',
    'Hours',
  ];

  // Housekeeping
  public subs: Subscription[] = [];

  // Allocation Elements for Display
  public fourthEditionAlloc: string[] = ['A1','B1','C1','C2','D1','D2','D3','D4','D5','E1'];
  private fourthEditionCompletions: HourTotals;
  public showFourthEditionCompletions: boolean = false;
  public fifthEditionAlloc: string[] = ['AB','A','B','CD','E','F','GH','I'];
  private fifthEditionCompletions: HourTotals;
  public showFifthEditionCompletions: boolean = false;
  public hybridAlloc: string[] = ['A','B','C','D1','D2-5','E'];
  public hybridAlloc2022: string[] = ['E','AB','CD','F','GHI'];
  public hybridCompletions: HourTotals;

  public MainHeaders:string[] = ['Institution', 'Title', 'Year', 'Credit Level'];
  public ActionHeaders: string[] = ['Actions'];
  public FourthHeaders:string[] = [...this.MainHeaders, ...this.fourthEditionAlloc, ...this.ActionHeaders];
  public FifthHeaders:string[] = [...this.MainHeaders, ...this.fifthEditionAlloc, ...this.ActionHeaders];
  public fifthAllocsFull: IHoursAllocationType[];
  public fourthAllocsFull: IHoursAllocationType[];
  // Coursework from Storage
  public CourseworkFourthData: Observable<ICourseworkFlat[]>;
  public CourseworkFifthData: Observable<ICourseworkFlat[]>;

  public fg: FormGroup;


  // Straight outta the dumpster, for UI
  public IsFormVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


  constructor(
    private applicationService: ApplicationService,
    private crseSvc: NewCourseworkSelectionService,
    private checkSvc: CheckCompletionService,
    private submissionSvc: CourseSubmissionService,
    private listSvc: ListService,
    private fgb: FormBuilder,
  ) {

  }

  ngOnInit(): void {
    // As a reminder, we need the Application ID from Dynamics
    this.CourseworkFourthData = this.submissionSvc.MyFourthCoursework$.pipe(
      tap(x => {
        this.showFifthEditionCompletions = x.length ? false : true;
      }),
      shareReplay(1));
    this.CourseworkFifthData = this.submissionSvc.MyFifthCoursework$.pipe(
      tap(x => {
        this.showFourthEditionCompletions = x.length ? false : true;
      }),shareReplay(1));
    this.allInstitutions$ = this.crseSvc.InstitutionsArr$;
    this.allDepartmentsForSelectedInstitution = this.crseSvc.FilteredDepartmentsArr;
    this.subs.push(this.listSvc.fourthHeaders$.subscribe((x) => this.fourthAllocsFull = x));
    this.subs.push(this.listSvc.fifthHeaders$.subscribe( (x) => this.fifthAllocsFull  = x));
    this.subs.push(this.checkSvc.FourthCompletion$.subscribe( (x) => this.fourthEditionCompletions = x));
    this.subs.push(this.checkSvc.FifthCompletion$.subscribe( (x) => this.fifthEditionCompletions = x));
    this.subs.push(this.checkSvc.hybridCompletion$.subscribe( (x) => this.hybridCompletions = x));
    this.allInstitutions$ = this.crseSvc.InstitutionsArr$;
    this.allDepartmentsForSelectedInstitution = this.crseSvc.FilteredDepartmentsArr;
  }

  public OnClickDelete(course){
    this.submissionSvc.DeleteCoursework(course);
  }


  // Functions Related To Display Elements
  fourthAbbrevToDisplay(display: string){
    if(this.fourthAllocsFull){
      return this.fourthAllocsFull.find((alloc) => alloc.Abbreviation == display).DisplayText;
    } else {
      return null;
    }
  }
  fifthAbbrevToDisplay(display: string){
    if(this.fifthAllocsFull){
      return this.fifthAllocsFull.find((alloc) => alloc.Abbreviation == display).DisplayText;
    } else {
      return null;
    }
  }

  public ColumnCheckFourthEdition(column :string): boolean {
    return this.fourthEditionCompletions?.[column]?.Check;
  }
  public FourthAllocationTotals(column: string): number {
    return this.fourthEditionCompletions?.[column]?.Value;
  }
  public ColumnCheckFifthEdition(column :string): boolean {
    return this.fifthEditionCompletions?.[column]?.Check;
  }
  public FifthAllocationTotals(column: string): number {
    return this.fifthEditionCompletions?.[column]?.Value;
  }
  public ColumnCheckHybrid(column :string): boolean {
    return this.hybridCompletions?.[column]?.Check;
  }
  public HybridAllocationTotals(column: string): number {
    return this.hybridCompletions?.[column]?.Value;
  }
}
