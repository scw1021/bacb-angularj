import { TestBed } from '@angular/core/testing';

import { InformationServiceService } from './information-service.service';

describe('InformationServiceService', () => {
  let service: InformationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InformationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
