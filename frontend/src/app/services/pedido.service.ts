import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private baseUrl = 'http://localhost:4000/api/pedido'; // Cambia la URL según tu backend

  constructor(private http: HttpClient) { }

  // Obtener pedidos por usuarioId
  getPedidosByUsuarioId(usuarioId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/comprador/${usuarioId}`);
  }
}
