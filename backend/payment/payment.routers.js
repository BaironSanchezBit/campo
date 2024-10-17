const express = require('express');
const { procesarPago } = require('./payment.controller');
const router = express.Router();

router.post('/procesar-pago', procesarPago);

module.exports = router;
