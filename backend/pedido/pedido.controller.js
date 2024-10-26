const Pedido = require('./pedido.model');
const nodemailer = require('nodemailer');
const Usuario = require('../auth/auth.model');

// Configuración del transporte de correo
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

const enviarCorreosCambioEstado = async (pedido, nuevoEstado) => {
    try {
        // Obtener el correo del comprador
        const comprador = await Usuario.findById(pedido.compradorId);
        if (!comprador || !comprador.correo) {
            throw new Error('Correo del comprador no encontrado');
        }

        // Crear correo para el comprador
        const customerMailOptions = {
            from: 'no.reply.arribaelcampo@gmail.com',
            to: comprador.correo,
            subject: `Tu pedido está ${nuevoEstado} - Arriba el Campo`,
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #dddddd;">
                        <h2 style="color: #27ae60; text-align: center;">Tu pedido está ${nuevoEstado}</h2>
                        <p style="font-size: 16px; color: #555555;">Estimado/a ${comprador.nombres},</p>
                        <p style="font-size: 16px; color: #555555;">Nos complace informarte que tu pedido con ID <strong>${pedido.pedidoId}</strong> está ahora ${nuevoEstado}.</p>
                        <p style="text-align: center; margin-top: 20px;">
                            <a href="http://localhost:4200/seguimiento/${pedido.pedidoId}" style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Seguir pedido</a>
                        </p>
                        <p style="font-size: 14px; color: #aaaaaa; text-align: center;">Arriba el Campo - Promoviendo la agricultura local</p>
                    </div>
                </div>
            `
        };

        // Agrupar productos por vendedor para evitar correos duplicados
        const productosPorVendedor = pedido.productos.reduce((acc, producto) => {
            const vendedorId = producto.vendedorId._id.toString();
            if (!acc[vendedorId]) {
                acc[vendedorId] = {
                    email: producto.vendedorId.correo,
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

            const productoDetalles = vendedor.productos.map(prod => `<li>${prod.productoId.titulo} - ${prod.cantidad} unidades</li>`).join('');
            const vendorMailOptions = {
                from: 'no.reply.arribaelcampo@gmail.com',
                to: vendedor.email,
                subject: `Actualización de estado de pedido - Arriba el Campo`,
                html: `
                    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #dddddd;">
                            <h2 style="color: #27ae60; text-align: center;">Actualización de estado de pedido</h2>
                            <p style="font-size: 16px; color: #555555;">Estimado/a vendedor/a,</p>
                            <p style="font-size: 16px; color: #555555;">El pedido con ID <strong>${pedido.pedidoId}</strong> ha cambiado su estado a <strong>${nuevoEstado}</strong>. A continuación, los productos que forman parte de este pedido:</p>
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

        // Enviar correos (cliente y vendedores)
        await sendMail(customerMailOptions);  // Enviar al cliente
        await Promise.all(vendorMailPromises.filter(p => p !== null)); // Filtrar correos nulos y enviarlos

        console.log(`Correos enviados correctamente para el estado ${nuevoEstado}`);
    } catch (error) {
        console.error(`Error al enviar los correos para el estado ${nuevoEstado}:`, error);
    }
};

// Obtener pedido por pedidoId personalizado
exports.obtenerPedidoPorId = async (req, res) => {
    const { pedidoId } = req.params;

    try {
        // Busca por el campo personalizado pedidoId
        const pedido = await Pedido.findOne({ pedidoId: pedidoId })
            .populate('productos.productoId')
            .populate('productos.vendedorId')
            .exec();

        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.json(pedido);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el pedido', error });
    }
};

// Obtener todos los pedidos de un comprador
exports.obtenerPedidosComprador = async (req, res) => {
    const { usuarioId } = req.params;

    try {
        const pedidos = await Pedido.find({ compradorId: usuarioId })
            .populate('productos.productoId')
            .populate('productos.vendedorId')
            .exec();
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los pedidos del comprador', error });
    }
};

// Obtener pedidos para un vendedor específico
exports.obtenerPedidosVendedor = async (req, res) => {
    const { vendedorId } = req.params;

    try {
        // Buscar pedidos que contengan productos del vendedor
        const pedidos = await Pedido.find({ 'productos.vendedorId': vendedorId })
            .populate('productos.productoId')
            .exec();

        // Filtrar productos que pertenezcan al vendedor
        const pedidosDelVendedor = pedidos.map(pedido => {
            const productosDelVendedor = pedido.productos.filter(
                producto => producto.vendedorId.toString() === vendedorId
            );
            return { ...pedido.toObject(), productos: productosDelVendedor };
        });

        res.json(pedidosDelVendedor);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los pedidos del vendedor', error });
    }
};

// Actualizar el estado de un producto dentro de un pedido por un vendedor
exports.actualizarEstadoProductoPorVendedor = async (req, res) => {
    const { pedidoId, productoId, nuevoEstado } = req.body;

    try {
        // Busca el pedido por pedidoId personalizado
        const pedido = await Pedido.findOne({ pedidoId: pedidoId }).populate('productos.productoId');
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        // Imprimir los IDs de los productos en el pedido para verificar
        console.log('Producto ID recibido:', productoId);
        console.log('Productos en el pedido:', pedido.productos.map(p => p.productoId._id.toString()));

        // Busca el producto dentro de los productos del pedido utilizando el campo _id
        const producto = pedido.productos.find(p => p.productoId._id.toString() === productoId);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado en el pedido' });
        }

        // Actualiza el estado del producto
        producto.estado = nuevoEstado;
        producto.fechaActualizacion = new Date();
        pedido.fechaActualizacion = new Date(); // Actualizar la fecha del pedido

        // Verificar si al menos un producto está "Camino a la empresa transportadora"
        const hayCaminoEmpresa = pedido.productos.some(p => p.estado === 'Camino a la empresa transportadora');
        if (hayCaminoEmpresa) {
            pedido.estadoGeneral = 'Productos camino a la empresa transportadora';
            pedido.fechaActualizacion = new Date();
        }

        await pedido.save();
        res.status(200).json({ message: 'Estado del producto actualizado con éxito', pedido });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el estado del producto', error });
    }
};

// Actualizar el estado de un producto por el transportador
exports.actualizarEstadoProductoPorTransportador = async (req, res) => {
    const { pedidoId, productoId, nuevoEstado, observaciones } = req.body;

    try {
        const pedido = await Pedido.findOne({ pedidoId: pedidoId }).populate('productos.productoId');
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        // Verificar los IDs de los productos para ayudar en depuración
        console.log('Producto ID recibido:', productoId);
        console.log('Productos en el pedido:', pedido.productos.map(p => p.productoId._id.toString()));

        const producto = pedido.productos.find(p => p.productoId._id.toString() === productoId);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado en el pedido' });
        }

        // Actualizar el estado del producto
        producto.estado = nuevoEstado;
        producto.fechaActualizacion = new Date();
        if (observaciones) {
            producto.observaciones = observaciones;
        }

        // Verificar si todos los productos están entregados a la empresa transportadora
        const todosEntregados = pedido.productos.every(p => p.estado === 'Entregado a empresa transportadora');
        if (todosEntregados) {
            pedido.estadoGeneral = 'Productos en la empresa transportadora';
        }

        pedido.fechaActualizacion = new Date(); // Actualizar la fecha del pedido

        await pedido.save();
        res.status(200).json({ message: 'Estado del producto actualizado con éxito', pedido });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el estado del producto', error });
    }
};

// Obtener todos los pedidos con estado específico para la empresa transportadora
exports.obtenerPedidosEnviados = async (req, res) => {
    try {
        // Filtrar los pedidos que tengan estados específicos (excluyendo "Creado" y "Entregado")
        const estadosPermitidos = [
            'Productos camino a la empresa transportadora',
            'Productos en la empresa transportadora',
            'Comprobando productos',
            'Camino a tu dirección'
        ];

        const pedidos = await Pedido.find({ estadoGeneral: { $in: estadosPermitidos } })
            .populate('productos.productoId')
            .exec();

        if (!pedidos.length) {
            return res.status(404).json({ message: 'No hay pedidos disponibles para la empresa transportadora' });
        }

        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los pedidos para la empresa transportadora', error });
    }
};

// Asignar transportador a un pedido
exports.asignarTransportador = async (req, res) => {
    const { pedidoId, transportadorId } = req.body;

    try {
        const pedido = await Pedido.findOne({ pedidoId: pedidoId });
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        pedido.transportadorId = transportadorId;
        pedido.fechaActualizacion = new Date();
        await pedido.save();

        res.status(200).json({ message: 'Transportador asignado con éxito', pedido });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al asignar el transportador', error });
    }
};

exports.obtenerPedidosPorTransportador = async (req, res) => {
    const { transportadorId } = req.params;

    try {
        // Filtrar pedidos asignados al transportador que no estén en estado "Entregado"
        const pedidos = await Pedido.find({
            transportadorId: transportadorId,
            estadoGeneral: { $ne: 'Entregado' } // Excluir los pedidos con estado "Entregado"
        })
            .populate('productos.productoId')
            .exec();

        if (!pedidos.length) {
            return res.status(404).json({ message: 'No hay pedidos asignados y en proceso para este transportador' });
        }

        res.status(200).json(pedidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los pedidos asignados al transportador', error });
    }
};


exports.actualizarEstadoGeneralPedido = async (req, res) => {
    const { pedidoId, nuevoEstado } = req.body;

    try {
        // Buscar el pedido por su ID
        const pedido = await Pedido.findOne({ pedidoId }).populate('productos.productoId').populate('productos.vendedorId');
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        // Actualizar el estado general del pedido
        pedido.estadoGeneral = nuevoEstado;
        pedido.fechaActualizacion = new Date();

        // Guardar el pedido actualizado
        await pedido.save();

        // Enviar correos si el estado es "Camino a tu dirección" o "Entregado"
        if (['Camino a tu dirección', 'Entregado'].includes(nuevoEstado)) {
            await enviarCorreosCambioEstado(pedido, nuevoEstado);
        }

        res.status(200).json({ message: 'Estado del pedido actualizado con éxito', pedido });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el estado del pedido', error });
    }
};