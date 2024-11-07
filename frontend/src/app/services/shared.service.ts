// src/app/services/shared.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private mostrarAuthModal = new Subject<boolean>();
  mostrarAuthModal$ = this.mostrarAuthModal.asObservable();

  activarAuthModal() {
    this.mostrarAuthModal.next(true);
  }
}
