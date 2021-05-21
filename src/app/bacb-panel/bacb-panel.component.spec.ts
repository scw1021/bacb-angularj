import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacbPanelComponent } from './bacb-panel.component';

describe('BacbPanelComponent', () => {
  let component: BacbPanelComponent;
  let fixture: ComponentFixture<BacbPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacbPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacbPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
