var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();

var Hospital = require('../models/hospital');

// =========================
// Obtener todos lo hospitales
// =========================

//Rutas
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email', )
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospital',
                        errors: err
                    })
                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    })
                })
            });


});



// =========================
// Actualizar un nuevo hospital
// =========================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            })
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar hospital con el id' + id + ' no existe',
                errors: { message: 'No existe hopital con ese ID' }
            })
        }

        hospital.nombre = body.nombre;
        hospital.usuario = request.usuario_id;

        hospital.save(((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                })
            }


            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            })
        }))

    })

});

// =========================
// Crear un nuevo hospital
// =========================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    console.log('Test');
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            })
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        })

    });


});

// =========================
// Borrar un usuario por id
// =========================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrar usuario',
                errors: err
            })
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            })
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        })
    });
})

module.exports = app;