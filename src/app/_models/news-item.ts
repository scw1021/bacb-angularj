import { INewsItem } from '../_interfaces/i-news-item';

export class NewsItem {
    public Title: string = '';
    public Abstract: string = '';
    public FullText: string = '';
    public DatePosted: Date | null = null;
    public ExpirationDate: Date | null = null;

    public constructor(Param1?: INewsItem) {
        if (Param1) {
            this.Title = Param1.Title;
            this.Abstract = Param1.Abstract;
            this.FullText = Param1.FullText;
            this.ExpirationDate = new Date( Param1.DateExpired );
            this.DatePosted = new Date(Param1.DatePosted);
        }
        else {
            this.ExpirationDate = null;
            this.DatePosted = null;
        }
    }

    public Erase() : void {
        this.Title = '';
        this.Abstract = '';
        this.FullText = '';
        this.DatePosted = null;
        this.ExpirationDate = null;
    }
}
