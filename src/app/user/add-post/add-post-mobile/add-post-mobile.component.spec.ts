import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPostMobileComponent } from './add-post-mobile.component';

describe('AddPostMobileComponent', () => {
  let component: AddPostMobileComponent;
  let fixture: ComponentFixture<AddPostMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddPostMobileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPostMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
