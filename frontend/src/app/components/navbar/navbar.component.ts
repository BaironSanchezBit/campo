import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

declare var initDropdowns: any;  // Si usas una biblioteca externa como Flowbite, declárala

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit, AfterViewInit {
  isCartOpen = false;
  isAuthModalOpen = false;
  isRegistering = false;
  isLoggedIn = false;
  isDropdownOpen = false;
  errorMessage: string = '';
  login = { correo: '', contrasena: '' };
  register = { nombres: '', apellidos: '', correo: '', contrasena: '', celular: '', rol: 'comprador' };
  usuario: any = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);
      console.log('Usuario recuperado de localStorage:', this.usuario); // <-- Verificar la información del usuario
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }
  
  ngAfterViewInit() {
    if (typeof initDropdowns === 'function') {
      initDropdowns();  // Asegúrate de reemplazar esto con la función que inicializa tus dropdowns
    }
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  toggleAuthModal(isRegistering: boolean = false) {
    this.isAuthModalOpen = !this.isAuthModalOpen;
    this.isRegistering = isRegistering;  // Determina si estamos en modo registro o inicio de sesión
    this.errorMessage = ''; // Resetea el mensaje de error cada vez que abres el modal
  }

  toggleRegistering() {
    this.isRegistering = !this.isRegistering;  // Cambia el estado entre registrar e iniciar sesión
    this.errorMessage = ''; // Resetea el mensaje de error al cambiar entre registro e inicio de sesión
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;  // Cambia el estado del dropdown del avatar
  }

  onIniciarSesion() {
    this.authService.iniciarSesion(this.login.correo, this.login.contrasena).subscribe(
      (response) => {
        const token = response.token;
        const usuario = response.user;
        this.authService.guardarToken(token);
        this.authService.guardarUsuarioEnLocalStorage(usuario);
        console.log('Usuario guardado en localStorage:', usuario);
        this.usuario = usuario;
        this.isLoggedIn = true;
        this.isDropdownOpen = false;
        this.toggleAuthModal();
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Error al iniciar sesión', error);
        this.errorMessage = error.error?.msg || 'Error al iniciar sesión';
      }
    );
  }


  onRegistrarse() {
    console.log('Datos de registro antes de enviar:', this.register); // Para verificar los datos que se están enviando
    this.authService.registrarUsuario(this.register).subscribe(
      (response) => {
        const token = response.token;
        const usuario = response.user;
        this.authService.guardarToken(token);
        this.authService.guardarUsuarioEnLocalStorage(usuario);
        this.usuario = usuario;
        this.isLoggedIn = true;
        this.isDropdownOpen = false;
        this.toggleAuthModal();
        this.router.navigate(['/dashboard']);
        this.ngAfterViewInit();
      },
      (error) => {
        console.error('Error al registrar usuario', error);
        this.errorMessage = error.error?.msg || 'Error al registrar usuario';
      }
    );
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.usuario = null;
    this.isLoggedIn = false;
    this.isDropdownOpen = false;
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }

  validateKeypress(event: KeyboardEvent) {
    const charCode = event.charCode;

    // Permitir solo dígitos (códigos ASCII de 48 a 57)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
