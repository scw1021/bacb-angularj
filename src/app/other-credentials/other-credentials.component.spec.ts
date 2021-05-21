import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherCredentialsComponent } from './other-credentials.component';

describe('OtherCredentialsComponent', () => {
  let component: OtherCredentialsComponent;
  let fixture: ComponentFixture<OtherCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherCredentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
