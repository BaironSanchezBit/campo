const Usuario = require('./auth.model');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'no.reply.arribaelcampo@gmail.com',
        pass: 'vbdj zouh fppj loki'
    }
});

// Registro de usuario con correo de confirmación estilizado
exports.registrarUsuario = async (req, res) => {
    const { nombres, apellidos, correo, contrasena, fotoPerfil, celular, rol } = req.body;

    try {
        // Verificar si el usuario ya existe
        let usuario = await Usuario.findOne({ correo });
        if (usuario) {
            return res.status(400).json({ msg: 'El usuario ya está registrado' });
        }

        // Crear nuevo usuario sin verificación
        usuario = new Usuario({ nombres, apellidos, correo, contrasena, fotoPerfil, celular, rol, verificado: false });
        await usuario.save();

        // Generar token de verificación con expiración de 5 minutos
        const tokenVerificacion = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '5m' });

        // Opciones de correo estilizado
        const mailOptions = {
            from: 'no.reply.arribaelcampo@gmail.com',
            to: usuario.correo,
            subject: 'Confirma tu cuenta - Arriba el Campo',
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #dddddd;">
                    <h2 style="color: #27ae60; text-align: center;">Bienvenido a Arriba el Campo</h2>
                    <p style="font-size: 16px; color: #555555;">Hola ${nombres},</p>
                    <p style="font-size: 16px; color: #555555;">Gracias por registrarte en Arriba el Campo. Para activar tu cuenta y empezar a disfrutar de todos los beneficios, confirma tu correo electrónico haciendo clic en el botón a continuación:</p>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="http://localhost:4200/confirmar/${tokenVerificacion}" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">Confirmar Cuenta</a>
                    </div>
                    
                    <p style="font-size: 16px; color: #555555; margin-top: 20px;">Este enlace expirará en 5 minutos. Si no solicitaste esta confirmación, puedes ignorar este correo.</p>
                    <p style="font-size: 14px; color: #aaaaaa; text-align: center; margin-top: 20px;">Arriba el Campo - Promoviendo la agricultura local</p>
                </div>
            </div>
            `
        };

        // Enviar correo de confirmación
        await transporter.sendMail(mailOptions);

        res.status(201).json({ msg: 'Usuario registrado. Revisa tu correo para confirmar la cuenta en los próximos 5 minutos.' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
};


exports.confirmarCuenta = async (req, res) => {
    const { token } = req.params;

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.findById(decoded.id);

        if (!usuario) {
            return res.status(400).json({ msg: 'Token inválido o usuario no encontrado' });
        }

        // Marcar el usuario como verificado
        usuario.verificado = true;
        await usuario.save();

        // Generar token de autenticación para inicio de sesión automático
        const authToken = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ msg: 'Cuenta verificada exitosamente', token: authToken, user: usuario });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ msg: 'El enlace de verificación ha expirado. Solicita un nuevo enlace.' });
        }
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
};

// Inicio de sesión
exports.iniciarSesion = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        // Verificar si el usuario existe
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({ msg: 'El usuario no existe' });
        }

        // Verificar si el usuario ha confirmado su cuenta
        if (!usuario.verificado) {
            return res.status(400).json({ msg: 'Por favor confirma tu cuenta antes de iniciar sesión.' });
        }

        // Verificar la contraseña
        const esContrasenaValida = await usuario.compararContraseña(contrasena);
        if (!esContrasenaValida) {
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
