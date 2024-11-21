const express = require('express');
const {
    obtenerPedidosComprador,
    obtenerPedidoPorId,
    obtenerPedidosVendedor,
    actualizarEstadoProductoPorVendedor,
    actualizarEstadoProductoPorTransportador,
    obtenerPedidosEnviados,
    asignarTransportador,
    obtenerPedidosPorTransportador,
    actualizarEstadoGeneralPedido,
    obtenerTransportadores,
    obtenerComisiones } = require('./pedido.controller');
const router = express.Router();

router.get('/comprador/:usuarioId', obtenerPedidosComprador);
router.get('/getPedidoId/:pedidoId', obtenerPedidoPorId);
router.get('/vendedor/:vendedorId', obtenerPedidosVendedor);
router.post('/actualizar-estado-vendedor', actualizarEstadoProductoPorVendedor);
router.post('/actualizar-estado-transportador', actualizarEstadoProductoPorTransportador);
router.get('/enviados', obtenerPedidosEnviados);
router.post('/asignar-transportador', asignarTransportador);
router.get('/por-transportador/:transportadorId', obtenerPedidosPorTransportador);
router.post('/actualizar-estado-general', actualizarEstadoGeneralPedido);
router.get('/transportadores', obtenerTransportadores);
router.get('/comisiones', obtenerComisiones);


module.exports = router;
