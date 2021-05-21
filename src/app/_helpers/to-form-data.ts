export function toFormData<T>( FormValue: T ) {
    const InstFormData = new FormData();
  
    for ( const key of Object.keys(FormValue) ) {
      const value = FormValue[key];
      InstFormData.append(key, value);
    }
  
    return InstFormData;
  }
