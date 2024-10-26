import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CartService } from '../../services/cart.service';

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
  productosCarrito: any[] = [];
  private intentarPagar: boolean = false;

  constructor(private authService: AuthService, private router: Router, private cartService: CartService) { }

  ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
    this.productosCarrito = this.cartService.getItems();
  }

  ngAfterViewInit() {
    if (typeof initDropdowns === 'function') {
      initDropdowns();  // Asegúrate de reemplazar esto con la función que inicializa tus dropdowns
    }
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  pagar() {
    if (this.isLoggedIn) {
      this.router.navigate(['/pasarela-pago']);  // Cambia '/pago' a la ruta de tu pasarela de pago
    } else {
      this.intentarPagar = true;
      this.toggleAuthModal();
    }
  }

  incrementQuantity(index: number) {
    const producto = this.productosCarrito[index];
    if (producto.cantidad < 10) {  // Establece un máximo si es necesario
      producto.cantidad++;
      this.updateCart();
    }
  }

  decrementQuantity(index: number) {
    const producto = this.productosCarrito[index];
    if (producto.cantidad > 1) {  // No permitir que la cantidad sea menor a 1
      producto.cantidad--;
      this.updateCart();
    }
  }

  removeFromCart(index: number) {
    this.cartService.removeFromCart(index);
    this.productosCarrito = this.cartService.getItems();
  }

  getCartTotal() {
    return this.transform(this.productosCarrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0));
  }

  updateCart() {
    this.cartService.updateCart(this.productosCarrito);  // Guarda el carrito actualizado en localStorage
  }

  getFotoUrl(foto: string): string {
    return `http://localhost:4000/uploads/${foto}`;
  }

  transform(value: number): string {
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
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
        this.usuario = usuario;
        this.isLoggedIn = true;
        this.isDropdownOpen = false;
        this.toggleAuthModal();

        // Redirigir a la pasarela de pago si el usuario intentaba pagar
        if (this.intentarPagar) {
          this.router.navigate(['/pasarela-pago']);  // Cambia '/pago' a tu pasarela de pago
          this.intentarPagar = false;  // Restablecer la intención después de redirigir
        } else {
          this.router.navigate(['/']);  // Redirigir a la página principal o donde desees
        }
      },
      (error) => {
        console.error('Error al iniciar sesión', error);
        this.errorMessage = error.error?.msg || 'Error al iniciar sesión';
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
  
  navigateToCategory(category: string) {
    this.router.navigate(['/mercado'], { queryParams: { categoria: category } });
  }
}
