import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostDoctoralExperienceComponent } from './post-doctoral-experience.component';

describe('PostDoctoralExperienceComponent', () => {
  let component: PostDoctoralExperienceComponent;
  let fixture: ComponentFixture<PostDoctoralExperienceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostDoctoralExperienceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostDoctoralExperienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
