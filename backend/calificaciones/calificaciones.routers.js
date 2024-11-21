const express = require('express');
const { crearCalificacion } = require('./calificaciones.controller');
const router = express.Router();

router.post('/calificaciones', crearCalificacion);

module.exports = router;
