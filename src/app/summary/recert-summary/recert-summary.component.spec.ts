import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecertSummaryComponent } from './recert-summary.component';

describe('RecertSummaryComponent', () => {
  let component: RecertSummaryComponent;
  let fixture: ComponentFixture<RecertSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecertSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecertSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
