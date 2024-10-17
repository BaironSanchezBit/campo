const Pedido = require('./pedido.model');  // Asegúrate de que esta ruta sea correcta
const Producto = require('./producto.model');  // Asegúrate de que esta ruta sea correcta
const Usuario = require('./auth.model');  // Asegúrate de que esta ruta sea correcta

exports.procesarPago = async (req, res) => {
    const { email, productos, total, usuarioId } = req.body;

    try {
        // Buscar al usuario logueado usando Auth.model (por usuarioId)
        const usuarioLogueado = await Usuario.findById(usuarioId);
        if (!usuarioLogueado || !usuarioLogueado.correo) {
            throw new Error('Usuario logueado no encontrado o sin correo electrónico');
        }

        // Obtener los productos con información completa del vendedor
        const productosConVendedor = await Producto.find({ _id: { $in: productos.map(p => p._id) } }).populate('usuarioId');

        // Crear el pedido en la base de datos
        const pedido = new Pedido({
            compradorId: usuarioLogueado._id,
            productos: productosConVendedor.map(prod => ({
                productoId: prod._id,
                vendedorId: prod.usuarioId._id,  // Relación con el vendedor
                cantidad: productos.find(p => p._id === prod._id).cantidad,  // Tomar la cantidad del producto comprado
                precio: prod.precio
            })),
            total: total
        });

        await pedido.save();  // Guardar el pedido en la base de datos

        // Enviar correos y otras operaciones...

        res.status(200).json({ message: 'Pago procesado, pedido creado y correos enviados' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al procesar el pago y crear el pedido', error });
    }
};

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
