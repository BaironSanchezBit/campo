const mongoose = require('mongoose');

const calificacionSchema = new mongoose.Schema({
    evaluadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }, // Usuario que califica
    evaluadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }, // Usuario calificado
    puntuacion: { type: Number, required: true, min: 1, max: 5 }, // Puntuación de 1 a 5
    comentario: { type: String }, // Comentario opcional
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Calificacion', calificacionSchema);