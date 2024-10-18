const express = require('express');
const { obtenerPedidosComprador, obtenerPedidoPorId } = require('./pedido.controller');
const router = express.Router();

router.get('/comprador/:usuarioId', obtenerPedidosComprador);
router.get('/getPedidoId/:pedidoId', obtenerPedidoPorId);

module.exports = router;
