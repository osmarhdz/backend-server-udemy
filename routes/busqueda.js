var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//Rutas
// ========================================
// Busqueda por coleccion
// ========================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    // propiedades de objeto computadas
    Promise.all([
            buscarxColeccion(busqueda, regex, tabla)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                [tabla]: respuestas
            });
        })

})

// ========================================
// Busqueda general 
// ========================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuario(busqueda, regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        })


    // Imprelementar promesa
    // buscarHospitales(busqueda, regex)
    //     .then(hospitales => {
    //         res.status(200).json({
    //             ok: true,
    //             hospitales: hospitales
    //         });
    //     })


});

function buscarxColeccion(busqueda, regex, tabla) {

    switch (tabla) {
        case 'medicos':
            return buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            return buscarHospitales(busqueda, regex);
            break;
        case 'usuarios':
            return buscarUsuario(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no valido' }

            });
            break;
    }
}

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales');
                } else {
                    resolve(hospitales);
                }
            });

    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos');
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuario(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }]) // funcion de mongoose
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            })

    });
}

module.exports = app;