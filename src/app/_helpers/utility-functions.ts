export function __GetNetSuiteDate(date: Date): string {
  if ( date ) {
    // Updated for Azure, in that it likes to have dates over kebabs.
    return  '' + date.getFullYear() + '-' + (1 + date.getMonth()) + '-' + date.getDate();
    // return '' + (1 + date.getMonth()) + '/' + date.getDate() + '/' + date.getFullYear();
  }
  return '';
}

/**
 * @description This is an abstraction of setting dates in models. It's purpose is to provide an insulating layer between the backend and frontend formats.
 * By using this function to set date member variables, if anything about the way we revieve or consume data changes, we change it once here. "NetSuite Date to JavaScript Date"
 * @param dateString a string in the format
 */
export function __NSDateToJSDate(dateString: string): Date {
  return new Date(dateString);
}
export function __AddDays(date: Date, days: number): Date {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
