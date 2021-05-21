import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService {

  public BaseUrl: string = `${environment.services}`;

  public constructor() { }
}
