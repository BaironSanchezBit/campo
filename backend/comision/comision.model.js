const mongoose = require('mongoose');

const ComisionSchema = new mongoose.Schema({
    valor: {
        type: Number,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comision', ComisionSchema);