import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductividadCampoComponent } from './productividad-campo.component';

describe('ProductividadCampoComponent', () => {
  let component: ProductividadCampoComponent;
  let fixture: ComponentFixture<ProductividadCampoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductividadCampoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductividadCampoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
