const express = require('express');
const { crearCalificacion, obtenerCalificacionesPorUsuario} = require('./calificaciones.controller');
const router = express.Router();

router.post('/calificaciones', crearCalificacion);
router.get('/calificaciones/:evaluadoId', obtenerCalificacionesPorUsuario);

module.exports = router;
