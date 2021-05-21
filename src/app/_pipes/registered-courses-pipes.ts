import { Pipe, PipeTransform } from '@angular/core';

import { IContentAreaHourDetail } from 'src/app/_interfaces/i-content-area-hour-detail';
import { ListObject } from '../_models';
import { stringify } from '@angular/compiler/src/util';

@Pipe({name: 'editionIdToValue'})
export class EditionIdToValuePipe implements PipeTransform{
  transform(id: string) {
    let editionString: string = id + 'th Edition'
    return editionString;
  }
}

@Pipe({name: 'contentAreaAllocType'})
export class ContentAreaAllocTypePipe implements PipeTransform{
  transform(idIn: string, list: IContentAreaHourDetail[]): string{
      let listItem = list.find(x => x.Id == idIn)
      return listItem? listItem.Name: 'error';
    }

}


@Pipe({name: 'lobj'})
export class ListObjectPipe implements PipeTransform{
  transform(val: string | ListObject) {
    if(typeof val == "string"){
      return val
    } else {
      return val.Value;
    }
  }
}


@Pipe({name: 'edition'})
export class EditionPipe implements PipeTransform{
  transform(val: string | ListObject) {
    if(typeof val == "string"){
      return val
    } else {
      switch (val.Value){
        case "Fourth Edition":
          return "4th";
        case "Fifth Edition":
          return "5th";
        case "Third Edition":
          return "3rd";
        default:
        return val.Value;
      }
    }
  }
}

@Pipe({name: 'floor'})
export class FloorPipe implements PipeTransform {
  transform(value: number) {
    return Math.floor(value);
  }
}
