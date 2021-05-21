import { TestBed } from '@angular/core/testing';

import { AzureHttpPostService } from './azure-http-post.service';

describe('AzureHttpPostService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AzureHttpPostService = TestBed.get(AzureHttpPostService);
    expect(service).toBeTruthy();
  });
});
