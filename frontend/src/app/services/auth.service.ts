import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://arribaelcampo.store/api/auth';

  constructor(private http: HttpClient) { }

  iniciarSesion(correo: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { correo, contrasena });
  }

  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, usuario);
  }

  isLoggedIn(): boolean {
    return !!this.obtenerToken();
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

  actualizarUsuarioPerfil(id: string, usuario: any): Observable<any> {
    const headers = this.obtenerHeaders();
    return this.http.put(`${this.apiUrl}/usuarioPerfil/${id}`, usuario, { headers });
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

  recoverPassword(email: string) {
    return this.http.post(`${this.apiUrl}/solicitar-recuperacion`, { correo: email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    const body = { token, newPassword };
    return this.http.post(`${this.apiUrl}/reset-password`, body);
  }

  obtenerUsuarioConCalificaciones(id: string): Observable<any> {
    const headers = this.obtenerHeaders();
    return this.http.get(`${this.apiUrl}/usuario/${id}/calificaciones`, { headers });
  }

  actualizarVendedor(id: string, data: any): Observable<any> {
    const headers = this.obtenerHeaders();
    return this.http.put(`${this.apiUrl}/vendedor/${id}`, data, { headers });
  }

  obtenerUsuarioPorId(id: string): Observable<any> {
    const headers = this.obtenerHeaders();
    return this.http.get(`${this.apiUrl}/usuario/${id}`, { headers });
  }

  obtenerVendedoresParaVerificar(): Observable<any> {
    const headers = this.obtenerHeaders();
    return this.http.get(`${this.apiUrl}/vendedores/para-verificar`, { headers });
  }

  actualizarEstadoVendedor(id: string, estado: string): Observable<any> {
    const headers = this.obtenerHeaders();
    return this.http.put(`${this.apiUrl}/vendedor/${id}/estado`, { estado }, { headers });
  }
}
