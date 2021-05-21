import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  throwError
} from "rxjs";
import { IRecordTest, IUnitTest } from '../_interfaces/i-unit-test';

import { BaseService } from ".";
import { Confirm } from '../_models';
import { HttpClient } from "@angular/common/http";
import { IConfirm } from "../_interfaces";
import { Injectable } from "@angular/core";
import { Type } from "@angular/compiler";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})


/**
 * Performs Http Requests from Observables
 *
 * @member Observable$: `Observable<any>`
 * `Service` extends `BaseService`, providing the BaseUrl string collected from evironment.ts
 *
 * @usageNotes
 * Contains funtions `Filter`, `PostObject`, `PostValue`, and `Confirm`.
 *
 */
export class Service extends BaseService {

  public Observable$ = new Observable<any>();

  constructor(protected _http: HttpClient) {
    super();
  }

  /**
  * Filters the returned observables by a provided type
  *
  * @param elementName: string - Key/Id of element to be filtered
  * @param filterValue: any - Value to filter element with
  * @param observableType: Type - Class/interface of expect observable emissions
  *
  * @usageNotes
  * Under Development
  *

  *
  */
  public Filter(elementName: string, filterValue: any, observableType: Type): Observable<any> {
    return this.Observable$.pipe(
      map((_map: typeof observableType[]) => {
        _map.filter(
          (_filter: typeof observableType) =>
            _filter[elementName] == filterValue
        );
      })
    );
  }
  /**
  * Posts an Http request, Sends an object of any type
  *
  * @param script: string - Name of `.ss` file to call
  * @param param: string - Name of function in specified `SuiteScript` file
  * @param objRequest: any - `Object` passed as parameter in `Http` `Post` request
  *
  * @returns `Observable` as `IConfirm` object
  *
  *
  * ### Attestation Example
  * ```
  * // Post New Attestation Answer
  * let deployable: Service;
  * let newAttestation: Attestation; // result of user selection
  *
  * deployable.PostObject('Attestation','Create', newAttestation)
  *   .pipe(
  *     tap( _returnedValue => {
  *       // Console log or other local action
  *     }),
  *     map( _returnedValue ) => {
  *       // Value alteration or processing
  *     }
  *   )
  *   .subscribe(
  *     (_returnedValue: ReturnType) => {
  *       // Final element processing and error handling
  *     }
  *   );
  * ```
  *
  */
  public PostObject(script: string, param: string, objRequest: any): Observable<IConfirm> {
    console.log(`PostRequest: ${this.BaseUrl + script + "/" + param}`);
    return this._http.post<IConfirm>(
      this.BaseUrl + script + "/" + param,
      objRequest
    );
  }

  public PostObjectUrl(url: string, objRequest: any): Observable<IConfirm> {
    console.log(`PostRequestUrl: ${url + "?param=" + objRequest}`);
    return this._http.post<IConfirm>(
      url, objRequest
    );
  }

  public ExecuteUnitTest<responseType>(script: string, unitTest: IUnitTest): Observable<responseType> {
    return unitTest.PUT
      ? this._http.post<responseType>(this.BaseUrl + "/" + script + ".ss?param=" + unitTest.Parameter, unitTest.PUT )
      : this._http.get<responseType>(this.BaseUrl + "/" + script + ".ss?param=" + unitTest.Parameter)
  }
  public ExecuteRecordTest(UnitTest: IRecordTest): Observable<any> {
    return this._http.post(this.BaseUrl + '/TestPortal.ss?param=Test', {Record: UnitTest.Record} )
  }
  /**
  * Posts an Http request, Sends an value of any type, string by default
  * Converts `objId` and `objValue` to an object
  * Functions identically to `PostObject`
  *
  * @param script: string - Name of `.ss` file to call
  * @param param: string - Name of function in specified `SuiteScript` file
  * @param objId: string - Key/Id of the value being sent
  * @param objValue: any - `Object` passed as parameter in `Http` `Post` request
  *
  * @returns `Observable` as `IConfirm` object
  *
  */
  public PostValue(script: string, param: string, objId: string = "", objValue: any = ""): Observable<IConfirm> {
    return this._http.post<IConfirm>(
      this.BaseUrl + "/" + script + ".ss?param=" + param,
      { objId, objValue }
    );
  }
  /**
  * Uses `Http` `Get` to return an `IConfirm` object result
  *
  * @param script: string - Name of `.ss` file to call
  * @param param: string - Name of function in specified `SuiteScript` file
  *
  * @returns `Observable` as `IConfirm` object
  *
  */
  public GetConfirm(script: string, param: string): Observable<IConfirm> {
    return this._http.get<IConfirm>(
      this.BaseUrl + "/" + script + ".ss?param=" + param
    );
  }
}

/**
  * Template `Subject` that extends `Service`
  *
  * @member subject$: `Subject<T>`
  * @function `SetNext` returns `IConfirm`
  * @function `Get` returns `void`
  *
  * @usageNotes - Probably best to utilize child classes `ReplaySubjectService` or `BehaviorSubjectService`
  *
  */
export class SubjectService<T> extends Service {
  public subject$: Subject<T>;

  constructor(http: HttpClient) {
    super(http);
    this.subject$ = new Subject<T>();
  }

  /**
   * Takes a provided value and sets it as the next emission for the `SubjectService`
   * The returned `IConfirm` provides an error when the value passed is null
   *
   * @param value
   * @returns `IConfirm`
   */
  public SetNext(value: T): IConfirm{
    this.subject$.next(value);
    return {
      Response: value ? 'T' : 'F',
      Message: value ? JSON.stringify(value) : 'Value supplied was null'
    };
  }

  /**
   * Calls an `Http` `Get` request and provides all error handling
   * @param script: string - Name of `.ss` file to call
   * @param param: string - Name of function in specified `SuiteScript` file
   * @param type - Type of parameter expected for error reporting
   */
  public Get(script: string, param: string, type: Type): void {
    this._http
      .get<T>(this.BaseUrl + "/" + script + ".ss?param=" + param)
      .subscribe(
        (Element: T) => {
          if (Element != null) {
            this.subject$.next(Element);
          } else {
            throwError(new Error("Subscription element is NULL"));
          }
        },
        GetError => {
          console.log(
            `SubjectService Error: ${JSON.stringify(
              GetError
            )} of type ${typeof type}. Attempted:[${script}.ss/${param}]`
          );
        },
        () => {
          // On Complete
          console.log(
            `SubjectService: ${typeof type}. Completed:[${script}.ss/${param}]`
          );
        }
      );
  }
}

export class ReplaySubjectService<T> extends SubjectService<T> {
  constructor(http: HttpClient, type: Type) {
    super(http);
    this.subject$ = new ReplaySubject<T>();
    this.Observable$ = this.subject$.asObservable();
  }
}

export class BehaviorSubjectService<T> extends SubjectService<T> {
  constructor(http: HttpClient, type: T) {
    super(http);
    this.subject$ = new BehaviorSubject<T>(type);
    this.Observable$ = this.subject$.asObservable();
  }
}
