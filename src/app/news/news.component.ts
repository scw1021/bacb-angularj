import { AlertService, NewsService } from '../_services';
import { Component, OnInit } from '@angular/core';
import { filter, map, take } from 'rxjs/operators'

import { NewsItem } from '../_models';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {

  public News: Observable<NewsItem[]> |  null  = null;
  public constructor( private NewsServ: NewsService ) {
    this.News = this.NewsServ.News;
  }

  public ngOnInit() {
    this.NewsServ.LoadNews();
  }

}
