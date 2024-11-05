import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmacionCuentaComponent } from './confirmacion-cuenta.component';

describe('ConfirmacionCuentaComponent', () => {
  let component: ConfirmacionCuentaComponent;
  let fixture: ComponentFixture<ConfirmacionCuentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmacionCuentaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmacionCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
