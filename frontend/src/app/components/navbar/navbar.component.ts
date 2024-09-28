import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isCartOpen = false;
  isAuthModalOpen = false;
  isRegistering = false; // Este valor determina si estamos registrando o iniciando sesión
  isLoggedIn = false;
  login = { correo: '', contrasena: '' };
  register = { nombres: '', apellidos: '', correo: '', contrasena: '', celular: '', rol: 'comprador' };
  usuario: any = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);
      this.isLoggedIn = true;  // Verificamos si el usuario ya está logueado
    }
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  toggleAuthModal(isRegistering: boolean = false) {
    this.isAuthModalOpen = !this.isAuthModalOpen;
    this.isRegistering = isRegistering;  // Determina si estamos en modo registro o inicio de sesión
  }

  toggleRegistering() {
    this.isRegistering = !this.isRegistering;  // Cambia el estado entre registrar e iniciar sesión
  }

  onIniciarSesion() {
    this.authService.iniciarSesion(this.login.correo, this.login.contrasena).subscribe(
      (response) => {
        const token = response.token;
        const usuario = response.user;
        this.authService.guardarToken(token);
        this.authService.guardarUsuarioEnLocalStorage(usuario);
        this.usuario = usuario;
        this.isLoggedIn = true;
        this.toggleAuthModal();
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Error al iniciar sesión', error);
      }
    );
  }

  onRegistrarse() {
    this.authService.registrarUsuario(this.register).subscribe(
      (response) => {
        const token = response.token;
        const usuario = response.user;
        this.authService.guardarToken(token);
        this.authService.guardarUsuarioEnLocalStorage(usuario);
        this.usuario = usuario;
        this.isLoggedIn = true;
        this.toggleAuthModal();
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Error al registrar usuario', error);
      }
    );
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.usuario = null;
    this.isLoggedIn = false;
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }
}
