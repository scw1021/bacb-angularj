import { IRecordTest, IUnitTest } from './i-unit-test';

import { TestBedStatic } from '@angular/core/testing';

export interface IRecordTestGroup {
  readonly Header: string,
  readonly Description: string,
  Tests: IRecordTest[],
  readonly Script: string,

}
export interface IUnitTestGroup {
  readonly Header: string,
  readonly Description: string,
  Tests: IUnitTest[],
  readonly Script: string,

}
