import { TestBed } from '@angular/core/testing';

import { NewCourseworkSelectionService } from './courseworkmeta.service';

describe('CourseworkmetaService', () => {
  let service: NewCourseworkSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewCourseworkSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
