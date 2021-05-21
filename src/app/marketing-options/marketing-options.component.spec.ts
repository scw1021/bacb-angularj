import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingOptionsComponent } from './marketing-options.component';

describe('MarketingOptionsComponent', () => {
  let component: MarketingOptionsComponent;
  let fixture: ComponentFixture<MarketingOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
