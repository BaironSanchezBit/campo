const express = require('express');
const { 
    crearProducto, 
    obtenerProductos, 
    obtenerProductosPorUsuario, 
    obtenerProductoPorId, 
    actualizarProducto, 
    eliminarProducto, 
    actualizarEstadoCalidad // Importa la función para actualizar el estado de calidad
} = require('./producto.controller');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads')); // Asegúrate de que esta ruta sea correcta
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Ruta para crear productos
router.post('/', upload.array('fotos', 10), crearProducto);

// Hacer estáticos los archivos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas existentes
router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);
router.get('/user/:id', obtenerProductosPorUsuario);
router.put('/:id', upload.fields([
    { name: 'fotosExistentes', maxCount: 10 },
    { name: 'nuevasFotos', maxCount: 10 }
]), actualizarProducto);
router.delete('/:id', eliminarProducto);

// **Nueva ruta para actualizar el estado de calidad**
router.patch('/estado/:id', actualizarEstadoCalidad); // Aquí usamos el controlador para actualizar el estado de calidad

module.exports = router;
