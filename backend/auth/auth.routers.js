const express = require('express');
const { registrarUsuario, iniciarSesion, confirmarCuenta } = require('./auth.controller');
const router = express.Router();

router.post('/registro', registrarUsuario);
router.post('/login', iniciarSesion);
router.get('/confirmar/:token', confirmarCuenta);

module.exports = router;
