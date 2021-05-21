import { ExternalUrlDirective } from './external-url-directive.directive';
import { Router } from '@angular/router';
import { ElementRef } from '@angular/core';

describe('ExternalUrlDirective', () => {
  it('should create an instance', () => {
    const directive = new ExternalUrlDirective(new ElementRef<string>("url.com"), new Router());
    expect(directive).toBeTruthy();
  });
});
