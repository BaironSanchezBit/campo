import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-confirmacion-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './confirmacion-cuenta.component.html',
  styleUrl: './confirmacion-cuenta.component.css'
})
export class ConfirmacionCuentaComponent implements OnInit {
  mensaje: string = '';
  exito: boolean | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (token) {
      this.authService.confirmarCuenta(token).subscribe(
        (response: any) => {
          this.mensaje = response.msg;
          this.exito = true;

          // Guardar token y usuario en LocalStorage
          this.authService.guardarToken(response.token);
          this.authService.guardarUsuarioEnLocalStorage(response.user);

          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        },
        (error) => {
          console.error('Error al confirmar cuenta', error);
          this.mensaje = error.error.msg || 'Error al confirmar cuenta.';
          this.exito = false;
        }
      );
    } else {
      this.mensaje = 'Token no proporcionado';
      this.exito = false;
    }
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }
}