import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subscribable, Subscription, from, of } from "rxjs";
import { concatMap, delay, mergeMap, tap } from "rxjs/operators";

import { AzureHttpPostService } from '../_services/azure-http-post.service';
import { Service } from '../_services/deployable.service';

@Component({
  selector: "app-sandbox",
  templateUrl: "./sandbox.component.html",
  styleUrls: ["./sandbox.component.css"]
})
export class SandboxComponent implements OnInit {
  public alpha: Subscription;
  public beta: Subscription;
  constructor(
    private azure: AzureHttpPostService,
    private httpClient: HttpClient,
    private deployable: Service
  ) {}

  ngOnInit() {
    // let obvs = Observable.create(obs => {
    //   obs.next([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    //   obs.complete();
    // })
    // .pipe(
    //   // make observable to emit each element of the array (not the whole array)
    //   mergeMap((x: [any]) => from(x)),
    //   // delay each element by 1 sec
    //   concatMap(x => of(x).pipe(delay(1000)))
    // )
    // this.beta = obvs.subscribe(
    //   (_val) => {
    //     console.log('beta: ', _val)
    //   },
    //   () =>{
    //     console.log('beta complete')
    //   }
    // )
    // this.alpha = obvs
    // .pipe(tap(
    //   _val => {
    //     if ( _val == 3 ){
    //       // this.beta.unsubscribe();
    //     }
    //     if ( _val == 7 ) {
    //       obvs.complete();
    //     }
    //   }
    // ))
    // .subscribe(
    //   (_val) => {
    //     console.log('alpha: ', _val);
    //   },
    //   () => {
    //     console.log('alpha complete');
    //   }
    // )
  }
  fileToUpload: File = null;
  accessToken = 'gpnqezqsa4npqmm2dkua6hqm';
  yourHeadersConfig = {
    'Authorization': 'Bearer ' + this.accessToken,
    'Content-Type': 'application/pdf',
  }
  handleFileInput(files: FileList) {
    // console.log(files);
    this.fileToUpload = files.item(0);
  }
  uploadFileToActivity() {
    this.postFile(this.fileToUpload);
  }
  postFile(fileToUpload: File): void {
    // const endpoint = 'https://bacb.egnyte.com/pubapi/v1/fs-content/Shared/CustomerDocuments/420690/angularTest.pdf';
    // const formData: FormData = new FormData();
    // formData.append('strFile', fileToUpload, fileToUpload.name);
    // formData.append('strDirectoryLocation', 'https://bacb.egnyte.com/pubapi/v1/fs-content/Shared/CustomerDocuments/420690/angularTest.pdf')
    // console.log(formData)
    // return this.httpClient
    //   .post(endpoint, formData, { headers: this.yourHeadersConfig })
    //   .pipe(
    //     tap(_x => console.log('Post Result: ', JSON.stringify(_x)))
    //   )
    console.log('File to upload:', this.fileToUpload);
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      var stream = fileReader.result as string;
      // stream = stream.replace(/^(data:application\/pdf\+ADs-base64,)/,''); // replace initial garbage
      var body = {
        "StrFile": stream,
        "StrDirectoryLocation": 'c:/wwwroot/src'
      }
      // console.log(fileReader.result);
      // let body = new URLSearchParams();
      // body.set('strFile', fileReader.result as string);
      // body.set('strDirectoryLocation', 'c:/wwwroot/src');
      this.azure.post('https://portal.bacb.com/Egnyte/filerequests', body,
      // {headers : new HttpHeaders({"Content-Type": "application/x-www-form-urlencoded"})}
      ).subscribe(
        data => {
          console.log('EgnyteResponse', data);
        }
      );
    }
    // fileReader.readAsDataURL(fileToUpload);
    fileReader.readAsText(fileToUpload);


}
}
