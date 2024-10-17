import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SistemasRiegoInteligenteComponent } from './sistemas-riego-inteligente.component';

describe('SistemasRiegoInteligenteComponent', () => {
  let component: SistemasRiegoInteligenteComponent;
  let fixture: ComponentFixture<SistemasRiegoInteligenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SistemasRiegoInteligenteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SistemasRiegoInteligenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
