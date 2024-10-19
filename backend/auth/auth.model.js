const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    contrasena: { type: String, required: true },
    fotoPerfil: { type: String },
    celular: { type: String, required: true },
    rol: { type: String, enum: ['comprador', 'vendedor', 'transportador'], default: 'comprador' } // Se añade el rol de transportador
  });
  

// Encriptar la contraseña antes de guardar
userSchema.pre('save', async function (next) {
    if (!this.isModified('contrasena')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
    next();
});

// Método para comparar contraseñas
userSchema.methods.compararContraseña = async function (contrasenaIngresada) {
    return await bcrypt.compare(contrasenaIngresada, this.contrasena);
};

module.exports = mongoose.model('Usuario', userSchema);