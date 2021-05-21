import { TestBed } from '@angular/core/testing';

import { SupervisionToolsService } from './supervision-tools.service';

describe('SupervisionToolsService', () => {
  let service: SupervisionToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupervisionToolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
