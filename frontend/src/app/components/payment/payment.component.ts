import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
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
  isMobile: boolean = false;

  // Método de pago seleccionado
  selectedPaymentMethod: string | null = null;

  constructor(private router: Router, private cartService: CartService, private http: HttpClient) {
    this.loadCartItems();
  }

  ngOnInit() {
    this.detectScreenSize();
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }

  // Detecta el tamaño de la pantalla al cargar y cuando se cambia el tamaño
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.detectScreenSize();
  }

  private detectScreenSize() {
    this.isMobile = window.innerWidth <= 1199; // Verifica si el ancho es menor o igual a 768px
  }

  processPayPalPayment() {
    if (this.direccionEnvio && this.personaRecibe && this.numeroCelular && this.ciudad) {
      this.paymentStatus = 'Procesando tu pago con PayPal...';

      // Simulación de procesamiento de pago
      setTimeout(() => {
        this.paymentStatus = 'Pago con PayPal confirmado.';
        this.createOrder('paypal').then(() => {
          // Lógica después de que el pedido se haya creado correctamente
        }).catch((error: any) => {
          console.error('Error al crear el pedido:', error);
        });
      }, 2000);
    } else {
      this.paymentStatus = 'Por favor, completa todos los campos.';
    }
  }

  createOrder(paymentMethod: string): Promise<void> {

    if (this.email === '') {
      this.email = this.usuario.correo;
    }

    const orderData = {
      email: this.email,
      direccionEnvio: this.direccionEnvio,
      personaRecibe: this.personaRecibe,
      numeroCelular: this.numeroCelular,
      ciudad: this.ciudad,
      paymentMethod: this.selectedPaymentMethod, // Asegúrate de que esta línea esté incluida
      productos: this.items,
      total: this.total,
      usuarioId: this.usuario?._id // Incluye el `usuarioId` también
    };

    // Retornar una Promesa para manejar el resultado de la solicitud
    return new Promise((resolve, reject) => {
      this.http.post('https://arribaelcampo.store/api/pagos/procesar-pago', orderData)
        .subscribe(
          () => {
            this.paymentStatus = 'Pedido creado y correos enviados con éxito.';
            this.router.navigate(['/success']);
            resolve();
          },
          error => {
            console.error('Error enviando correos y creando pedido', error);
            this.paymentStatus = 'Error al crear el pedido. Intenta nuevamente.';
            this.router.navigate(['/cancel']);
            reject(error);
          }
        );
    });
  }

  loadCartItems() {
    this.items = this.cartService.getItems();
    this.total = this.items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }

  processPayment() {
    if (!this.usuario?._id) {
      this.paymentStatus = 'Error: Usuario no identificado. Inicia sesión nuevamente.';
      return;
    }
    this.paymentStatus = 'Procesando...';

    if (this.selectedPaymentMethod) {
      this.createOrder(this.selectedPaymentMethod).then(() => {
        // Simulación del proceso de pago según el método seleccionado
        switch (this.selectedPaymentMethod) {
          case 'creditCard':
            this.paymentStatus = 'Pago con tarjeta de crédito/débito procesado.';
            this.completeOrder();
            break;
          case 'cashOnDelivery':
            this.paymentStatus = 'Pago contra entrega seleccionado.';
            this.completeOrder();
            break;
          case 'paypal':
            this.paymentStatus = 'Simulando redirección a PayPal...';
            // Simulación de espera
            setTimeout(() => {
              this.paymentStatus = 'Pago con PayPal procesado.';
              this.completeOrder();
            }, 2000);
            break;
          case 'bankTransfer':
            this.paymentStatus = 'Procesando transferencia bancaria...';
            // Simulación de espera
            setTimeout(() => {
              this.paymentStatus = 'Pago con transferencia bancaria procesado.';
              this.completeOrder();
            }, 2000);
            break;
          default:
            this.paymentStatus = 'Selecciona un método de pago válido.';
        }
      }).catch(error => {
        this.paymentStatus = 'Error al crear el pedido.';
        console.error('Error:', error);
      });
    } else {
      this.paymentStatus = 'Por favor, selecciona un método de pago.';
    }
  }


  transform(value: number): string {
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod = method;
  }

  completeOrder() {
    this.cartService.clearCart();
  }

  processCreditCardPayment() {
    console.log('Enviando correos de confirmación...');
    this.completeOrder();
  }

  redirectToPaypal() {
    window.location.href = 'https://www.paypal.com/checkout';
  }

  // Regresar a selección de método de pago
  resetPaymentMethod() {
    this.selectedPaymentMethod = null;
  }

  isFormComplete(): boolean {
    if (this.selectedPaymentMethod === 'creditCard') {
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

    // Validaciones mínimas para otros métodos de pago
    if (this.selectedPaymentMethod === 'cashOnDelivery' ||
      this.selectedPaymentMethod === 'paypal' ||
      this.selectedPaymentMethod === 'bankTransfer') {
      return this.direccionEnvio !== '' &&
        this.personaRecibe !== '' &&
        this.numeroCelular !== '' &&
        this.ciudad !== '';
    }

    return false;
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
