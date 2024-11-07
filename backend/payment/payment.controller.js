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
            console.error('No se definieron destinatarios para el correo.');
            return reject(new Error('No recipients defined'));
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
                return reject(error);
            }
            console.log('Correo enviado con éxito:', info.response);
            resolve(info);
        });
    });
}

exports.procesarPago = async (req, res) => {
    console.log('Datos recibidos en el cuerpo de la solicitud:', req.body);
    const { email, productos, total, usuarioId, direccionEnvio, personaRecibe, numeroCelular, ciudad, paymentMethod } = req.body;

    if (!email || typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({ message: 'El correo electrónico del cliente no está definido o es inválido.' });
    }

    try {
        // Validación de productos
        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            console.error('Error: Productos no válidos o vacíos');
            return res.status(400).json({ message: 'Productos no válidos o vacíos' });
        }
        console.log('Productos validados correctamente.');

        // Verificación de usuario
        const usuarioLogueado = await Usuario.findById(usuarioId);
        if (!usuarioLogueado || !usuarioLogueado.correo) {
            throw new Error('Usuario logueado no encontrado o sin correo electrónico');
        }
        console.log('Usuario logueado encontrado:', usuarioLogueado);

        // Obtener detalles de los productos
        const productosConVendedor = await Producto.find({ _id: { $in: productos.map(p => p._id) } }).populate('usuarioId');
        if (!productosConVendedor || productosConVendedor.length === 0) {
            console.error('Error: No se encontraron productos con los IDs proporcionados');
            return res.status(404).json({ message: 'No se encontraron productos con los IDs proporcionados' });
        }
        console.log('Productos obtenidos correctamente:', productosConVendedor);

        // Crear el pedido
        const pedido = new Pedido({
            compradorId: usuarioLogueado._id,
            productos: productosConVendedor.map(prod => ({
                productoId: prod._id,
                cantidad: productos.find(p => p._id === prod._id.toString()).cantidad,
                precio: prod.precio,
                vendedorId: prod.usuarioId._id
            })),
            total: total,
            direccionEnvio: direccionEnvio,
            personaRecibe: personaRecibe,
            numeroCelular: numeroCelular,
            ciudad: ciudad,
            paymentMethod: paymentMethod
        });

        console.log('Creando el pedido en la base de datos...');
        await pedido.save();
        console.log('Pedido creado con éxito:', pedido);

        // Mensaje de pago según el método
        let paymentMessage = '';
        switch (paymentMethod) {
            case 'cashOnDelivery':
                paymentMessage = 'Has seleccionado el pago contra entrega. Por favor, prepárate para realizar el pago al momento de la entrega.';
                break;
            case 'paypal':
                paymentMessage = 'Has seleccionado el pago con PayPal. Serás redirigido a la plataforma de PayPal para completar el pago.';
                break;
            case 'creditCard':
                paymentMessage = 'Has seleccionado el pago con tarjeta de crédito/débito.';
                break;
            case 'bankTransfer':
                paymentMessage = 'Has seleccionado el pago mediante transferencia bancaria. Te enviaremos los detalles para completar la transferencia.';
                break;
            default:
                paymentMessage = 'Método de pago seleccionado no reconocido.';
        }
        console.log('Mensaje de pago generado:', paymentMessage);

        // Correo de confirmación para el cliente
        const customerMailOptions = {
            from: 'no.reply.arribaelcampo@gmail.com',
            to: email,
            subject: 'Comprobante de pago - Arriba el Campo',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #dddddd;">
                        <h2 style="color: #27ae60; text-align: center;">¡Gracias por tu compra!</h2>
                        <p style="font-size: 16px; color: #555555;">Estimado cliente,</p>
                        <p style="font-size: 16px; color: #555555;">Tu pedido ha sido recibido exitosamente. ${paymentMessage}</p>
                        <p style="font-size: 16px; color: #555555;">A continuación, te compartimos los detalles de tu compra:</p>
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

        console.log('Enviando correo al cliente...');
        await sendMail(customerMailOptions);
        console.log('Correo enviado al cliente con éxito.');

        // Correo de notificación de creación de pedido para el usuario logueado
        const userMailOptions = {
            from: 'no.reply.arribaelcampo@gmail.com',
            to: usuarioLogueado.correo,
            subject: 'Tu pedido ha sido creado - Arriba el Campo',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #dddddd;">
                        <h2 style="color: #27ae60; text-align: center;">Tu pedido ha sido creado</h2>
                        <p style="font-size: 16px; color: #555555;">Estimado/a ${usuarioLogueado.nombres},</p>
                        <p style="font-size: 16px; color: #555555;">Nos complace informarte que tu pedido ha sido creado. Puedes seguir el estado de tu pedido en el siguiente enlace:</p>
                        <p style="text-align: center; margin-top: 20px;">
                            <a href="https://arribaelcampo.store/seguimiento/${pedido.pedidoId}" style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Seguir pedido</a>
                        </p>
                        <p style="font-size: 14px; color: #aaaaaa; text-align: center;">Arriba el Campo - Promoviendo la agricultura local</p>
                    </div>
                </div>
            `
        };

        console.log('Enviando correo al usuario logueado...');
        await sendMail(userMailOptions);
        console.log('Correo enviado al usuario logueado con éxito.');

        // Agrupar productos por vendedor
        const productosPorVendedor = productosConVendedor.reduce((acc, producto) => {
            const vendedorId = producto.usuarioId._id.toString();

            // Si no hay un correo definido o está vacío, salta este vendedor
            if (!producto.usuarioId.correo || producto.usuarioId.correo.trim() === '') {
                console.warn(`Correo electrónico no encontrado para el vendedor con ID ${vendedorId}`);
                return acc;
            }

            // Si el vendedor aún no está en el objeto, inicializa su entrada
            if (!acc[vendedorId]) {
                acc[vendedorId] = {
                    email: producto.usuarioId.correo,
                    productos: []
                };
            }

            // Agregar el producto a la lista del vendedor
            acc[vendedorId].productos.push(producto);
            return acc;
        }, {});

        // Enviar correos a los vendedores
        const vendorMailPromises = Object.entries(productosPorVendedor).map(([vendedorId, vendedor]) => {
            console.log(`Preparando correo para el vendedor con ID: ${vendedorId} y correo: ${vendedor.email}`);

            // Verificar si hay productos para el vendedor
            if (!vendedor.productos || vendedor.productos.length === 0) {
                console.warn(`El vendedor con ID ${vendedorId} no tiene productos asignados.`);
                return null; // Saltar si no hay productos
            }

            // Crear el detalle de los productos
            const productoDetalles = vendedor.productos.map(prod => {
                const cantidad = productos.find(p => p._id.toString() === prod._id.toString()).cantidad;
                return `<li>${prod.titulo} - ${cantidad} unidades</li>`;
            }).join('');

            // Configurar opciones del correo
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

        // Esperar el envío de correos
        console.log('Enviando correos a los vendedores...');
        await Promise.all(vendorMailPromises.filter(p => p !== null));
        console.log('Correos enviados a los vendedores con éxito.');

        res.status(200).json({ message: 'Pago procesado, pedido creado y correos enviados' });

    } catch (error) {
        console.error('Error durante el procesamiento del pago:', error);
        res.status(500).json({ message: 'Error al procesar el pago', error });
    }
};
