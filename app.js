4// Carregando módulos
const express = require('express')
const {engine} = require('express-handlebars')
const bodyParser = require("body-parser" )
const app = express()
require("dotenv").config();
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require("express-session")
const flash = require("connect-flash")
const moment = require('moment');
require('moment/locale/pt-br')
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require('./routes/usuarios')
const passport = require("passport")
require("./config/auth")(passport)
// Configurações
  // Sessão
  app.use(session({
    secret: "admin",
    resave: true,
    saveUninitialized: true
  }))

  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())
  // Middleware
  app.use((req,res,next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null
    next()
  })
  // Body Parser 
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
  // Handlebars 
    app.engine('handlebars', engine({
      defaultLayout: 'main',
      helpers: {
        formatDate: function (date) {
          return moment(date).format('LLL');
        }
      }
    }));
    app.set('view engine', 'handlebars')
  // Mongoose
    mongoose.Promise = global.Promise
    mongoose.connect(process.env.MONGODB_CONNECT_URI).then(() => {
      console.log("Conectado ao mongo")
    }).catch((err) => {
      console.log("Erro ao se conectar: " + err)
    })
  // Public
    app.use((req, res, next) => {
      console.log('OI EU SOU UM MIDLEWARE')
      next()
    })
    app.use(express.static(path.join(__dirname,"public")))
// Rotas
  app.get('/', (req,res) => {
    Postagem.find().populate("categoria").sort({date: "desc"}).then((postagens) => {
      const mappost = postagens.map(postagens => postagens.toObject())
      res.render("index", {postagens: mappost})
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno")
      res.redirect("/404")
    })
  })
  app.get("/postagem/:slug", (req,res) => {
    Postagem.findOne({slug: req.params.slug}).then(postagem => {
      if(postagem) {
        const mappost = postagem.toObject()
        res.render("postagem/index", {postagem: mappost})
      }else {
          req.flash("error_msg", "Esta postagem não existe")
          res.redirect("/")
        }
      }).catch((err)=> {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
    })
  })

  app.get("/categorias", (req,res) => {
    Categoria.find().then((categorias) => {
      const mapcategorias = categorias.map(categorias => categorias.toObject())
      res.render("categorias/index", {categorias: mapcategorias})

    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias")
      res.redirect("/")
    })
  })

  app.get("/categorias/:slug", (req,res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
      if(categoria) {
        Postagem.find({categoria: categoria._id}).then((postagens) => {
          const categoriaobj = categoria.toObject()
          const postagensobj = postagens.map(postagens => postagens.toObject())
          res.render("categorias/postagens", {postagens: postagensobj, categoria: categoriaobj})
        }).catch((err) => {
          console.log(err)
          req.flash("error_msg", "Houve um erro ao listar os posts!")
          res.redirect("/")
        })
      } else {
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/")
      }
    }).catch((err) => {
      req.flash("error_msg","Houve um erro interno ao carregar a página desta categoria")
      res.redirect("/")
    })
  })

  app.get("/404", (req,res) => {
    res.send("Erro 404!")
  })
  app.get('/posts', (req,res) => {
    res.send('Lista de posts')
  })
  app.use('/admin', admin)
  app.use('/usuarios', usuarios)
// Outros
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log('Servidor rodando on PORT! ' + PORT)
})

module.exports = app;