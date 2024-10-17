const express = require('express');
const { procesarPago, obtenerPedidosComprador } = require('./pedido.controller');
const router = express.Router();

router.post('/procesar-pago', procesarPago);  // Crear el pedido al procesar el pago
router.get('/pedidos/:usuarioId', obtenerPedidosComprador);  // Obtener los pedidos del comprador actual

module.exports = router;
