const express = require('express');
const { registrarUsuario, iniciarSesion, confirmarCuenta, obtenerUsuarios, crearUsuario, obtenerUsuarioConCalificaciones, actualizarUsuario, actualizarUsuarioPerfil, eliminarUsuario, solicitarRecuperacionContrasena, resetPassword } = require('./auth.controller');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/registro', registrarUsuario);
router.post('/login', iniciarSesion);
router.get('/confirmar/:token', confirmarCuenta);
router.get('/usuarios', autenticarToken, verificarAdmin, obtenerUsuarios);
router.post('/usuario', autenticarToken, verificarAdmin, crearUsuario);
router.put('/usuario/:id', autenticarToken, verificarAdmin, actualizarUsuario);
router.put('/usuarioPerfil/:id', autenticarToken, actualizarUsuarioPerfil);
router.delete('/usuario/:id', autenticarToken, verificarAdmin, eliminarUsuario);
router.post('/solicitar-recuperacion', solicitarRecuperacionContrasena);
router.post('/reset-password', resetPassword);
router.get('/usuario/:id/calificaciones', obtenerUsuarioConCalificaciones);


function autenticarToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ msg: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        console.error('Token inválido o expirado:', error);
        return res.status(403).json({ msg: 'Token no válido o expirado' });
    }
}

function verificarAdmin(req, res, next) {
    if (req.usuario?.rol !== 'admin') {
        return res.status(403).json({ msg: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
}

module.exports = router;
