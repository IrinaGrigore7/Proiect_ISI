import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransporterComponent } from './transporter.component';

describe('TransporterComponent', () => {
  let component: TransporterComponent;
  let fixture: ComponentFixture<TransporterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransporterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
