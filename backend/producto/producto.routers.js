const express = require('express');
const { crearProducto, obtenerProductos, obtenerProductosPorUsuario, obtenerProductoPorId, actualizarProducto, eliminarProducto } = require('./producto.controller');
const router = express.Router();
const multer = require('multer');

// Configurar multer para la ruta
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/', upload.array('fotos', 10), crearProducto);

router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);
router.get('/user/:id', obtenerProductosPorUsuario);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;
