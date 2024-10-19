const Pedido = require('./pedido.model');
const Usuario = require('../auth/auth.model');

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
        const pedidos = await Pedido.find({ transportadorId: transportadorId })
            .populate('productos.productoId')
            .exec();

        if (!pedidos.length) {
            return res.status(404).json({ message: 'No hay pedidos asignados para este transportador' });
        }

        res.status(200).json(pedidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los pedidos asignados al transportador', error });
    }
};