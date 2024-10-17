const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pedidoSchema = new Schema({
    compradorId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },  // El comprador que realizó el pedido
    productos: [
        {
            productoId: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },  // El producto que se compró
            vendedorId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },   // El vendedor del producto
            cantidad: { type: Number, required: true },  // Cantidad de unidades compradas
            precio: { type: Number, required: true }     // Precio del producto al momento de la compra
        }
    ],
    total: { type: Number, required: true },  // Total del pedido
    estado: { type: String, enum: ['pendiente', 'procesado', 'enviado', 'entregado'], default: 'pendiente' },  // Estado del pedido
    fechaCreacion: { type: Date, default: Date.now },  // Fecha de creación del pedido
    fechaActualizacion: { type: Date, default: Date.now }  // Fecha de la última actualización del pedido
});

module.exports = mongoose.model('Pedido', pedidoSchema);
