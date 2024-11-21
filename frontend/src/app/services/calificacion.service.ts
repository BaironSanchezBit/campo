import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {
  private apiUrl = 'https://arribaelcampo.store/api/calificar/calificaciones';

  constructor(private http: HttpClient) {}

  crearCalificacion(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  obtenerCalificaciones(evaluadoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${evaluadoId}`);
  }
}