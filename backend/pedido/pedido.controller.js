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

// Actualizar el estado de un producto dentro de un pedido
exports.actualizarEstadoProducto = async (req, res) => {
    const { pedidoId, productoId, nuevoEstado } = req.body;

    try {
        // Busca el pedido por pedidoId personalizado
        const pedido = await Pedido.findOne({ pedidoId: pedidoId });
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        const producto = pedido.productos.find(p => p.productoId.toString() === productoId);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado en el pedido' });
        }

        // Actualiza el estado del producto
        producto.estado = nuevoEstado;
        producto.fechaActualizacion = new Date();
        pedido.fechaActualizacion = new Date();  // Actualizar la fecha del pedido

        // Verificar si todos los productos están en "enviado"
        const todosEnviados = pedido.productos.every(p => p.estado === 'enviado');
        if (todosEnviados) {
            pedido.estadoGeneral = 'enviado a la empresa transportadora';
            pedido.fechaActualizacion = new Date();
        }

        // Verificar si todos los productos están en "entregado"
        const todosEntregados = pedido.productos.every(p => p.estado === 'entregado');
        if (todosEntregados) {
            pedido.estadoGeneral = 'entregado';
            pedido.fechaActualizacion = new Date();
        }

        await pedido.save();
        res.status(200).json({ message: 'Estado actualizado con éxito', pedido });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el estado del producto', error });
    }
};
