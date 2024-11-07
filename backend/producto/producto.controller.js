const Producto = require('./producto.model');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Configurar multer para almacenar las imágenes en la carpeta "uploads"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads'));  // Guardar en la carpeta "uploads"
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Crear un nuevo producto
exports.crearProducto = async (req, res) => {
    const { titulo, descripcion, tipo, precio, cantidadDisponible, ciudad, estado, usuarioId } = req.body;

    try {
        const fotos = req.files.map(file => file.filename);  // Guardar los nombres de los archivos subidos

        const nuevoProducto = new Producto({
            titulo,
            descripcion,
            tipo,
            precio,
            cantidadDisponible,
            ciudad,
            fotos,  // Guardar los nombres de las fotos
            estado,
            usuarioId
        });

        await nuevoProducto.save();
        res.status(201).json(nuevoProducto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el producto' });
    }
};


// Listar todos los productos
exports.obtenerProductos = async (req, res) => {
    try {
        // Utiliza populate para traer los datos del usuario que creó el producto
        const productos = await Producto.find().populate('usuarioId', 'nombres apellidos');
        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los productos' });
    }
};

// Obtener un producto por ID
exports.obtenerProductoPorId = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el producto' });
    }
};

exports.obtenerProductosPorUsuario = async (req, res) => {
    const usuarioId = req.params.id;

    try {
        const productos = await Producto.find({ usuarioId });
        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los productos' });
    }
};

exports.actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, tipo, precio, cantidadDisponible, ciudad, estado, fotosExistentes } = req.body;

    try {
        // Manejar archivos subidos con multer
        let nuevasFotos = [];
        if (req.files && req.files['nuevasFotos']) {
            nuevasFotos = req.files['nuevasFotos'].map(file => file.filename);
        }

        let fotosFinales = [];
        if (fotosExistentes) {
            if (typeof fotosExistentes === 'string') {
                try {
                    fotosFinales = JSON.parse(fotosExistentes);
                } catch (error) {
                    console.error('Error al parsear fotosExistentes:', error);
                    fotosFinales = [];
                }
            } else if (Array.isArray(fotosExistentes)) {
                fotosFinales = fotosExistentes;
            }
        }

        // Combina las fotos existentes con las nuevas
        fotosFinales = fotosFinales.concat(nuevasFotos);

        // Actualiza el producto con la nueva información
        const productoActualizado = await Producto.findByIdAndUpdate(id, {
            titulo,
            descripcion,
            tipo,
            precio,
            cantidadDisponible,
            ciudad,
            estado,
            fotos: fotosFinales  // Aquí se usa la combinación de fotos
        }, { new: true });

        if (!productoActualizado) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(productoActualizado);
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ message: 'Error al actualizar el producto' });
    }
};

const eliminarArchivo = (ruta) => {
    fs.unlink(ruta, (error) => {
        if (error) {
            console.error(`Error al eliminar el archivo ${ruta}:`, error);
        } else {
        }
    });
};

exports.eliminarProducto = async (req, res) => {
    const { id } = req.params;

    try {
        // Buscar el producto por ID para obtener las fotos
        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Eliminar las fotos asociadas del sistema de archivos
        if (producto.fotos && producto.fotos.length > 0) {
            producto.fotos.forEach(foto => {
                const fotoPath = path.join(__dirname, '../../uploads', foto); // Ruta completa del archivo
                if (fs.existsSync(fotoPath)) {
                    eliminarArchivo(fotoPath); // Usar función asíncrona
                } else {
                    console.log(`Foto no encontrada: ${fotoPath}`);
                }
            });
        }

        // Eliminar el producto de la base de datos
        await Producto.findByIdAndDelete(id);

        res.json({ message: 'Producto y fotos eliminados correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el producto y las fotos' });
    }
};
