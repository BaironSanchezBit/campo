const express = require('express');
const { registrarUsuario, iniciarSesion, confirmarCuenta, obtenerUsuarios, obtenerUsuarioPorId, actualizarEstadoVendedor, obtenerVendedoresParaVerificar, crearUsuario, obtenerUsuarioConCalificaciones, actualizarVendedor, actualizarUsuario, actualizarUsuarioPerfil, eliminarUsuario, solicitarRecuperacionContrasena, resetPassword } = require('./auth.controller');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads')); // Carpeta para guardar los archivos
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Middleware de subida de archivos
const upload = multer({ storage: storage });

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
router.put('/vendedor/:id', upload.single('documentoVerificacion'), actualizarVendedor);
router.get('/usuario/:id', autenticarToken, obtenerUsuarioPorId);
router.get('/vendedores/para-verificar', obtenerVendedoresParaVerificar);
router.put('/vendedor/:id/estado', actualizarEstadoVendedor);

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
