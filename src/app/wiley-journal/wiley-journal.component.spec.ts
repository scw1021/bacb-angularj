import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WileyJournalComponent } from './wiley-journal.component';

describe('WileyJournalComponent', () => {
  let component: WileyJournalComponent;
  let fixture: ComponentFixture<WileyJournalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WileyJournalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WileyJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
