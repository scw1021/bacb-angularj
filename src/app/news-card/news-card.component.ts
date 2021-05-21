import { AlertService, NewsService } from '../_services';
import { Component, OnInit } from '@angular/core';
import { map, take, tap } from 'rxjs/operators';

import { NewsItem } from '../_models';
import { Observable } from 'rxjs';
import { __AddDays } from '../_helpers/utility-functions';

@Component({
  selector: 'news-card',
  templateUrl: './news-card.component.html',
  styleUrls: ['./news-card.component.css']
})
export class NewsCardComponent implements OnInit {

  public News: Observable<NewsItem []> = new Observable<NewsItem[]>();
  public DateCutoff: Date | null = null;
  public Today: Date = new Date();
  public StoryLimit: number;

  public constructor(private NewsServ: NewsService) {
    this.DateCutoff = __AddDays( this.Today, 14);

    this.StoryLimit = 2;
  }

  ngOnInit() {
    this.News = this.NewsServ.News
      .pipe(
        // map(AllNews => AllNews
          // .filter(Story => {
          //   console.log('Item:', Story, Story.ExpirationDate, this.DateCutoff, Story.DatePosted, this.Today);
          //   return Story.ExpirationDate.getMilliseconds() > this.DateCutoff.getMilliseconds() && Story.DatePosted.getMilliseconds() < this.Today.getMilliseconds()
          // })),
        tap(story => console.log(`Story: ${JSON.stringify(story)}`)),
        // take(this.StoryLimit)
      );
    this.NewsServ.LoadNews();
  }
}
