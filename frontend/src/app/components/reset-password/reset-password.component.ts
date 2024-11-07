import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  newPassword: string = '';
  token: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Obtener el token desde los parámetros de la URL
    this.route.params.subscribe(params => {
      this.token = params['token'];
    });
  }

  onSubmit(): void {
    this.authService.resetPassword(this.token, this.newPassword).subscribe(
      response => {
        alert('Contraseña restablecida exitosamente');
        this.router.navigate(['/']); // Redirige al usuario a la página de inicio de sesión
      },
      error => {
        alert('Error al restablecer la contraseña');
      }
    );
  }
}