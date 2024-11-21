const Pedido = require('./pedido.model');
const nodemailer = require('nodemailer');
const Usuario = require('../auth/auth.model');
const Comision = require('../comision/comision.model');
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


// Función para enviar correos utilizando Promesas
async function sendMail(mailOptions) {
    try {
        if (!mailOptions.to || mailOptions.to.trim() === '') {
            throw new Error('No recipients defined');
        }
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw error;
    }
}

const enviarCorreosCambioEstado = async (pedido, nuevoEstado) => {
    try {
        const comprador = await Usuario.findById(pedido.compradorId);
        if (!comprador || !comprador.correo) {
            throw new Error('Correo del comprador no encontrado');
        }

        const transportador = await Usuario.findById(pedido.transportadorId);
        if (!transportador || !transportador.correo) {
            throw new Error('Correo del transportador no encontrado');
        }

        // Agrupar productos por vendedor
        const productosPorVendedor = pedido.productos.reduce((acc, producto) => {
            const vendedorId = producto.vendedorId._id.toString();
            if (!acc[vendedorId]) {
                acc[vendedorId] = {
                    email: producto.vendedorId.correo,
                    nombre: producto.vendedorId.nombres,
                    productos: []
                };
            }
            acc[vendedorId].productos.push(producto);
            return acc;
        }, {});

        // Enlaces de calificación
        const calificarTransportadorButton = `
            <a href="https://arribaelcampo.store/calificar/${transportador._id}" 
                style="display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                Calificar Transportador
            </a>`;

        const calificarCompradorButton = `
            <a href="https://arribaelcampo.store/calificar/${comprador._id}" 
                style="display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                Calificar Comprador
            </a>`;

        // Correos si el estado es "Entregado"
        if (nuevoEstado === 'Entregado') {
            // Correo al comprador
            const customerMailOptions = {
                from: 'no.reply.arribaelcampo@gmail.com',
                to: comprador.correo,
                subject: `Tu pedido ha sido entregado - Arriba el Campo`,
                html: `
                    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e0e0e0;">
                            <h2 style="color: #27ae60; text-align: center;">Tu pedido ha sido entregado</h2>
                            <p>Hola <strong>${comprador.nombres}</strong>,</p>
                            <p>Tu pedido con ID <strong>${pedido.pedidoId}</strong> ha sido entregado exitosamente.</p>
                            <p>Por favor, califica al transportador:</p>
                            <div style="text-align: center; margin-top: 20px;">
                                ${calificarTransportadorButton}
                            </div>
                            <p style="font-size: 14px; color: #aaa; text-align: center;">Arriba el Campo - Promoviendo la agricultura local</p>
                        </div>
                    </div>`
            };

            // Correo al transportador
            const transporterMailOptions = {
                from: 'no.reply.arribaelcampo@gmail.com',
                to: transportador.correo,
                subject: `Has completado un pedido - Arriba el Campo`,
                html: `
                    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e0e0e0;">
                            <h2 style="color: #27ae60; text-align: center;">Has completado un pedido</h2>
                            <p>Hola <strong>${transportador.nombres}</strong>,</p>
                            <p>El pedido con ID <strong>${pedido.pedidoId}</strong> ha sido entregado exitosamente.</p>
                            <p>Por favor, califica al comprador:</p>
                            <div style="text-align: center; margin-top: 20px;">
                                ${calificarCompradorButton}
                            </div>
                            <p style="font-size: 14px; color: #aaa; text-align: center;">Arriba el Campo - Promoviendo la agricultura local</p>
                        </div>
                    </div>`
            };

            // Correos a los vendedores
            const vendorMailPromises = Object.entries(productosPorVendedor).map(([vendedorId, vendedor]) => {
                const productosDetalles = vendedor.productos
                    .map(prod => `<li>${prod.productoId.titulo} - ${prod.cantidad} unidades</li>`)
                    .join('');
                const calificarCompradorButtonForVendor = `
                    <a href="https://arribaelcampo.store/calificar/${comprador._id}" 
                        style="display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                        Calificar Comprador
                    </a>`;
                const calificarVendedorButtonForCustomer = `
                    <a href="https://arribaelcampo.store/calificar/${vendedorId}" 
                        style="display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                        Calificar Vendedor
                    </a>`;

                // Correo al vendedor
                const vendorMailOptions = {
                    from: 'no.reply.arribaelcampo@gmail.com',
                    to: vendedor.email,
                    subject: `Pedido entregado - Arriba el Campo`,
                    html: `
                        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e0e0e0;">
                                <h2 style="color: #27ae60; text-align: center;">Pedido entregado</h2>
                                <p>Hola <strong>${vendedor.nombre}</strong>,</p>
                                <p>El pedido con ID <strong>${pedido.pedidoId}</strong> ha sido entregado exitosamente.</p>
                                <p>Productos vendidos:</p>
                                <ul>${productosDetalles}</ul>
                                <p>Por favor, califica al comprador:</p>
                                <div style="text-align: center; margin-top: 20px;">
                                    ${calificarCompradorButtonForVendor}
                                </div>
                                <p style="font-size: 14px; color: #aaa; text-align: center;">Arriba el Campo - Promoviendo la agricultura local</p>
                            </div>
                        </div>`
                };

                // Correo al comprador para calificar al vendedor
                const customerToVendorMailOptions = {
                    from: 'no.reply.arribaelcampo@gmail.com',
                    to: comprador.correo,
                    subject: `Por favor, califica a tu vendedor - Arriba el Campo`,
                    html: `
                        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e0e0e0;">
                                <h2 style="color: #27ae60; text-align: center;">¡Califica a tu vendedor!</h2>
                                <p>Hola <strong>${comprador.nombres}</strong>,</p>
                                <p>El vendedor <strong>${vendedor.nombre}</strong> participó en tu pedido con ID <strong>${pedido.pedidoId}</strong>.</p>
                                <p>Por favor, califícalo haciendo clic en el siguiente botón:</p>
                                <div style="text-align: center; margin-top: 20px;">
                                    ${calificarVendedorButtonForCustomer}
                                </div>
                                <p style="font-size: 14px; color: #aaa; text-align: center;">Arriba el Campo - Promoviendo la agricultura local</p>
                            </div>
                        </div>`
                };

                // Enviar ambos correos
                return Promise.all([
                    sendMail(vendorMailOptions), // Al vendedor
                    sendMail(customerToVendorMailOptions) // Al comprador
                ]);
            });

            // Enviar todos los correos
            await sendMail(customerMailOptions); // Al comprador
            await sendMail(transporterMailOptions); // Al transportador
            await Promise.all(vendorMailPromises.flat()); // Correos a los vendedores y al comprador hacia los vendedores
        }

        // Correo al comprador si el estado es "Camino a tu dirección"
        if (nuevoEstado === 'Camino a tu dirección') {
            const caminoMailOptions = {
                from: 'no.reply.arribaelcampo@gmail.com',
                to: comprador.correo,
                subject: `Tu pedido está en camino - Arriba el Campo`,
                html: `
                    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e0e0e0;">
                            <h2 style="color: #27ae60; text-align: center;">Tu pedido está en camino</h2>
                            <p>Hola <strong>${comprador.nombres}</strong>,</p>
                            <p>Tu pedido con ID <strong>${pedido.pedidoId}</strong> está en camino a tu dirección:</p>
                            <p><strong>${pedido.direccionEnvio}</strong>, ${pedido.ciudad}</p>
                            <p>Persona que recibirá:</p>
                            <p><strong>${pedido.personaRecibe}</strong> - Tel: ${pedido.numeroCelular}</p>
                            <p style="font-size: 14px; color: #aaa; text-align: center;">Arriba el Campo - Promoviendo la agricultura local</p>
                        </div>
                    </div>`
            };

            await sendMail(caminoMailOptions);
        }
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
            'Camino a tu dirección',
            'Creado'
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
        const pedido = await Pedido.findOne({ pedidoId })
            .populate('productos.productoId')
            .populate('productos.vendedorId')
            .populate('compradorId');

        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        // Actualizar el estado general del pedido
        pedido.estadoGeneral = nuevoEstado;
        pedido.fechaActualizacion = new Date();

        // Guardar el pedido actualizado
        await pedido.save();

        // Llamar a `enviarCorreosCambioEstado` con base en el estado
        if (nuevoEstado === 'Camino a tu dirección') {
            await enviarCorreosCambioEstado(pedido, nuevoEstado, false); // Sin calificación
        } else if (nuevoEstado === 'Entregado') {
            await enviarCorreosCambioEstado(pedido, nuevoEstado, true); // Con calificación
        }

        res.status(200).json({ message: 'Estado del pedido actualizado con éxito', pedido });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el estado del pedido', error });
    }
};

exports.obtenerTransportadores = async (req, res) => {
    try {
        const transportadores = await Usuario.find({ rol: 'transportador' });
        if (!transportadores.length) {
            return res.status(404).json({ message: 'No hay transportadores disponibles' });
        }
        res.status(200).json(transportadores);
    } catch (error) {
        console.error('Error al obtener transportadores:', error);
        res.status(500).json({ message: 'Error al obtener transportadores', error });
    }
};

exports.actualizarEstadoGeneralPedido = async (req, res) => {
    const { pedidoId, nuevoEstado } = req.body;

    try {
        // Buscar el pedido por su ID
        const pedido = await Pedido.findOne({ pedidoId })
            .populate('productos.productoId')
            .populate('productos.vendedorId')
            .populate('compradorId');

        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        // Actualizar el estado general del pedido
        pedido.estadoGeneral = nuevoEstado;
        pedido.fechaActualizacion = new Date();

        // Si el nuevo estado es "Entregado", calcular el 3% y guardarlo
        if (nuevoEstado === 'Entregado') {
            const totalPedido = pedido.productos.reduce((total, producto) => total + producto.cantidad * producto.productoId.precio, 0);
            const comision = totalPedido * 0.03; // Calcular el 3%

            // Crear y guardar la comisión
            const nuevaComision = new Comision({ valor: comision });
            await nuevaComision.save();
        }

        // Guardar el pedido actualizado
        await pedido.save();

        // Llamar a `enviarCorreosCambioEstado` con base en el estado
        if (nuevoEstado === 'Entregado') {
            await enviarCorreosCambioEstado(pedido, nuevoEstado);
        }

        res.status(200).json({ message: 'Estado del pedido actualizado con éxito', pedido });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el estado del pedido', error });
    }
};

exports.obtenerComisiones = async (req, res) => {
    try {
        const comisiones = await Comision.find().sort({ fecha: -1 }); // Ordenar por fecha descendente
        res.status(200).json(comisiones);
    } catch (error) {
        console.error('Error al obtener las comisiones:', error);
        res.status(500).json({ message: 'Error al obtener las comisiones', error });
    }
};
