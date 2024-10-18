import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:4000/api/auth';

  constructor(private http: HttpClient) { }

  iniciarSesion(correo: string, contraseña: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { correo, contraseña });
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
}
