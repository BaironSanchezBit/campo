const nodemailer = require('nodemailer');
const Producto = require('../producto/producto.model');
const Usuario = require('../auth/auth.model');
const Pedido = require('../pedido/pedido.model');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'no.reply.arribaelcampo@gmail.com',
        pass: 'vbdj zouh fppj loki'
    }
});

// Función para enviar correos utilizando Promesas
function sendMail(mailOptions) {
    return new Promise((resolve, reject) => {
        if (!mailOptions.to || mailOptions.to.trim() === '') {
            return reject(new Error('No recipients defined')); // Validación adicional
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });
    });
}

exports.procesarPago = async (req, res) => {
    const { email, productos, total, usuarioId, direccionEnvio, personaRecibe, numeroCelular, ciudad } = req.body;
    try {
        // Buscar al usuario logueado usando Auth.model (por usuarioId)
        const usuarioLogueado = await Usuario.findById(usuarioId);
        if (!usuarioLogueado || !usuarioLogueado.correo) {
            throw new Error('Usuario logueado no encontrado o sin correo electrónico');
        }

        // Obtener detalles de los productos y vendedores
        const productosConVendedor = await Producto.find({ _id: { $in: productos.map(p => p._id) } }).populate('usuarioId');

        // Crear el pedido en la base de datos
        const pedido = new Pedido({
            compradorId: usuarioLogueado._id,
            productos: productosConVendedor.map(prod => ({
                productoId: prod._id,
                cantidad: productos.find(p => p._id.toString() === prod._id.toString()).cantidad,
                precio: prod.precio,
                vendedorId: prod.usuarioId._id // Asignar correctamente el usuarioId como vendedorId
            })),
            total: total,
            direccionEnvio: direccionEnvio,
            personaRecibe: personaRecibe,
            numeroCelular: numeroCelular,
            ciudad: ciudad
        });

        // Guardar el pedido en la base de datos
        await pedido.save();

        // Ahora que el pedido ha sido creado, proceder a enviar los correos

        // Correo de confirmación de pago para el cliente
        const customerMailOptions = {
            from: 'comprobante@gmail.com',
            to: email,  // Asegurarse de que el correo del cliente esté bien definido
            subject: 'Comprobante de pago - Arriba el Campo',
            html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #dddddd;">
                <h2 style="color: #27ae60; text-align: center;">¡Gracias por tu compra!</h2>
                <p style="font-size: 16px; color: #555555;">Estimado cliente,</p>
                <p style="font-size: 16px; color: #555555;">Tu pedido ha sido recibido exitosamente. A continuación, te compartimos los detalles de tu compra:</p>
                
                <table style="width: 100%; margin-bottom: 20px;">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 8px; color: #27ae60;">Producto</th>
                            <th style="text-align: right; padding: 8px; color: #27ae60;">Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productosConVendedor.map(prod => `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #dddddd;">${prod.titulo}</td>
                                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #dddddd;">${productos.find(p => p._id.toString() === prod._id.toString()).cantidad}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <h3 style="color: #27ae60;">Total: $${total}</h3>
                <h4 style="color: #555555;">Información de envío:</h4>
                <p>Dirección: ${direccionEnvio}</p>
                <p>Persona que recibe: ${personaRecibe}</p>
                <p>Celular: ${numeroCelular}</p>
                <p>Ciudad: ${ciudad}</p>
                
                <p style="font-size: 16px; color: #555555;">Si tienes alguna duda, no dudes en contactarnos. ¡Gracias por confiar en Arriba el Campo!</p>
                <p style="font-size: 14px; color: #aaaaaa; text-align: center;">Arriba el Campo - Promoviendo la agricultura local</p>
            </div>
        </div>
    `
        };

        // Correo de notificación de envío al usuario logueado
        const userMailOptions = {
            from: 'no.reply.arribaelcampo@gmail.com',
            to: usuarioLogueado.correo,  // Asegurarse de que el correo del usuario logueado esté bien definido
            subject: 'Tu pedido ha sido creado - Arriba el Campo',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #dddddd;">
                        <h2 style="color: #27ae60; text-align: center;">Tu pedido ha sido creado</h2>
                        <p style="font-size: 16px; color: #555555;">Estimado/a ${usuarioLogueado.nombres},</p>
                        <p style="font-size: 16px; color: #555555;">Nos complace informarte que tu pedido ha sido creado. Puedes seguir el estado de tu pedido en el siguiente enlace:</p>
                        <p style="text-align: center; margin-top: 20px;">
                            <a href="http://localhost:4200/seguimiento/${pedido.pedidoId}" style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Seguir pedido</a>
                        </p>
                        <p style="font-size: 14px; color: #aaaaaa; text-align: center;">Arriba el Campo - Promoviendo la agricultura local</p>
                    </div>
                </div>
            `
        };

        // Agrupar productos por vendedor para evitar correos duplicados
        const productosPorVendedor = productosConVendedor.reduce((acc, producto) => {
            const vendedorId = producto.usuarioId._id.toString();
            if (!acc[vendedorId]) {
                acc[vendedorId] = {
                    email: producto.usuarioId.correo,
                    productos: []
                };
            }
            acc[vendedorId].productos.push(producto);
            return acc;
        }, {});

        // Enviar correos a los vendedores
        const vendorMailPromises = Object.values(productosPorVendedor).map(vendedor => {
            if (!vendedor.email || vendedor.email.trim() === '') {
                console.warn(`Correo electrónico del vendedor no encontrado para el vendedor con ID ${vendedor._id}`);
                return null; // Saltar este vendedor si no tiene correo
            }

            const productoDetalles = vendedor.productos.map(prod => `<li>${prod.titulo} - ${productos.find(p => p._id.toString() === prod._id.toString()).cantidad} unidades</li>`).join('');
            const vendorMailOptions = {
                from: 'no.reply.arribaelcampo@gmail.com',
                to: vendedor.email,
                subject: `Nuevo pedido de tus productos - Arriba el Campo`,
                html: `
                    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #dddddd;">
                            <h2 style="color: #27ae60; text-align: center;">Nuevo pedido recibido</h2>
                            <p style="font-size: 16px; color: #555555;">Has recibido un nuevo pedido de los siguientes productos:</p>
                            <ul style="list-style-type: none; padding: 0;">
                                ${productoDetalles}
                            </ul>
                            <p style="font-size: 14px; color: #aaaaaa; text-align: center;">Arriba el Campo - Promoviendo la agricultura local</p>
                        </div>
                    </div>
                `
            };

            return sendMail(vendorMailOptions);
        });

        // Enviar correos (cliente, usuario logueado, vendedores)
        await sendMail(customerMailOptions);  // Enviar al cliente
        await sendMail(userMailOptions);      // Enviar al usuario logueado
        await Promise.all(vendorMailPromises.filter(p => p !== null)); // Filtrar correos nulos y enviarlos

        res.status(200).json({ message: 'Pago procesado, pedido creado y correos enviados' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al procesar el pago', error });
    }
};

