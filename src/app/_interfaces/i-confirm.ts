export interface IConfirm {
    Response: string;
    Message: string;
    ReturnId?: string;
    UrlResponse?: {}
}

export const CONFIRM_SUCCESS: IConfirm = {
  Response: 'T',
  Message: ''
}
export const IConfirmDefault: IConfirm = {
  Response: 'F',
  Message: "",
}
