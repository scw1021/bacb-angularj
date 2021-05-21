import { TestBed } from '@angular/core/testing';

import { VoluntaryInactiveService } from './voluntary-inactive.service';

describe('VoluntaryInactiveService', () => {
  let service: VoluntaryInactiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoluntaryInactiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
