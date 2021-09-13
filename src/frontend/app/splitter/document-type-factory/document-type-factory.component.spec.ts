import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTypeFactoryComponent } from './document-type-factory.component';

describe('DocumentTypeFactoryComponent', () => {
  let component: DocumentTypeFactoryComponent;
  let fixture: ComponentFixture<DocumentTypeFactoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentTypeFactoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTypeFactoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
