const Producto = require('./producto.model');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');
const Usuario = require('../auth/auth.model');

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'no.reply.arribaelcampo@gmail.com',
        pass: 'vbdj zouh fppj loki'
    },
    pool: true,
    rateLimit: true,
    maxConnections: 5,
    maxMessages: 10
});

const enviarCorreoProducto = async (usuario, producto, estado, razonRechazo = null) => {
    try {
        const asunto = estado === 'aprobado'
            ? 'Tu producto ha sido aprobado - Arriba el Campo'
            : 'Tu producto ha sido rechazado - Arriba el Campo';

        const mensaje = estado === 'aprobado'
            ? `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #dddddd;">
                        <h2 style="color: #27ae60; text-align: center;">Tu producto ha sido aprobado</h2>
                        <p style="font-size: 16px; color: #555555;">Hola ${usuario.nombres},</p>
                        <p style="font-size: 16px; color: #555555;">Nos complace informarte que tu producto <strong>${producto.titulo}</strong> ha sido aprobado y ahora está disponible en el mercado.</p>
                        <p style="font-size: 14px; color: #aaaaaa; text-align: center;">Arriba el Campo - Promoviendo la agricultura local</p>
                    </div>
                </div>
            `
            : `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #dddddd;">
                        <h2 style="color: #e74c3c; text-align: center;">Tu producto ha sido rechazado</h2>
                        <p style="font-size: 16px; color: #555555;">Hola ${usuario.nombres},</p>
                        <p style="font-size: 16px; color: #555555;">Lamentamos informarte que tu producto <strong>${producto.titulo}</strong> ha sido rechazado.</p>
                        <p style="font-size: 16px; color: #555555;">Razón del rechazo:</p>
                        <p style="font-size: 16px; color: #e74c3c; margin-left: 20px;"><em>${razonRechazo}</em></p>
                        <p style="font-size: 14px; color: #aaaaaa; text-align: center;">Arriba el Campo - Promoviendo la agricultura local</p>
                    </div>
                </div>
            `;

        const mailOptions = {
            from: 'no.reply.arribaelcampo@gmail.com',
            to: usuario.correo,
            subject: asunto,
            html: mensaje,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Correo enviado al usuario ${usuario.correo} para el producto ${producto.titulo} (${estado}).`);
    } catch (error) {
        console.error(`Error al enviar el correo para el producto ${producto.titulo} (${estado}):`, error);
    }
};

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
    const { estadoCalidad } = req.query;

    try {
        const query = estadoCalidad ? { estadoCalidad } : {};
        const productos = await Producto.find(query).populate('usuarioId', 'nombres apellidos');
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

        // Inicializar fotosFinales como un array vacío
        let fotosFinales = [];

        // Validar y procesar fotosExistentes
        if (fotosExistentes) {
            if (typeof fotosExistentes === 'string') {
                try {
                    // Intentar convertir el string a un array
                    fotosFinales = JSON.parse(fotosExistentes);
                } catch (error) {
                    console.error('Error al parsear fotosExistentes:', error);
                    // Manejar el error si no es un JSON válido
                    fotosFinales = fotosExistentes.split(',').map(foto => foto.trim()); // Suponer que son valores separados por comas
                }
            } else if (Array.isArray(fotosExistentes)) {
                fotosFinales = fotosExistentes;
            }
        }

        // Si hay nuevas fotos, añadirlas al array
        if (nuevasFotos.length > 0) {
            fotosFinales = fotosFinales.concat(nuevasFotos);
        }

        // Actualiza el producto con la nueva información
        const productoActualizado = await Producto.findByIdAndUpdate(id, {
            titulo,
            descripcion,
            tipo,
            precio,
            cantidadDisponible,
            ciudad,
            estado,
            fotos: fotosFinales // Combina imágenes existentes y nuevas
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

exports.aprobarProducto = async (req, res) => {
    console.log('aprobarProducto llamado con ID:', req.params.id);

    try {
        const producto = await Producto.findByIdAndUpdate(
            req.params.id,
            { estadoCalidad: 'aprobado' },
            { new: true }
        ).populate('usuarioId', 'nombres correo');

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        console.log('Aprobando producto:', producto.titulo);
        await enviarCorreoProducto(producto.usuarioId, producto, 'aprobado');

        res.json({ message: 'Producto aprobado con éxito', producto });
    } catch (error) {
        console.error('Error al aprobar el producto:', error);
        res.status(500).json({ message: 'Error al aprobar el producto' });
    }
};

exports.rechazarProducto = async (req, res) => {
    console.log('rechazarProducto llamado con ID:', req.params.id);
    console.log('Cuerpo de la solicitud:', req.body); // Agrega este log

    try {
        const producto = await Producto.findById(req.params.id).populate('usuarioId', 'nombres correo');
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        console.log('Rechazando producto:', producto.titulo);
        console.log('Razón del rechazo:', req.body.razonRechazo);

        if (!req.body.razonRechazo) {
            return res.status(400).json({ message: 'Razón de rechazo requerida.' });
        }

        await enviarCorreoProducto(producto.usuarioId, producto, 'rechazado', req.body.razonRechazo);

        await Producto.findByIdAndDelete(req.params.id);

        res.json({ message: 'Producto rechazado con éxito y eliminado', producto });
    } catch (error) {
        console.error('Error al rechazar el producto:', error);
        res.status(500).json({ message: 'Error al rechazar el producto' });
    }
};

exports.obtenerProductosPendientes = async (req, res) => {
    try {
        const productos = await Producto.find({ estadoCalidad: 'pendiente' });
        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los productos pendientes' });
    }
};

exports.obtenerProductosAprobados = async (req, res) => {
    try {
        const productos = await Producto.find({ estadoCalidad: 'aprobado' });
        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los productos aprobados' });
    }
};

exports.actualizarEstadoCalidad = async (req, res) => {
    const { id } = req.params;
    const { estadoCalidad, razonRechazo } = req.body;

    console.log('Cuerpo recibido:', req.body);

    try {
        if (estadoCalidad === 'aprobado') {
            console.log('Redirigiendo a aprobarProducto...');
            return exports.aprobarProducto(req, res);
        } else if (estadoCalidad === 'rechazado') {
            if (!razonRechazo) {
                return res.status(400).json({ message: 'Razón de rechazo requerida.' });
            }
            console.log('Redirigiendo a rechazarProducto...');
            return exports.rechazarProducto(req, res);
        } else {
            return res.status(400).json({ message: 'Estado de calidad no válido.' });
        }
    } catch (error) {
        console.error('Error al actualizar el estado de calidad:', error);
        res.status(500).json({ message: 'Error al actualizar el estado de calidad.' });
    }
};