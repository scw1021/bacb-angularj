import { TestBed } from '@angular/core/testing';

import { CourseSequenceService } from './course-sequence.service';

describe('CourseSequenceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CourseSequenceService = TestBed.get(CourseSequenceService);
    expect(service).toBeTruthy();
  });
});
