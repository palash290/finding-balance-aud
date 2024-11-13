import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SibscriptionCoachComponent } from './sibscription-coach.component';

describe('SibscriptionCoachComponent', () => {
  let component: SibscriptionCoachComponent;
  let fixture: ComponentFixture<SibscriptionCoachComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SibscriptionCoachComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SibscriptionCoachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
