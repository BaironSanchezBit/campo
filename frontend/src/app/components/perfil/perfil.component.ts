import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NavbarComponent],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: any = {};
  nuevaContrasena: string = '';
  mensaje: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    const usuario = this.authService.obtenerUsuario();
    if (usuario) {
      this.usuario = { ...usuario }; // Carga los datos del usuario logueado
    } else {
      this.mensaje = 'No se ha encontrado el usuario. Por favor, inicia sesión de nuevo.';
      // Mostrar alerta con SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.mensaje,
        confirmButtonText: 'Aceptar'
      });
    }
  }

  actualizarPerfil() {
    const { rol, correo, ...datosActualizables } = this.usuario; // Excluir rol y correo
  
    // Solo incluir la contraseña si se ha ingresado una nueva
    if (this.nuevaContrasena && this.nuevaContrasena.trim() !== '') {
      datosActualizables.contrasena = this.nuevaContrasena;
    }
  
    this.authService.actualizarUsuarioPerfil(this.usuario._id, datosActualizables).subscribe(
      (response) => {
        this.mensaje = 'Perfil actualizado con éxito.';
        this.authService.guardarUsuarioEnLocalStorage(response); // Actualiza el usuario localmente
        
        // Mostrar alerta de éxito con SweetAlert2
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: this.mensaje,
          confirmButtonText: 'Aceptar'
        });
      },
      (error) => {
        if (error.status === 403) {
          this.mensaje = 'No tienes permisos para realizar esta acción.';
        } else {
          this.mensaje = 'Hubo un error al actualizar el perfil.';
        }
        
        // Mostrar alerta de error con SweetAlert2
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.mensaje,
          confirmButtonText: 'Aceptar'
        });
        console.error('Error al actualizar el perfil:', error);
      }
    );
  }
}
