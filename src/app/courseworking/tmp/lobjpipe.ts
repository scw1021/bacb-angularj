import { PipeTransform, Pipe } from '@angular/core';
import { ListObject } from '../../_models';


@Pipe({name: 'lobj'})
export class ListObjectPipe implements PipeTransform{
  transform(val: string | ListObject) {
    if(typeof val == "string" ||  val == null){
      return val
    } else{
      return val.Value;
    }
  }
}
