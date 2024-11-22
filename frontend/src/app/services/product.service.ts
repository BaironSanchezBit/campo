import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'https://arribaelcampo.store/api/productos';

  constructor(private http: HttpClient) { }

  crearProducto(productData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, productData);
  }

  getProductsByUser(userId: string) {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  eliminarProducto(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`);
  }

  actualizarProducto(productId: string, productData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${productId}`, productData);
  }

  getProductosPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?estadoCalidad=pendiente`);
  }

  actualizarEstadoCalidad(productId: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/estado/${productId}`, data);
  }

  rechazarProducto(productId: string, data: { razonRechazo: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/estado/${productId}`, data);
  }
}
