const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema para almacenar el pedido
const pedidoSchema = new Schema({
    pedidoId: { type: Number, unique: true },  // ID corto para el pedido
    compradorId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },  // El comprador que realizó el pedido
    productos: [
        {
            productoId: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
            vendedorId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
            cantidad: { type: Number, required: true },
            precio: { type: Number, required: true },
            estado: { type: String, enum: ['Creado', 'Camino a la empresa transportadora', 'Entregado a empresa transportadora'], default: 'Creado' },
            fechaActualizacion: { type: Date, default: Date.now },
            observaciones: { type: String } // Nuevo campo para observaciones
        }
    ],
    total: { type: Number, required: true },  // Total del pedido
    estadoGeneral: { type: String, enum: ['Creado', 'Productos camino a la empresa transportadora', 'Productos en la empresa transportadora', 'Comprobando productos', 'Camino a tu dirección', 'Entregado'], default: 'Creado' },  // Estado general del pedido
    fechaCreacion: { type: Date, default: Date.now },  // Fecha de creación del pedido
    fechaActualizacion: { type: Date, default: Date.now },  // Fecha de la última actualización del pedido
    fechaEntregaEstimada: { type: Date },  // Fecha estimada de entrega
    transportadorId: { type: String },
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
