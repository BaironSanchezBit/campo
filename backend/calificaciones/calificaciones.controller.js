const Calificacion = require('./calificaciones.model');

exports.crearCalificacion = async (req, res) => {
    console.log(req.body);
    const { evaluadoId, evaluadorId, puntuacion, comentario } = req.body;

    try {
        const calificacion = new Calificacion({
            evaluadorId,
            evaluadoId,
            puntuacion,
            comentario
        });

        await calificacion.save();
        res.status(201).json({ msg: 'Calificación creada con éxito', calificacion });
    } catch (error) {
        console.error('Error al crear la calificación:', error);
        res.status(500).json({ msg: 'Error al crear la calificación', error });
    }
};
