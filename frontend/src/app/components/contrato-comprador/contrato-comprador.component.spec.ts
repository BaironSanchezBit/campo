import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratoCompradorComponent } from './contrato-comprador.component';

describe('ContratoCompradorComponent', () => {
  let component: ContratoCompradorComponent;
  let fixture: ComponentFixture<ContratoCompradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContratoCompradorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContratoCompradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
