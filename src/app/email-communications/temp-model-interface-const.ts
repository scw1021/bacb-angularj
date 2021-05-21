import { __NSDateToJSDate } from '../_helpers';

export class Email{
  public messageHTML: string = '';
  public recipientEmail: string = '';
  public subject: string = '';
  public sendDate: Date | null = null;
  public authorEmail: string = '';
  constructor(Param1?: any){
    if(Param1){
      this.messageHTML = Param1.messageHTML;
      this.recipientEmail = Param1.recipientEmail;
      this.subject = Param1.subject;
      this.sendDate = __NSDateToJSDate(Param1.sendDate);
      this.authorEmail = Param1.authorEmail;
    }
  }

  public Export(): IEmail{
    return {
      messageHTML: this.messageHTML,
      recipientEmail: this.recipientEmail,
      subject: this.subject,
      sendDate: this.sendDate,
      authorEmail: this.authorEmail
    }
  }
}

export interface IEmail {
   messageHTML: string;
   recipientEmail: string;
   subject: string;
   sendDate: Date | null;
   authorEmail: string;
}


export const mockEmails: IEmail[] =
[
  {
      recipientEmail: "ratm@bacb.com",
      messageHTML: "<HTML><HEAD><BASE href='https://2058485.app.netsuite.com/'><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"></HEAD><BODY style=\"font-family:Verdana,Arial,Helvetica,sans-serif;font-size:10pt;\">This is the test body of a message</BODY></HTML>",
      sendDate: __NSDateToJSDate("3/31/2020 12:20 pm"),
      subject: "BCBA Suporting Documents Required",
      authorEmail: "mmesser@bacb.com"
  },
  {
      recipientEmail: "ratm@bacb.com; mmesser@bacb.com",
      messageHTML: "<HTML><HEAD><BASE href='https://2058485.app.netsuite.com/'><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"></HEAD><BODY style=\"font-family:Verdana,Arial,Helvetica,sans-serif;font-size:10pt;\">this is a silly test message</BODY></HTML>",
      sendDate: __NSDateToJSDate("4/8/2020 9:54 am"),
      subject: "Updates to Privacy Policy",
      authorEmail: "mmesser@bacb.com"
  }
]
