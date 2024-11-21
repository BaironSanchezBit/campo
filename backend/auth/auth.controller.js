const axios = require('axios');
const Usuario = require('./auth.model');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const Calificacion = require('../calificaciones/calificaciones.model'); // Importar el modelo de calificaciones

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

exports.registrarUsuario = async (req, res) => {
    const { nombres, apellidos, correo, contrasena, fotoPerfil, celular, rol, captchaToken } = req.body;

    try {
        // Paso 2: Validar el token de reCAPTCHA
        const secretKey = '6LfinXUqAAAAAIU7TPyFlme33x4EnOmqk5q9Cmad'; // tu clave secreta de reCAPTCHA
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

        const response = await axios.post(verifyUrl);
        if (!response.data.success) {
            return res.status(400).json({ msg: 'Error de verificación de CAPTCHA' });
        }

        // Paso 3: Verificar si el usuario ya existe
        let usuario = await Usuario.findOne({ correo });
        if (usuario) {
            return res.status(400).json({ msg: 'El usuario ya está registrado' });
        }

        // Crear nuevo usuario
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
                            <a href="https://arribaelcampo.store/confirmar/${tokenVerificacion}" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">Confirmar Cuenta</a>
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

exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, '-contrasena'); // Excluye la contraseña por seguridad
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los usuarios');
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

        res.json({ token, user: usuario });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).send('Error en el servidor');
    }
};

// Crear un usuario
exports.crearUsuario = async (req, res) => {
    const { nombres, apellidos, correo, contrasena, fotoPerfil, celular, rol, verificado } = req.body;
    try {
        let usuario = await Usuario.findOne({ correo });
        if (usuario) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        // Crear nuevo usuario
        usuario = new Usuario({ nombres, apellidos, correo, contrasena, fotoPerfil, celular, rol, verificado });
        await usuario.save();

        // Generar token de verificación con expiración de 5 minutos
        const tokenVerificacion = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '5m' });

        // Enviar correo de verificación
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
                            <a href="https://arribaelcampo.store/confirmar/${tokenVerificacion}" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">Confirmar Cuenta</a>
                        </div>
                        
                        <p style="font-size: 16px; color: #555555; margin-top: 20px;">Este enlace expirará en 5 minutos. Si no solicitaste esta confirmación, puedes ignorar este correo.</p>
                        <p style="font-size: 14px; color: #aaaaaa; text-align: center; margin-top: 20px;">Arriba el Campo - Promoviendo la agricultura local</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ msg: 'Usuario creado y correo de verificación enviado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

// Actualizar un usuario
exports.actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    let { contrasena } = req.body; // Captura la contraseña si está presente en la solicitud

    try {
        // Si hay una contraseña proporcionada, aplicamos hashing
        if (contrasena) {
            const salt = await bcrypt.genSalt(10);
            contrasena = await bcrypt.hash(contrasena, salt);
            req.body.contrasena = contrasena; // Reemplaza la contraseña en el cuerpo de la solicitud
        }

        const usuario = await Usuario.findByIdAndUpdate(id, req.body, { new: true });
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

exports.actualizarUsuarioPerfil = async (req, res) => {
    const { id } = req.params;
    let { contrasena } = req.body;

    try {
        // Si hay una nueva contraseña proporcionada, encripta antes de guardarla
        if (contrasena) {
            const salt = await bcrypt.genSalt(10);
            contrasena = await bcrypt.hash(contrasena, salt);
            req.body.contrasena = contrasena;
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!usuarioActualizado) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json(usuarioActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar el perfil.' });
    }
};

// Eliminar un usuario
exports.eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const usuario = await Usuario.findByIdAndDelete(id);
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json({ msg: 'Usuario eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

exports.solicitarRecuperacionContrasena = async (req, res) => {
    const { correo } = req.body;

    try {
        // Verificar si el usuario existe
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(404).json({ msg: 'No existe una cuenta con este correo' });
        }

        // Generar un token para el enlace de recuperación de contraseña (válido por 1 hora)
        const tokenRecuperacion = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Opciones de correo con el nuevo diseño estilizado
        const mailOptions = {
            from: 'no.reply.arribaelcampo@gmail.com',
            to: correo,
            subject: 'Recuperación de contraseña - Arriba el Campo',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #dddddd;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <img src="https://arribaelcampo.store/assets/img/logo.ico" alt="Arriba el Campo" style="max-width: 100px;">
                        </div>
                        <h2 style="color: #27ae60; text-align: center;">Recupera tu contraseña</h2>
                        <p style="font-size: 16px; color: #555555;">Hola ${usuario.nombres},</p>
                        <p style="font-size: 16px; color: #555555;">Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón a continuación para iniciar el proceso de restablecimiento:</p>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="https://arribaelcampo.store/reset-password/${encodeURIComponent(tokenRecuperacion)}" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">Restablecer Contraseña</a>
                        </div>
                        
                        <p style="font-size: 16px; color: #555555; margin-top: 20px;">Este enlace es válido por 1 hora. Si no solicitaste el cambio, puedes ignorar este correo.</p>
                        <p style="font-size: 14px; color: #aaaaaa; text-align: center; margin-top: 20px;">Arriba el Campo - Promoviendo la agricultura local</p>
                    </div>
                </div>
            `
        };

        // Enviar correo de recuperación
        await transporter.sendMail(mailOptions);

        res.json({ msg: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al procesar la solicitud de recuperación.' });
    }
};


exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar al usuario por su ID
        const usuario = await Usuario.findById(decoded.id);
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // Actualizar la contraseña (sin encriptarla aquí si ya está siendo manejada por el 'pre' hook)
        usuario.contrasena = newPassword;
        await usuario.save();

        res.json({ msg: 'Contraseña actualizada con éxito' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ msg: 'El enlace de restablecimiento ha expirado. Solicita uno nuevo.' });
        }
        console.error(error);
        res.status(500).json({ msg: 'Error al restablecer la contraseña' });
    }
};

exports.obtenerUsuarioConCalificaciones = async (req, res) => {
    const { id } = req.params;

    try {
        // Buscar usuario
        const usuario = await Usuario.findById(id, '-contrasena');
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // Buscar calificaciones asociadas al usuario
        const calificaciones = await Calificacion.find({ evaluadoId: id });

        // Calcular la calificación promedio
        const promedio =
            calificaciones.length > 0
                ? calificaciones.reduce((sum, cal) => sum + cal.puntuacion, 0) / calificaciones.length
                : 0;

        res.json({
            usuario,
            calificaciones,
            promedio: promedio.toFixed(2) // Limitar a 2 decimales
        });
    } catch (error) {
        console.error('Error al obtener usuario y calificaciones:', error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

exports.actualizarVendedor = async (req, res) => {
    const { id } = req.params;
    const { ubicacionFinca, nombreFinca, hectareasProduccion } = req.body;

    try {
        // Preparar los datos para la actualización
        const datosActualizados = {
            ubicacionFinca,
            nombreFinca,
            hectareasProduccion,
            estado: 'Para Verificar', // Cambiar automáticamente el estado a "Para Verificar"
        };

        // Si hay un archivo de verificación, también incluirlo
        if (req.file) {
            datosActualizados.documentoVerificacion = req.file.filename;
        }

        // Actualizar el vendedor en la base de datos
        const vendedorActualizado = await Usuario.findByIdAndUpdate(id, datosActualizados, { new: true });

        if (!vendedorActualizado) {
            return res.status(404).json({ msg: 'Vendedor no encontrado' });
        }

        res.json({ msg: 'Vendedor actualizado con éxito', vendedor: vendedorActualizado });
    } catch (error) {
        console.error('Error al actualizar el vendedor:', error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

exports.obtenerUsuarioPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await Usuario.findById(id, '-contrasena');
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

exports.obtenerVendedoresParaVerificar = async (req, res) => {
    try {
        const vendedores = await Usuario.find({ rol: 'vendedor', estado: 'Para Verificar' }, '-contrasena');
        if (!vendedores || vendedores.length === 0) {
            return res.status(404).json({ msg: 'No hay vendedores para verificar.' });
        }
        res.json(vendedores);
    } catch (error) {
        console.error('Error al obtener vendedores para verificar:', error);
        res.status(500).json({ msg: 'Error en el servidor.' });
    }
};

exports.actualizarEstadoVendedor = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        // Actualiza el estado del vendedor
        const vendedor = await Usuario.findByIdAndUpdate(id, { estado }, { new: true });
        if (!vendedor) {
            return res.status(404).json({ msg: 'Vendedor no encontrado' });
        }

        // Mensaje de correo basado en el estado
        let asunto = '';
        let mensaje = '';

        if (estado === 'Aprobado') {
            asunto = '¡Tu cuenta ha sido aprobada!';
            mensaje = `
                <p>Hola ${vendedor.nombres},</p>
                <p>Nos complace informarte que tu cuenta como vendedor ha sido <strong>aprobada</strong>.</p>
                <p>Ahora puedes comenzar a publicar productos en nuestra plataforma.</p>
                <p>Gracias por ser parte de Arriba el Campo.</p>
            `;
        } else if (estado === 'Rechazado') {
            asunto = 'Estado de tu cuenta en Arriba el Campo';
            mensaje = `
                <p>Hola ${vendedor.nombres},</p>
                <p>Lamentamos informarte que tu cuenta como vendedor ha sido <strong>rechazada</strong>.</p>
                <p>Por favor verifica que toda la documentación enviada sea correcta o contacta con nosotros para más detalles.</p>
                <p>Gracias por tu comprensión.</p>
            `;
        }

        // Enviar correo al vendedor
        const mailOptions = {
            from: 'no.reply.arribaelcampo@gmail.com',
            to: vendedor.correo,
            subject: asunto,
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #dddddd;">
                        <h2 style="color: #27ae60; text-align: center;">Arriba el Campo</h2>
                        ${mensaje}
                        <p style="text-align: center; margin-top: 20px; color: #555555;">Arriba el Campo - Promoviendo la agricultura local</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        // Obtén la lista actualizada de vendedores con estado "Para Verificar"
        const vendedores = await Usuario.find({ rol: 'vendedor', estado: 'Para Verificar' });

        res.json({ msg: 'Estado del vendedor actualizado con éxito y correo enviado', vendedores });
    } catch (error) {
        console.error('Error al actualizar el estado del vendedor:', error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};