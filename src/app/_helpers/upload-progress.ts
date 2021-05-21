import { HttpEvent, HttpEventType } from '@angular/common/http';
import {tap } from 'rxjs/operators';

export function uploadProgress<T>( cb: ( Progress: number ) => void ) {
    return tap(( InstEvent: HttpEvent<T> ) => {
      if ( InstEvent.type === HttpEventType.UploadProgress ) {
        cb(Math.round((100 * InstEvent.loaded) / InstEvent.total));
      }
    });
  }