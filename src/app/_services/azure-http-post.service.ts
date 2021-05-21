import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AzureHttpPostService {

  constructor(protected http: HttpClient) {
    // this.http.post('https://postman-echo.com/post', {id: 3001}).subscribe(_x => console.log('Azure Normal Post', _x));
    // this.http.post('https://postman-echo.com/post', {id: 3001}, {headers : new HttpHeaders({"Content-Type": "text/plain"})}).subscribe(_x => console.log('Azure Text/Plain Post', _x));
  };
  public post<ResponseType>(url: string, body: any): Observable<ResponseType> {
    return  this.http.post<ResponseType>(url , body,
      // {headers : new HttpHeaders({"Content-Type": "application/json"})} // This is required for sending
    )//.pipe(map((_response: string)=> JSON.parse(_response) as ResponseType)) // this is required for parsing response
  }
  public get<ResponseType>(url: string): Observable<ResponseType> {
    return this.http.get<ResponseType>(url //, {null:0},
      // {headers : new HttpHeaders({"Access-Control-Allow-Origin": "https://localhost:44341"})}
      // {headers : new HttpHeaders({"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"})}
    )//.pipe(map((_response: string)=> JSON.parse(_response) as ResponseType))
  }
}
