import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherCredentialsSummaryComponent } from './other-credentials-summary.component';

describe('OtherCredentialsSummaryComponent', () => {
  let component: OtherCredentialsSummaryComponent;
  let fixture: ComponentFixture<OtherCredentialsSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherCredentialsSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherCredentialsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
