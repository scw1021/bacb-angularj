import { BehaviorSubject, Observable } from 'rxjs';
import { IAppInstruction, IResponseObject } from '../_interfaces';
import { map, tap } from 'rxjs/operators';

import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InstructionService extends BaseService {

  // Subject
  private _InstructionSubject:  BehaviorSubject<IAppInstruction[]> = new BehaviorSubject<IAppInstruction[]>( []);

  // Observable
  public Instruction$: Observable<IAppInstruction[]> = this._InstructionSubject.asObservable();

  public constructor(private azure: AzureHttpPostService) {
    super();
    this.Read();
  };

  public Find(CertTypeId: string, AppTypeId: string) : Observable<IAppInstruction | undefined> {
    return this.Instruction$
      .pipe(
        map((InstructionMap: IAppInstruction[]) => InstructionMap.find(
              (InstructionFilter: IAppInstruction) => {
                return InstructionFilter.CertTypeId === CertTypeId && InstructionFilter.AppTypeId === AppTypeId;
        }))
      );
  };

  public Read() : void {
    this.azure.get<IAppInstruction[]>(this.BaseUrl + "Utilities/GetInstructions")
      .subscribe(
       (InstructionNext: IAppInstruction[]) => {
        if (InstructionNext != null && InstructionNext.length) {
          this._InstructionSubject.next(InstructionNext)
        }
       },
       InstructionError => {

       },
       () => { // OnComplete

      }
     );
  };
}
