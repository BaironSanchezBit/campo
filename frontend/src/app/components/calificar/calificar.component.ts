import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // Para ngClass
import { FormsModule } from '@angular/forms'; // Para ngModel
import Swal from 'sweetalert2';
import { CalificacionService } from '../../services/calificacion.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-calificar',
  standalone: true,
  imports: [CommonModule, FormsModule], // Agregar dependencias
  templateUrl: './calificar.component.html',
  styleUrls: ['./calificar.component.css']
})
export class CalificarComponent implements OnInit {
  evaluadoId: string = '';
  pedidoId: string = '';
  puntuacion: number = 0;
  comentario: string = '';
  puntuacionSeleccionada: number = 0; // Para fijar la puntuación seleccionada
  usuario: any = null;
  usuarioLogueado: any;
  calificaciones: any[] = [];
  calificacionPromedio: number = 0;

  constructor(private route: ActivatedRoute, private authService: AuthService, private calificacionService: CalificacionService) { }

  ngOnInit(): void {
    const usuarioLogueado = this.authService.obtenerUsuario();
    if (usuarioLogueado) {
      this.usuarioLogueado = usuarioLogueado; // Guardar datos del usuario logueado
    }
    this.evaluadoId = this.route.snapshot.paramMap.get('id')!;
    this.pedidoId = this.route.snapshot.queryParamMap.get('pedidoId')!; // Suponiendo que el pedidoId viene en la URL
    this.obtenerUsuarioConCalificaciones();
  }

  enviarCalificacion(): void {
    if (this.puntuacion < 1 || this.puntuacion > 5) {
      Swal.fire('Error', 'La puntuación debe estar entre 1 y 5.', 'error');
      return;
    }

    this.calificacionService.crearCalificacion({
      evaluadoId: this.evaluadoId,
      evaluadorId: this.usuarioLogueado._id,
      puntuacion: this.puntuacion,
      comentario: this.comentario
    }).subscribe(
      () => {
        Swal.fire('Gracias', 'Tu calificación ha sido enviada.', 'success');
      },
      (error) => {
        console.error('Error al enviar la calificación:', error);
        Swal.fire('Error', 'No se pudo enviar tu calificación.', 'error');
      }
    );
  }

  obtenerUsuarioConCalificaciones(): void {
    this.authService.obtenerUsuarioConCalificaciones(this.evaluadoId).subscribe(
      (data) => {
        this.usuario = data.usuario;
        this.calificaciones = data.calificaciones;
        this.calcularPromedio();
      },
      (error) => {
        console.error('Error al obtener los datos del usuario:', error);
      }
    );
  }

  calcularPromedio(): void {
    if (this.calificaciones.length > 0) {
      const totalPuntuacion = this.calificaciones.reduce((acc, cal) => acc + cal.puntuacion, 0);
      this.calificacionPromedio = totalPuntuacion / this.calificaciones.length;
    } else {
      this.calificacionPromedio = 0;
    }
  }
}
