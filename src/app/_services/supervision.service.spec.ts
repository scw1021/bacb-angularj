import { TestBed } from '@angular/core/testing';

import { SupervisionService } from './supervision.service';

describe('SupervisionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SupervisionService = TestBed.get(SupervisionService);
    expect(service).toBeTruthy();
  });
});
