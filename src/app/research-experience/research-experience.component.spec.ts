import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchExperienceComponent } from './research-experience.component';

describe('ResearchExperienceComponent', () => {
  let component: ResearchExperienceComponent;
  let fixture: ComponentFixture<ResearchExperienceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResearchExperienceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResearchExperienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
