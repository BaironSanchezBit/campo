const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    contrasena: { type: String, required: true },
    fotoPerfil: { type: String },
    celular: { type: String, required: true },
    rol: { type: String, enum: ['comprador', 'vendedor', 'admin', 'empresa', 'transportador'], default: 'comprador' },
    verificado: { type: Boolean, default: false } // Agregar el campo verificado
});

// Encriptar la contraseña antes de guardar
userSchema.pre('save', async function (next) {
    if (!this.isModified('contrasena')) {
        console.log('Contraseña no modificada, se omite la encriptación');
        return next();
    }
    console.log('Encriptando contraseña...');
    const salt = await bcrypt.genSalt(10);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
    console.log('Contraseña encriptada:', this.contrasena);
    next();
});

// Método para comparar contraseñas
userSchema.methods.compararContraseña = async function (contrasenaIngresada) {
    console.log('Comparando contraseñas...');
    console.log('Contraseña ingresada:', contrasenaIngresada);
    console.log('Contraseña almacenada (hash):', this.contrasena);
    return await bcrypt.compare(contrasenaIngresada, this.contrasena);
};

module.exports = mongoose.model('Usuario', userSchema);