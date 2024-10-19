const express = require('express');
const { obtenerPedidosComprador, obtenerPedidoPorId, obtenerPedidosVendedor } = require('./pedido.controller');
const router = express.Router();

router.get('/comprador/:usuarioId', obtenerPedidosComprador);
router.get('/getPedidoId/:pedidoId', obtenerPedidoPorId);
router.get('/vendedor/:vendedorId', obtenerPedidosVendedor);

module.exports = router;
