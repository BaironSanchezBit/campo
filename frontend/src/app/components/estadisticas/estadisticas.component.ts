import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NavbarComponent, FooterComponent],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit {
  productosMasVendidos: any[] = [];
  pedidos: any[] = [];

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    const usuarioId = this.authService.obtenerUsuarioId();

    if (!usuarioId) {
      console.error('No se encontró un usuario logueado.');
      return;
    }

    this.pedidoService.obtenerPedidosVendedor(usuarioId).subscribe(
      (pedidos: any[]) => {
        this.pedidos = pedidos;

        // Procesar datos para los gráficos
        this.productosMasVendidos = this.procesarProductosMasVendidos(pedidos, usuarioId);
        const gananciasPorDia = this.procesarGananciasPorDia(pedidos, usuarioId);

        // Crear gráficos
        this.crearGraficoPedidos(gananciasPorDia);
        this.crearGraficoProductos(this.productosMasVendidos);
      },
      error => {
        console.error('Error al cargar los pedidos:', error);
      }
    );
  }

  procesarProductosMasVendidos(pedidos: any[], usuarioId: string) {
    const productos = pedidos.flatMap(pedido =>
      pedido.productos.filter((producto: any) => producto.vendedorId === usuarioId)
    );

    const agrupados = productos.reduce((acc: any, producto: any) => {
      if (!acc[producto.productoId]) {
        acc[producto.productoId] = {
          titulo: producto.productoId.titulo,
          cantidad: 0
        };
      }
      acc[producto.productoId].cantidad += producto.cantidad;
      return acc;
    }, {});

    return Object.values(agrupados);
  }

  procesarGananciasPorDia(pedidos: any[], usuarioId: string) {
    const data = pedidos.map(pedido => {
      // Calcula las ganancias totales del vendedor en el pedido
      const gananciasTotales = pedido.productos
        .filter((producto: any) => producto.vendedorId === usuarioId)
        .reduce((sum: number, producto: any) => sum + producto.precio * producto.cantidad, 0);
  
      // Aplica el 3% de comisión
      const gananciasConComision = gananciasTotales * 0.97;
  
      return {
        fecha: pedido.fechaCreacion.split("T")[0],
        ganancias: gananciasConComision
      };
    });
  
    // Agrupar ganancias por fecha
    return data.reduce((acc: any, curr: any) => {
      const existing = acc.find((item: any) => item.fecha === curr.fecha);
      if (existing) {
        existing.ganancias += curr.ganancias;
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);
  }

  crearGraficoPedidos(data: any[]) {
    let root = am5.Root.new("graficoPedidos");
    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingLeft: 0,
      paddingRight: 15
    }));

    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);

    let xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 30,
      minorGridEnabled: true
    });

    xRenderer.labels.template.setAll({
      rotation: -90,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15
    });

    xRenderer.grid.template.setAll({ location: 1 });

    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: "fecha",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    }));

    let yRenderer = am5xy.AxisRendererY.new(root, {
      strokeOpacity: 0.1
    });

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 0.3,
      renderer: yRenderer
    }));

    let series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Ganancias",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "ganancias",
      categoryXField: "fecha",
      tooltip: am5.Tooltip.new(root, {
        labelText: "[bold]{categoryX}[/]: ${valueY}"
      })
    }));

    series.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5, strokeOpacity: 0 });
    series.columns.template.adapters.add("fill", (fill, target) => {
      return chart.get("colors")?.getIndex(series.columns.indexOf(target));
    });
    series.columns.template.adapters.add("stroke", (stroke, target) => {
      return chart.get("colors")?.getIndex(series.columns.indexOf(target));
    });

    xAxis.data.setAll(data);
    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);
  }

  crearGraficoProductos(data: any[]) {
    let root = am5.Root.new("graficoProductos");
    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingLeft: 0,
      paddingRight: 15
    }));

    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);

    let xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 30,
      minorGridEnabled: true
    });

    xRenderer.labels.template.setAll({
      rotation: -90,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15
    });

    xRenderer.grid.template.setAll({ location: 1 });

    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: "titulo",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    }));

    let yRenderer = am5xy.AxisRendererY.new(root, {
      strokeOpacity: 0.1
    });

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 0.3,
      renderer: yRenderer
    }));

    let series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Productos Vendidos",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "cantidad",
      categoryXField: "titulo",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{categoryX}: {valueY} unidades"
      })
    }));

    series.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5, strokeOpacity: 0 });
    series.columns.template.adapters.add("fill", (fill, target) => {
      return chart.get("colors")?.getIndex(series.columns.indexOf(target));
    });
    series.columns.template.adapters.add("stroke", (stroke, target) => {
      return chart.get("colors")?.getIndex(series.columns.indexOf(target));
    });

    xAxis.data.setAll(data);
    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);
  }
}