import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostCatFilterComponent } from './post-cat-filter.component';

describe('PostCatFilterComponent', () => {
  let component: PostCatFilterComponent;
  let fixture: ComponentFixture<PostCatFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostCatFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PostCatFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
