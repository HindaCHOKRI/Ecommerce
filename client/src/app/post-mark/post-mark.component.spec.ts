/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PostMarkComponent } from './post-mark.component';

describe('PostMarkComponent', () => {
  let component: PostMarkComponent;
  let fixture: ComponentFixture<PostMarkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostMarkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostMarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
