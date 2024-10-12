const Usuario = require('./auth.model');
const jwt = require('jsonwebtoken');

// Registro de usuario
exports.registrarUsuario = async (req, res) => {
    const { nombres, apellidos, correo, contrasena, fotoPerfil, celular, rol } = req.body;

    try {
        // Verificar si el usuario ya existe
        let usuario = await Usuario.findOne({ correo });
        if (usuario) {
            return res.status(400).json({ msg: 'El usuario ya está registrado' });
        }

        // Crear nuevo usuario
        usuario = new Usuario({ nombres, apellidos, correo, contrasena, fotoPerfil, celular, rol });
        await usuario.save();

        // Generar token de autenticación
        const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        // Devolver token y usuario
        res.status(201).json({ token, user: usuario });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
};

// Inicio de sesión
exports.iniciarSesion = async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        // Verificar si el usuario existe
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({ msg: 'El usuario no existe' });
        }

        // Verificar la contraseña
        const esContraseñaValida = await usuario.compararContraseña(contraseña);
        if (!esContraseñaValida) {
            return res.status(400).json({ msg: 'Contraseña o correo electrónico incorrecto' });
        }

        // Generar token de autenticación
        const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        // Devolver token y usuario
        res.json({ token, user: usuario });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
};
