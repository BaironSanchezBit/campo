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

  obtenerPedidosVendedor(vendedorId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/vendedor/${vendedorId}`);
  }

  actualizarEstadoProducto(pedidoId: number, productoId: string, nuevoEstado: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/actualizar-estado-vendedor`, { pedidoId, productoId, nuevoEstado });
  }

  actualizarEstadoProductoTransportadora(pedidoId: number, productoId: string, nuevoEstado: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/actualizar-estado-transportador`, { pedidoId, productoId, nuevoEstado });
  }

  obtenerPedidosPorTransportador(transportadorId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/por-transportador/${transportadorId}`);
  }

  asignarTransportador(pedidoId: number, transportadorId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/asignar-transportador`, { pedidoId, transportadorId });
  }

  obtenerPedidosEnviados(): Observable<any> {
    return this.http.get(`${this.baseUrl}/enviados`); // Ruta para obtener los pedidos en estado "enviado"
  }

  actualizarEstadoGeneral(pedidoId: number, nuevoEstado: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/actualizar-estado-general`, { pedidoId, nuevoEstado });
  }
}
