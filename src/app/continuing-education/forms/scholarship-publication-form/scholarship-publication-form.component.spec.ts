import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScholarshipPublicationFormComponent } from './scholarship-publication-form.component';

describe('ScholarshipPublicationFormComponent', () => {
  let component: ScholarshipPublicationFormComponent;
  let fixture: ComponentFixture<ScholarshipPublicationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScholarshipPublicationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScholarshipPublicationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
