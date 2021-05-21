import { Component, OnInit, OnDestroy, PipeTransform, Pipe } from '@angular/core';
import { tap } from 'rxjs/operators';

import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit, OnDestroy {

  public Links: Link[] = [
    {path: 'professional-info', displayString: 'Professional Emphasis'},
    {path: 'email-subscriptions', displayString: 'Email Subscriptions'},
    // This pw change on hold until phase 2
    //{path: 'password-change', displayString: 'Password Reset' },
    {path: 'name-change', displayString: 'Name Change'},
    {path: 'email-change', displayString: 'Email Change'},
  ];
  public CurrentlyRoutedPageStringDescription: string = '';
  public RoutedPageSubscription: Subscription;
  public constructor(
    protected routeyBoii: Router,
    ) {}

    ngOnInit() {
      this.RoutedPageSubscription = this.routeyBoii.events.pipe(
        tap(()=> this.CurrentlyRoutedPageStringDescription = this.routeyBoii.url)
      ).subscribe()
    }

    ngOnDestroy(): void {
      if(!this.RoutedPageSubscription.closed){
        this.RoutedPageSubscription.unsubscribe();
      }
    }
}
export interface Link  {
  path: string;
  displayString: string;
}

@Pipe({ name: 'filterAndFormatUrl'})
export class FilterAndFormatUrl implements PipeTransform{
  transform(rawUrlString: string, numberOfSegments: number) {
    let displayString = rawUrlString.substring(rawUrlString.lastIndexOf('/'), rawUrlString.length);

    let substrArr = [];

    while(displayString.lastIndexOf('-') != -1){
      const dashIndex = displayString.lastIndexOf('-');
      substrArr.push( displayString.substring(dashIndex +1 ))
      displayString = displayString.slice(0, dashIndex)
    }

    substrArr.forEach((word: string) => {
      word = word[0].toUpperCase()
      return
      })
  }

}
