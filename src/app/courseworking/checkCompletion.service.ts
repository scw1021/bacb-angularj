import { Injectable, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, mapTo, shareReplay, tap } from 'rxjs/operators';

import { ApplicationService } from '../_services';
import { BaseService } from '../_services/base.service';
import { CourseSubmissionService } from './courseSubmission.service';
import { IConfirm } from '../_interfaces';
import { ICourseworkFlat } from './tmp/i-coursework-flat';
import { IHoursAllocation } from './i-hours-allocation';

@Injectable({
  providedIn: 'root'
})

export class CheckCompletionService extends BaseService {
  // This is rough, but it's better than what it was, and she is strongly typed
  private FourthEditionRequirements: HourRequirements = {
    'A1': { Requirements: {1: 45, 2: 15}, Combine: ['A1']}, // 8
    'B1': { Requirements: {1: 45, 2: 45}, Combine: ['B1']}, // 6
    'C1': { Requirements: {1: 25, 2: 10}, Combine: ['C1']}, // 14
    'C2': { Requirements: {1: 20, 2:  5}, Combine: ['C2']}, // 9
    'D1': { Requirements: {1: 30, 2: 30}, Combine: ['D1']}, // 11
    'D2': { Requirements: {1: 45, 2: 45}, Combine: ['D2']}, // 10
    'D3': { Requirements: {1: 10, 2:  5}, Combine: ['D3']}, // 13
    'D4': { Requirements: {1: 10, 2:  5}, Combine: ['D4']}, // 3
    'D5': { Requirements: {1: 10, 2:  5}, Combine: ['D5']}, // 12
    'E1': { Requirements: {1: 30, 2: 15}, Combine: ['E1','OVF']} // 7
  };
  // private EditionMinimums: HourRequirements = {
  //   'A1': { Requirements: {1:  0, 2:  0}, Combine: []}, // 8
  //   'B1': { Requirements: {1: 45, 2: 45}, Combine: []}, // 6
  //   'C1': { Requirements: {1: 25, 2: 25}, Combine: []}, // 14
  //   'C2': { Requirements: {1: 20, 2: 20}, Combine: []}, // 9
  //   'D1': { Requirements: {1: 30, 2: 30}, Combine: []}, // 11
  //   'D2': { Requirements: {1: 45, 2: 45}, Combine: []}, // 10
  //   'D3': { Requirements: {1: 10, 2: 10}, Combine: []}, // 13
  //   'D4': { Requirements: {1: 10, 2: 10}, Combine: []}, // 3
  //   'D5': { Requirements: {1: 10, 2: 10}, Combine: []}, // 12
  //   'E1': { Requirements: {1:  0, 2:  0}, Combine: []} // 7
  // } ;
  private FifthEditionRequirements: HourRequirements = {
    'AB': { Requirements: {1:  0, 2: 45}, Combine: ['A','B','AB']}, // 18
    'A' : { Requirements: {1: 90, 2:  0}, Combine: ['A']}, // 17
    'B' : { Requirements: {1: 45, 2:  0}, Combine: ['B']}, // 5
    'CD': { Requirements: {1: 45, 2: 30}, Combine: ['CD']}, // 15
    'E' : { Requirements: {1: 45, 2: 30}, Combine: ['E']}, // 1
    'F' : { Requirements: {1: 45, 2: 45}, Combine: ['F']}, // 2
    'GH': { Requirements: {1: 60, 2: 60}, Combine: ['GH']}, // 4
    'I' : { Requirements: {1: 30, 2: 15}, Combine: ['I']}  // 16
  };
  // For Hybrid Data, we take and combine FifthEditionRequirement totals and
  // Combine them with the maximum required value of FourthEditionRequirements.
  private HybridEditionRequirements: HourRequirements = {
    'A'   : { Requirements: {1: 45, 2: 45}, Combine: ['A1'],                Overflow:['E']},
    'B'   : { Requirements: {1: 45, 2: 45}, Combine: ['B1'],                Overflow:['AB']},
    'C'   : { Requirements: {1: 20, 2: 15}, Combine: ['C1','C2'],           Overflow:['CD']},
    'D1'  : { Requirements: {1: 30, 2: 30}, Combine: ['D1'],                Overflow:['F']},
    'D2-5': { Requirements: {1: 75, 2: 60}, Combine: ['D2','D3','D4','D5'], Overflow:['GH','I']},
    'E'   : { Requirements: {1: 30, 2: 15}, Combine: ['E1'],                Overflow:[]},
  };
  // This is for later, do not remove
  // private HybridEditionRequirements2022: HourRequirements = {
  //   'AB' : { Requirements: {1: 45, 2: 45}, Combine: ['AB','A','B'], Overflow:['B1']},
  //   'CD' : { Requirements: {1: 45, 2: 45}, Combine: ['CD'],         Overflow:['C1','C2']},
  //   'E'  : { Requirements: {1: 45, 2: 30}, Combine: ['E',],         Overflow:['A1']},
  //   'F'  : { Requirements: {1: 30, 2: 45}, Combine: ['F'],          Overflow:['D1']},
  //   'GHI': { Requirements: {1: 75, 2: 60}, Combine: ['GH','I'],     Overflow:['D2','D3','D4','D5']},
  // };

  public FourthCompletion$: Observable<HourTotals>;
  public FifthCompletion$: Observable<HourTotals>;
  public hybridCompletion$: Observable<HourTotals>;
  public TotalCompletion: Observable<IConfirm>;

  public fourthEditionAlloc: string[] = ['A1','B1','C1','C2','D1','D2','D3','D4','D5','E1'];
  public fifthEditionAlloc: string[] = ['AB','A','B','CD','E','F','GH','I'];
  // For the hybrid Allocations, first is good until 2022, when the SECOND is used
  public hybridEditionAlloc: string[] = ['A','B','C','D1','D2-5','E']
  public hyrbidEditionAlloc2022: string[] = ['AB','CD','E','F','GHI'];

  constructor(
    private submittedService: CourseSubmissionService,
    private appService: ApplicationService
  ) {
    // For BCBA only graduate courses count
    // For standalone - C1/C2 E1 - hours dropped

    // both editions count up to max value, then overfill
    // OVF in 4th is E and is all extra hours
    // 5th ignores overfill hours

    // a+b is combined for BCBA, BCaBA a+b+ab, non graduate courses go into ab
    // ghi combined, c&d combined, E goes in front for 5th edition

    // E AB CD F GHI in hybrid

    super();
    this.FourthCompletion$ = this.submittedService.MyFourthCoursework$.pipe(
      map<ICourseworkFlat[], HourTotals>((coursework: ICourseworkFlat[] ) =>
        this.CourseworkToCompletion(this.fourthEditionAlloc, this.FourthEditionRequirements, coursework, +this.appService.CertTypeId)),
        shareReplay(1)
    );
    this.FifthCompletion$ = this.submittedService.MyFifthCoursework$.pipe(
      map<ICourseworkFlat[], HourTotals>((coursework: ICourseworkFlat[] ) =>
      this.CourseworkToCompletion(this.fifthEditionAlloc, this.FifthEditionRequirements, coursework, +this.appService.CertTypeId)),
      shareReplay(1)
    );
    this.hybridCompletion$ = combineLatest([this.FifthCompletion$, this.FourthCompletion$]).pipe(
      // Combine both sets into one dictionary
      map<HourTotals[], HourTotals>( totals => {
        let response: HourTotals = {};
        totals.forEach(total => {
          for( const key in total ) {
            response[key] = total[key];
          }
        });
        return response;
      }),
      map<HourTotals, HourTotals>( total => {
        return this.HybridCourseworkToCompletion(total);
      })
    );
    // FIXME
    this.TotalCompletion =
      this.hybridCompletion$
    .pipe(
      map( (completions: HourTotals) => {
        // console.warn(completions);
        // with whatever given completion, we iterate and with any false, we return false
        for( var key in completions){
          if ( !completions[key].Check ){
            return {
              Response: "F",
              Message: "Coursework requirements not met"
            } as IConfirm
          }
        }
        // if we get here? then the coursework is complete!
        return {
          Response: "T",
          Message: "Coursework complete"
        } as IConfirm
      }),
      // tap(console.warn),
      shareReplay(1)
    )
  }

  // Public Functions


  // Private Math Functions

  // This function converts ICourseworkFlat arrays to HourTotals used in the DOM and check services for 4th and 5th.
  private CourseworkToCompletion(
    AllocationTypes: string[], Requirements: HourRequirements,
    Coursework: ICourseworkFlat[], CertType:number
  ): HourTotals {
    // console.log(AllocationTypes, Requirements, Coursework, CertType);

    let response: HourTotals = {};
    AllocationTypes.forEach( (key:string) => {
      response[key] = new HourTotal();
    });
    if (!Coursework){
      return response;
    }
    var overflow = false;
    function addAllocation(hour: HourTotal, allocValue: number, requirement: number){
      hour.GrandTotal += allocValue;
      hour.Value += allocValue;
      if ( hour.Value >= requirement ){
        // if total value is more than required, add extra to overflow, update check
        hour.Overflow += (hour.Value - requirement);
        hour.Value = requirement;
        hour.Check = true;
        overflow = true;
      }
    }
    // Dump all coursework to repsonse
    Coursework.forEach( (coursework: ICourseworkFlat) => {
      // For all BCABA apps, and all BCBA where CreditLebel is Graduate, count values
      if ( this.appService.AppTypeId != '1' || coursework.CreditLevel.Value == 'Graduate' ) {
        for (var key in coursework.Hours){
          var alloc = coursework.Hours[key];
          // So this is where we check that the hours exceed the minimum required, which is probably
          // wildly wrong and needs to be fixed at this.EditionMinimums
          // If there is a minimum requirement, and the allocValue is less than that, ignore. This makes it 5th ed safe
          // JK, but it's here if we want it later
          // if ( !( this.EditionMinimums[key] && alloc.Value < this.EditionMinimums[key].Requirements[CertType] ) ) {
            addAllocation(
              response[alloc.Type.Abbreviation], alloc.Value,
              Requirements[alloc.Type.Abbreviation].Requirements[CertType]
            );
          // }
        }
      }
    });
    // Fifth Edition needs AB+A+B
    if ( Requirements['AB'] ){
      // Right now this just takes from PRE overflow values.
      response['AB'].Value += (response['A'].Value + response['B'].Value);
      if ( response['AB'].Value >= Requirements['AB'].Requirements[CertType]) {
        response['AB'].Check = true;
      }
    }
    // console.warn('Coursework Totals:',response);
    if ( overflow ) {
      if (AllocationTypes.find(key => key == 'E1')) {
        let totalOverflow = 0;
        AllocationTypes.forEach( key => {
          totalOverflow += response[key].Overflow;
        });
        addAllocation(response['E1'], totalOverflow, Requirements['E1'].Requirements[CertType]);
      }
    }
    return response;
  }

  // This converts all HourTotals form 4th and 5th into a singular Check element for all coursework provided
  private HybridCourseworkToCompletion(
    total: HourTotals
  ): HourTotals {
    let response: HourTotals = {};
    let overflow = false;
    let CertType = this.appService.CertTypeId;
    // pretty sure this gets reused, so here it is
    function addAllocation(hour: HourTotal, allocValue: number, requirement: number){
      hour.GrandTotal += allocValue;
      hour.Value += allocValue;
      if ( hour.Value >= requirement ){
        // if total value is more than required, add extra to overflow, update check
        hour.Overflow += (hour.Value - requirement);
        hour.Value = requirement;
        hour.Check = true;
        overflow = true;
      }
    }
    this.hybridEditionAlloc.forEach( (key:string) => {
      response[key] = new HourTotal();
    });
    for ( var key in this.HybridEditionRequirements ) {
      let requirement = this.HybridEditionRequirements[key];
      // Get all hours allowed from 4th edition allowed
      requirement.Combine.forEach( hour => {
        addAllocation(response[key], total[hour].Value, requirement.Requirements[CertType]);
      });
      // Then apply the 5th edition totals
      requirement.Overflow.forEach( hour => {
        // We can actually take ALL of the 5th course values, which is why these are separate
        addAllocation(response[key], total[hour].GrandTotal, requirement.Requirements[CertType]);
      });
    }
    if ( overflow ) {
      let totalOverflow = 0;
      this.hybridEditionAlloc.forEach( key => {
        totalOverflow += response[key].Overflow;
      });
      addAllocation(response['E'], totalOverflow, this.HybridEditionRequirements[key].Requirements[CertType]);
    }
    return response;
  }
}




export class HourTotal {
  // We should have
  // We need to precompute an Actual value, and an Overflow value
  Value: number = 0; // for UI
  GrandTotal: number = 0; // for Internal
  Overflow: number = 0; // for OVF
  Check: boolean = false;
};
export interface HourRequirement {
  Requirements: { '1': number, '2': number },
  Combine: string[],
  Overflow?: string[]
}
type HourRequirements = {[key:string]: HourRequirement};
type HourTotals = {[key: string]: HourTotal};
