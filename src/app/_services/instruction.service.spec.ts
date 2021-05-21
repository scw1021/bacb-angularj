import { TestBed } from '@angular/core/testing';

import { InstructionService } from './instruction.service';

describe('InstructionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InstructionService = TestBed.get(InstructionService);
    expect(service).toBeTruthy();
  });
});
