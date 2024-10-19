import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportadorComponent } from './transportador.component';

describe('TransportadorComponent', () => {
  let component: TransportadorComponent;
  let fixture: ComponentFixture<TransportadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportadorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransportadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
