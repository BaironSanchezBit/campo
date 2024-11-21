const nodemailer = require('nodemailer');
const Producto = require('../producto/producto.model');
const Usuario = require('../auth/auth.model');
const Pedido = require('../pedido/pedido.model');
const PDFDocument = require('pdfkit'); // Importar pdfkit
const fs = require('fs'); // Para manejar la escritura de archivos

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
            resolve(info);
        });
    });
}

exports.procesarPago = async (req, res) => {
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

        // Verificación de usuario
        const usuarioLogueado = await Usuario.findById(usuarioId);
        if (!usuarioLogueado || !usuarioLogueado.correo) {
            throw new Error('Usuario logueado no encontrado o sin correo electrónico');
        }

        // Obtener detalles de los productos
        const productosConVendedor = await Producto.find({ _id: { $in: productos.map(p => p._id) } }).populate('usuarioId');
        if (!productosConVendedor || productosConVendedor.length === 0) {
            console.error('Error: No se encontraron productos con los IDs proporcionados');
            return res.status(404).json({ message: 'No se encontraron productos con los IDs proporcionados' });
        }

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

        await pedido.save();

        // Mensaje de pago según el método
        let paymentMessage = '';
        switch (paymentMethod) {
            case 'cashOnDelivery':
                paymentMessage = 'Pago contra entrega';
                break;
            case 'paypal':
                paymentMessage = 'PayPal';
                break;
            case 'creditCard':
                paymentMessage = 'Tarjeta de crédito/débito.';
                break;
            case 'bankTransfer':
                paymentMessage = 'Transferencia bancaria';
                break;
            default:
                paymentMessage = 'Método de pago seleccionado no reconocido.';
        }

        // Generar el PDF del comprobante
        const pdfPath = `/tmp/comprobante_pedido_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
        const doc = new PDFDocument({ margin: 40 }); // Definir márgenes del documento

        // Conectar el documento PDF al sistema de archivos para su almacenamiento temporal
        doc.pipe(fs.createWriteStream(pdfPath));

        // Agregar logotipo de Arriba el Campo (ajusta la ruta si es necesario)
        const logoPath = '../assets/img/logo.png'; // Ruta local al logotipo
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, { fit: [100, 100], align: 'center' });
        } else {
            console.warn('El logotipo no fue encontrado en la ruta especificada. Verifica que exista.');
        }

        // Título del comprobante
        doc
            .fontSize(18)
            .fillColor('#27ae60') // Verde para el título
            .text('Comprobante de Pago - Arriba el Campo', { align: 'center' })
            .moveDown(1);

        // Información del pedido y cliente
        doc
            .fontSize(12)
            .fillColor('black')
            .text(`Pedido ID: ${pedido._id}`, { continued: true })
            .text(`  Cliente: ${usuarioLogueado.nombres} ${usuarioLogueado.apellidos}`, { align: 'right' })
            .moveDown(0.5)
            .text(`Correo: ${email}`)
            .text(`Total: $${total}`, { underline: true })
            .text(`Método de Pago: ${paymentMessage}`)
            .moveDown(1);

        // Información de envío
        doc
            .fontSize(12)
            .fillColor('#27ae60')
            .text('Información de Envío:', { underline: true })
            .moveDown(0.5)
            .fontSize(10)
            .fillColor('black')
            .text(`Dirección: ${direccionEnvio}`)
            .text(`Persona que recibe: ${personaRecibe}`)
            .text(`Celular: ${numeroCelular}`)
            .text(`Ciudad: ${ciudad}`)
            .moveDown(1);

        // Lista de productos
        doc
            .fontSize(12)
            .fillColor('#27ae60')
            .text('Productos:', { underline: true })
            .moveDown(0.5);

        // Iterar sobre los productos
        productosConVendedor.forEach(prod => {
            const cantidad = productos.find(p => p._id.toString() === prod._id.toString()).cantidad;
            doc
                .fontSize(10)
                .fillColor('black')
                .text(`- ${prod.titulo}: ${cantidad} unidades - $${prod.precio}`);
        });

        // Pie de página
        doc
            .moveDown(2)
            .fontSize(10)
            .fillColor('#aaaaaa')
            .text('Arriba el Campo - Promoviendo la agricultura local', { align: 'center' });

        // Finalizar el documento
        doc.end();


        // Correo de confirmación para el cliente
        const customerMailOptions = {
            from: 'no.reply.arribaelcampo@gmail.com',
            to: email,
            subject: 'Comprobante de pago - Arriba el Campo',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #dddddd;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <img src="https://arribaelcampo.store/assets/img/logo.ico" alt="Arriba el Campo" style="max-width: 100px;">
                        </div>
                        <h2 style="color: #27ae60; text-align: center;">¡Gracias por tu compra!</h2>
                        <p style="font-size: 16px; color: #555555;">Estimado cliente,</p>
                        <p style="font-size: 16px; color: #555555;">Tu pedido ha sido recibido exitosamente.</p>
                        <h3 style="color: #27ae60;">Total: $${total}</h3>
                        <h4 style="color: #555555;">Información de envío:</h4>
                        <p>Dirección: ${direccionEnvio}</p>
                        <p>Persona que recibe: ${personaRecibe}</p>
                        <p>Celular: ${numeroCelular}</p>
                        <p>Ciudad: ${ciudad}</p>
                        <p style="font-size: 16px; color: #555555;">Adjunto encontrarás tu comprobante de pago en formato PDF.</p>
                        <p style="font-size: 14px; color: #aaaaaa; text-align: center;">Arriba el Campo - Promoviendo la agricultura local</p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `comprobante_pedido_${pedido._id}.pdf`,
                    path: pdfPath,
                    contentType: 'application/pdf'
                }
            ]
        };

        await sendMail(customerMailOptions);

        // Correo de notificación de creación de pedido para el usuario logueado
        const userMailOptions = {
            from: 'no.reply.arribaelcampo@gmail.com',
            to: usuarioLogueado.correo,
            subject: 'Tu pedido ha sido creado - Arriba el Campo',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #dddddd;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <img src="https://arribaelcampo.store/assets/img/logo.ico" alt="Arriba el Campo" style="max-width: 100px;">
                        </div>
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

        await sendMail(userMailOptions);

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
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://arribaelcampo.store/assets/img/logo.ico" alt="Arriba el Campo" style="max-width: 100px;">
                    </div>
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
        await Promise.all(vendorMailPromises.filter(p => p !== null));

        res.status(200).json({ message: 'Pago procesado, pedido creado y correos enviados' });

    } catch (error) {
        console.error('Error durante el procesamiento del pago:', error);
        res.status(500).json({ message: 'Error al procesar el pago', error });
    } finally {
        if (fs.existsSync(pdfPath)) {
            fs.unlink(pdfPath, (err) => {
                if (err) {
                    console.error(`Error al eliminar el archivo PDF: ${pdfPath}`, err);
                } else {
                }
            });
        }
    }
};
