import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import Swal from 'sweetalert2';
import { CalificacionService } from '../../services/calificacion.service';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NavbarComponent, FooterComponent],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: any = {};
  nuevaContrasena: string = '';
  mensaje: string = '';
  calificaciones: any[] = [];
  calificacionPromedio: number = 0;
  documentoVerificacion: File | null = null;

  constructor(private authService: AuthService, private calificacionService: CalificacionService) { }

  ngOnInit() {
    this.cargarPerfil();
    this.obtenerCalificaciones();
  }

  cargarPerfil() {
    const usuario = this.authService.obtenerUsuario();
    if (usuario) {
      this.usuario = { ...usuario }; // Carga los datos del usuario logueado
  
      // Verifica si el estado es "Para Verificar" o "Aprobado"
      if (this.usuario.estado === 'Para Verificar') {
        this.mensaje = 'Tu perfil está siendo verificado. No puedes realizar cambios hasta que se complete la revisión.';
      } else if (this.usuario.estado === 'Aprobado') {
        this.mensaje = 'Tu perfil ha sido aprobado y no puede ser editado.';
      }
    } else {
      this.mensaje = 'No se ha encontrado el usuario. Por favor, inicia sesión de nuevo.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.mensaje,
        confirmButtonText: 'Aceptar'
      });
    }
  }
  

  getFotoUrl(archivo: string): string {
    return `https://arribaelcampo.store/uploads/${archivo}`;
  }

  obtenerCalificaciones() {
    this.calificacionService.obtenerCalificaciones(this.usuario._id).subscribe(
      (calificaciones: any[]) => {
        this.calificaciones = calificaciones;

        if (calificaciones.length > 0) {
          // Calcula la puntuación promedio
          const total = calificaciones.reduce((sum, cal) => sum + cal.puntuacion, 0);
          this.calificacionPromedio = total / calificaciones.length;
        } else {
          this.calificacionPromedio = 0; // Si no hay calificaciones
        }
      },
      (error) => {
        console.error('Error al obtener calificaciones:', error);
      }
    );
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

  actualizarVendedor() {
    const formData = new FormData();
    formData.append('ubicacionFinca', this.usuario.ubicacionFinca);
    formData.append('nombreFinca', this.usuario.nombreFinca);
    formData.append('hectareasProduccion', this.usuario.hectareasProduccion.toString());
  
    if (this.documentoVerificacion) {
      formData.append('documentoVerificacion', this.documentoVerificacion);
    }
  
    this.authService.actualizarVendedor(this.usuario._id, formData).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Perfil de vendedor actualizado con éxito.',
          confirmButtonText: 'Aceptar',
        });
  
        // Refrescar los datos del usuario
        this.authService.obtenerUsuarioPorId(this.usuario._id).subscribe(
          (usuarioActualizado) => {
            this.usuario = usuarioActualizado;
            this.authService.guardarUsuarioEnLocalStorage(usuarioActualizado); // Actualizar en el localStorage
          },
          (error) => {
            console.error('Error al obtener los datos actualizados del usuario:', error);
          }
        );
      },
      (error) => {
        console.error('Error al actualizar el perfil del vendedor:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al actualizar el perfil.',
          confirmButtonText: 'Aceptar',
        });
      }
    );
  }

  // Almacenar el archivo seleccionado
  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.documentoVerificacion = event.target.files[0]; // Asigna el archivo a la propiedad
    }
  }
}
