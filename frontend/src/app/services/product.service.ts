import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:4000/api/productos';

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

}
