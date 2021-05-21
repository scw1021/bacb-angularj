import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeAlternateComponent } from './home-alternate.component';

describe('HomeAlternateComponent', () => {
  let component: HomeAlternateComponent;
  let fixture: ComponentFixture<HomeAlternateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeAlternateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeAlternateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
