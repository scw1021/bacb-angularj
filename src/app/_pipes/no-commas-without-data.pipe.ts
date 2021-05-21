import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addCommasIfDataExists'
})
export class AddCommasIfDataExists implements PipeTransform {

  transform(text: string): string {
    if(text == null){
      return null
    } else {
      return text + ","
    }
  }

}
