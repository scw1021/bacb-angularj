import { Pipe, PipeTransform } from '@angular/core';
import { ICountry } from "../_interfaces"
@Pipe({name: 'countryDialCode'})
export class CountryAndDialCodePipe implements PipeTransform{
  transform(country: ICountry) {
    if(country == null){ return null }
    const dialCode = country.DialCode
    const countryName = country.Name

    return countryName + " (" + dialCode + ")";
  }
}