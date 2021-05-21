import { HttpEvent, HttpResponse, HttpEventType } from '@angular/common/http';
import { pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export function toResponseBody<T>() {
    return pipe(
      filter(( event: HttpEvent<T> ) => event.type === HttpEventType.Response),
      map(( res: HttpResponse<T> ) => res.body)
    );
  }
