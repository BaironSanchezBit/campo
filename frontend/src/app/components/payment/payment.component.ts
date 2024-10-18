import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  cardNumber: string = '';
  expiryDate: string = '';
  cvv: string = '';
  name: string = '';
  email: string = '';
  items: any[] = [];
  cardLogo: string = '';
  total: number = 0;
  isLoggedIn = false;
  usuario: any = null;
  paymentStatus: string = '';

  // Nuevos campos de envío
  direccionEnvio: string = '';
  personaRecibe: string = '';
  numeroCelular: string = '';
  ciudad: string = '';

  constructor(private router: Router, private cartService: CartService, private http: HttpClient) {
    this.loadCartItems();
  }

  ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }

  loadCartItems() {
    this.items = this.cartService.getItems();
    this.total = this.items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }

  processPayment() {
    this.paymentStatus = 'Comprobando detalles de pago...';  // Cambiar el estado
    this.sendConfirmationEmail();  // Enviar correo y manejar el estado después de la respuesta del backend
  }

  transform(value: number): string {
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  isFormComplete(): boolean {
    return this.cardNumber !== '' &&
      this.expiryDate !== '' &&
      this.cvv !== '' &&
      this.name !== '' &&
      this.email !== '' &&
      this.direccionEnvio !== '' &&
      this.personaRecibe !== '' &&
      this.numeroCelular !== '' &&
      this.ciudad !== '';
  }

  sendConfirmationEmail() {
    this.paymentStatus = 'Creando pedido...';  // Actualizar estado antes de la solicitud

    const emailPayload = {
      email: this.email,
      productos: this.items.map(item => ({
        _id: item._id,
        cantidad: item.cantidad,
        precio: item.precio,
        vendedorId: item.vendedorId
      })),
      total: this.total,
      usuarioId: this.usuario._id,
      direccionEnvio: this.direccionEnvio,
      personaRecibe: this.personaRecibe,
      numeroCelular: this.numeroCelular,
      ciudad: this.ciudad
    };

    this.http.post('http://localhost:4000/api/pagos/procesar-pago', emailPayload)
      .subscribe(
        response => {
          console.log('Pedido creado y correos enviados correctamente', response);
          this.paymentStatus = 'Pedido creado y correos enviados con éxito.';  // Actualizar estado cuando todo se complete
          this.router.navigate(['/success']);  // Redirigir al éxito si todo fue bien
        },
        error => {
          console.error('Error enviando correos y creando pedido', error);
          this.paymentStatus = 'Error al crear el pedido. Intenta nuevamente.';  // Actualizar estado en caso de error
          this.router.navigate(['/cancel']);  // Redirigir al fallo si hubo un error
        }
      );
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    // Solo permitir números (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // Formatear número de tarjeta y detectar tipo
  formatCardNumber(event: any) {
    const input = event.target.value.replace(/\D/g, '').substring(0, 16);  // Permitimos solo 16 dígitos
    const sections = input.match(/.{1,4}/g);
    if (sections) {
      event.target.value = sections.join(' ');
    }
    this.cardNumber = event.target.value;

    // Identificar si es Visa o Mastercard
    if (input.startsWith('4')) {
      this.cardLogo = 'https://www.pngplay.com/wp-content/uploads/8/Visa-Logo-Free-PNG.png';  // Logo de Visa
    } else if (/^5[1-5]/.test(input) || /^2[2-7]/.test(input)) {
      this.cardLogo = 'https://img.icons8.com/color/96/000000/mastercard-logo.png';  // Logo de Mastercard
    } else {
      this.cardLogo = '';  // Ningún logo si no se reconoce el número
    }
  }

  // Formatear fecha de vencimiento MM/YY
  formatExpiryDate(event: any) {
    const input = event.target.value.replace(/\D/g, '').substring(0, 4);  // Permitimos solo MMYY
    const month = input.substring(0, 2);
    const year = input.substring(2, 4);
    if (month.length === 2) {
      event.target.value = `${month}/${year}`;
    }
    this.expiryDate = event.target.value;
  }
}
