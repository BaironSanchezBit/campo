const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    tipo: { type: String, required: true },
    precio: { type: Number, required: true },
    cantidadDisponible: { type: Number, required: true, min: 1 },
    ciudad: { type: String, required: true },
    fotos: [{ type: String }],
    estado: { type: String, enum: ['disponible', 'agotado', 'proximamente'], default: 'disponible' },
    fechaPublicacion: { type: Date, default: Date.now },
    usuarioId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
});

module.exports = mongoose.model('Producto', productSchema);
