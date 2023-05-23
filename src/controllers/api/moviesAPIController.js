const path = require('path');
const db = require('../../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');
const fetch = require("node-fetch");
const key = "apikey=98d7a67e"
const url = "https://www.omdbapi.com/"

//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesAPIController = {
    'list': (req, res) => {
        db.Movie.findAll({
            include: ['genre']
        })
        .then(movies => {
            let respuesta = {
                meta: {
                    status : 200,
                    total: movies.length,
                    url: 'api/movies'
                },
                data: movies
            }
                res.json(respuesta);
            })
    },
    
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id,
            {
                include : ['genre']
            })
            .then(movie => {
                let respuesta = {
                    meta: {
                        status: 200,
                        total: movie.length,
                        url: '/api/movie/:id'
                    },
                    data: movie
                }
                res.json(respuesta);
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            include: ['genre'],
            where: {
                rating: {[db.Sequelize.Op.gte] : req.params.rating}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
        .then(movies => {
            let respuesta = {
                meta: {
                    status : 200,
                    total: movies.length,
                    url: 'api/movies/recomended/:rating'
                },
                data: movies
            }
                res.json(respuesta);
        })
        .catch(error => console.log(error))
    },
    create: function (req,res) {
        
        const newMovie = {
           ...req.body
        }

        Movies.create(newMovie)
        .then(() => {
            return res.status(200).json({
                data : newMovie,
                status: 200
            })
        })
        

            //return res.redirect('/movies')
        
    },
    update: (req,res) => {
        let movieId = req.params.id;

        const updateMovie = {
            ...req.body
         }
        Movies.update(
            updateMovie,
            {
                where: {id: movieId}
        })
        .then(() => {
            return res.status(200).json({
                data : updateMovie,
                status: 200
            })
        })    
        .catch(error => res.send(error))
    },
    destroy: function (req,res) {
        
        let movieId = req.params.id;
        Movies
        .destroy({where: {id: movieId}, force: true}) // force: true es para asegurar que se ejecute la acción
        .then((movie)=>{
            return res.status(200).json({
                data: movie,
                meta: {
                    status : 200
                }
            })})
        .catch(error => res.send(error)) 
    },
    search: async (req,res) => {
        let titulo = req.body.titulo;
        let movie = await fetch(`${url}/?t=${titulo}&${key}`).then(response => response.json());
       
        res.render("moviesDetailOmdb", {
            movie
        })
    }
    
}

module.exports = moviesAPIController;