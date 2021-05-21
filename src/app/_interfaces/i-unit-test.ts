import { IConfirm } from './i-confirm';
import { IResponseObject } from './i-response-object';
import { Type } from '@angular/compiler';

export interface IRecordTest {
  Record: string,
  Result: string,
  Passed?: boolean,
  Received?: string,
  ViewResult?: boolean
}
export interface IUnitTest {
  Parameter: string,
  ResponseObject: IConfirm | any,
  ResponseType?: any,
  // With this optional, we can show a default value and replace when we get out server response
  Result?: string,
  Passed?: boolean,
  ViewResult?: boolean,
  TestResponse?: string,
  PUT?: any
}
export const DefaultUnitTest: IUnitTest = {
  Parameter: 'isLoggedIn',
  ResponseObject: {
    Response: 'F',
    Message: 'Customer not logged in.'
  } as IConfirm
}
