const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema para almacenar el pedido
const pedidoSchema = new Schema({
    pedidoId: { type: Number, unique: true },  // ID corto para el pedido
    compradorId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },  // El comprador que realizó el pedido
    productos: [
        {
            productoId: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },  // El producto que se compró
            vendedorId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },   // El vendedor del producto
            cantidad: { type: Number, required: true },  // Cantidad de unidades compradas
            precio: { type: Number, required: true },     // Precio del producto al momento de la compra
            estado: { type: String, enum: ['creado', 'enviado', 'en camino', 'entregado'], default: 'creado' },  // Estado por producto/vendedor
            fechaActualizacion: { type: Date, default: Date.now },  // Fecha de última actualización del estado del producto
        }
    ],
    total: { type: Number, required: true },  // Total del pedido
    estadoGeneral: { type: String, enum: ['creado', 'procesado', 'enviado a la empresa transportadora', 'en camino', 'entregado'], default: 'creado' },  // Estado general del pedido
    fechaCreacion: { type: Date, default: Date.now },  // Fecha de creación del pedido
    fechaActualizacion: { type: Date, default: Date.now },  // Fecha de la última actualización del pedido
    fechaEntregaEstimada: { type: Date },  // Fecha estimada de entrega

    // Nuevos campos para información del envío
    direccionEnvio: { type: String, required: true },  // Dirección de envío
    personaRecibe: { type: String, required: true },  // Nombre de la persona que recibe
    numeroCelular: { type: String, required: true },  // Número de celular
    ciudad: { type: String, required: true }  // Ciudad de destino
});

// Pre-save hook para generar un pedidoId corto
pedidoSchema.pre('save', async function (next) {
    if (!this.pedidoId) {
        // Generar un ID corto único para cada pedido
        const lastPedido = await mongoose.model('Pedido').findOne().sort({ pedidoId: -1 });
        this.pedidoId = lastPedido ? lastPedido.pedidoId + 1 : 254410;
    }

    if (!this.fechaEntregaEstimada) {
        const fechaCreacion = this.fechaCreacion || new Date();
        let diasHabiles = 5;
        let fecha = new Date(fechaCreacion);

        while (diasHabiles > 0) {
            fecha.setDate(fecha.getDate() + 1);
            const diaSemana = fecha.getDay();
            if (diaSemana !== 0 && diaSemana !== 6) {  // Saltar sábados y domingos
                diasHabiles--;
            }
        }

        this.fechaEntregaEstimada = fecha;
    }
    next();
});

module.exports = mongoose.model('Pedido', pedidoSchema);
