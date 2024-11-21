import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PedidoService } from '../../services/pedido.service';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ganancias',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ganancias.component.html',
  styleUrls: ['./ganancias.component.css']
})
export class GananciasComponent implements OnInit {
  gananciasPorDia: any[] = [];

  constructor(private pedidoService: PedidoService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.cargarGanancias();
  }

  cargarGanancias() {
    this.pedidoService.obtenerComisiones().subscribe(
      (comisiones: any[]) => {
        this.gananciasPorDia = this.procesarGananciasPorFecha(comisiones);
        this.crearGraficoGanancias(this.gananciasPorDia);
      },
      error => {
        console.error('Error al cargar las comisiones:', error);
      }
    );
  }

  procesarGananciasPorFecha(comisiones: any[]) {
    // Agrupar por fecha y sumar los valores
    return comisiones.reduce((acc: any, curr: any) => {
      const fecha = curr.fecha.split('T')[0];
      const existing = acc.find((item: any) => item.fecha === fecha);

      if (existing) {
        existing.ganancias += curr.valor;
      } else {
        acc.push({ fecha, ganancias: curr.valor });
      }

      return acc;
    }, []);
  }

  crearGraficoGanancias(data: any[]) {
    let root = am5.Root.new("graficoGanancias");
    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true
    }));

    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: "fecha",
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 30 })
    }));

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    let series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Ganancias",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "ganancias",
      categoryXField: "fecha",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{categoryX}: ${valueY}"
      })
    }));

    series.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5 });

    xAxis.data.setAll(data);
    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);
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