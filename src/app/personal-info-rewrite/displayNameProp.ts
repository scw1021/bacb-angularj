import { Pipe, PipeTransform } from '@angular/core';
import { NgIdleModule } from '@ng-idle/core';

@Pipe({name: 'displayName'})
export class DisplayNamePipe implements PipeTransform {
  transform(value: object): string {
      if(value && value.hasOwnProperty("Name")){
          return value["Name"]
      } else {
          return null
        }

  }
}