import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:4000/api/auth';

  constructor(private http: HttpClient) { }

  iniciarSesion(correo: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { correo, contrasena });
  }

  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, usuario);
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  guardarUsuarioEnLocalStorage(usuario: any): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  confirmarCuenta(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/confirmar/${token}`);
  }

  obtenerUsuario(): any {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  obtenerUsuarioId(): string | null {
    const usuario = this.obtenerUsuario();
    return usuario ? usuario._id : null;
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  crearUsuario(usuario: any): Observable<any> {
    const headers = this.obtenerHeaders();
    return this.http.post(`${this.apiUrl}/usuario`, usuario, { headers });
  }

  actualizarUsuario(id: string, usuario: any): Observable<any> {
    const headers = this.obtenerHeaders();
    return this.http.put(`${this.apiUrl}/usuario/${id}`, usuario, { headers });
  }

  eliminarUsuario(id: string): Observable<any> {
    const headers = this.obtenerHeaders();
    return this.http.delete(`${this.apiUrl}/usuario/${id}`, { headers });
  }

  private obtenerHeaders(): HttpHeaders {
    const token = this.obtenerToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  obtenerUsuarios(): Observable<any> {
    const headers = this.obtenerHeaders();
    return this.http.get(`${this.apiUrl}/usuarios`, { headers });
  }
}
