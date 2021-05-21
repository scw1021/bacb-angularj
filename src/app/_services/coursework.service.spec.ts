import { TestBed } from '@angular/core/testing';

import { CourseworkService } from './coursework.service';

describe('CourseworkService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CourseworkService = TestBed.get(CourseworkService);
    expect(service).toBeTruthy();
  });
});
