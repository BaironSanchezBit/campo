import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  usuarios: any[] = [];
  usuarioNuevo: any = { nombres: '', apellidos: '', correo: '', contrasena: '', celular: '', rol: 'comprador', verificado: false };
  usuarioEditando: any | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.authService.obtenerUsuarios().subscribe(
      (usuarios) => { this.usuarios = usuarios; },
      (error) => { console.error('Error al cargar usuarios:', error); }
    );
  }

  crearUsuario(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas crear este usuario?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.crearUsuario(this.usuarioNuevo).subscribe(
          (usuario) => {
            this.usuarios.push(usuario);
            this.usuarioNuevo = { nombres: '', apellidos: '', correo: '', contrasena: '', celular: '', rol: 'comprador', verificado: false };
            Swal.fire('Creado', 'El usuario ha sido creado.', 'success');
          },
          (error) => {
            console.error('Error al crear usuario:', error);
            Swal.fire('Error', 'No se pudo crear el usuario.', 'error');
          }
        );
      }
    });
  }

  iniciarEdicion(usuario: any): void {
    this.usuarioEditando = { ...usuario };
  }

  actualizarUsuario(): void {
    if (!this.usuarioEditando) return;

    // Solo agrega la propiedad `contrasena` si el usuario ha proporcionado una nueva contraseña
    const datosActualizados: any = { ...this.usuarioEditando };
    if (this.usuarioEditando.nuevaContrasena) {
      datosActualizados.contrasena = this.usuarioEditando.nuevaContrasena;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas actualizar este usuario?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.actualizarUsuario(this.usuarioEditando._id, datosActualizados).subscribe(
          (usuarioActualizado) => {
            const index = this.usuarios.findIndex(u => u._id === usuarioActualizado._id);
            if (index !== -1) this.usuarios[index] = usuarioActualizado;
            this.usuarioEditando = null;
            Swal.fire('Actualizado', 'El usuario ha sido actualizado.', 'success');
          },
          (error) => {
            console.error('Error al actualizar usuario:', error);
            Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
          }
        );
      }
    });
  }

  eliminarUsuario(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.eliminarUsuario(id).subscribe(
          () => {
            this.usuarios = this.usuarios.filter(u => u._id !== id);
            Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
          },
          (error) => {
            console.error('Error al eliminar usuario:', error);
            Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
          }
        );
      }
    });
  }

  cerrarSesion(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.cerrarSesion();
        this.router.navigate(['/']);
        Swal.fire('Sesión cerrada', 'Has cerrado sesión exitosamente.', 'success');
      }
    });
  }
}
