import { BehaviorSubject, Observable, of } from 'rxjs';
import { Confirm, NewsItem } from '../_models';

import { AzureHttpPostService } from './azure-http-post.service';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { INewsItem } from '../_interfaces/i-news-item';
import { Injectable } from '@angular/core';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NewsService extends BaseService {

  private _News: BehaviorSubject<NewsItem[]>;// = new BehaviorSubject<NewsItem[]>(new Array<NewsItem>());
  public News: Observable<NewsItem[]>;// = this._News.asObservable();
  public constructor(private Http: AzureHttpPostService) {
    super();
    this._News = new BehaviorSubject<NewsItem[]>([]);
    this.News = this._News.asObservable().pipe(shareReplay(1));
  }

  public LoadNews(): void {
    this.Http.get<INewsItem[]>(this.BaseUrl + "News/Read")
    .pipe().subscribe(
      (NewsNext: INewsItem[]) => {
        if (NewsNext.length) {
          let _array = [];
          NewsNext?.forEach( (item: INewsItem) => {
            _array.push(new NewsItem(item))
          })
          this._News.next(_array);
        }
      }
    );
  }
}
