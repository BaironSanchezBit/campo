import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CiudadesService {
  private apiUrl = 'https://api-colombia.com/api/v1/City';  // Cambiamos la URL de la API

  constructor(private http: HttpClient) { }

  getCiudades(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);  // Realizamos la petición directamente a la API
  }
}
