// Carregando módulos
const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();
const admin = require('./routes/admin');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const moment = require('moment');
require('moment/locale/pt-br');
require('./models/Postagem');
const Postagem = mongoose.model('postagens');
require('./models/Categoria');
const Categoria = mongoose.model('categorias');
const usuarios = require('./routes/usuarios');
const passport = require('passport');
const MongoStore = require('connect-mongo');
require('./config/auth')(passport);

// Configurações
// Sessão
app.use(
  session({
    secret: 'admin',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_CONNECT_URI,
      ttl: 14 * 24 * 60 * 60 // 14 dias
    })
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handlebars
app.set('views', path.join(__dirname, 'views'));
app.engine(
  'handlebars',
  engine({
    defaultLayout: 'main',
    helpers: {
      formatDate: function (date) {
        return moment(date).format('LLL');
      }
    }
  })
);
app.set('view engine', 'handlebars');

// Mongoose
mongoose.Promise = global.Promise;
const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECT_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Conectado ao MongoDB');
  } catch (err) {
    console.error('Erro ao se conectar ao MongoDB: ', err);
  }
};
connectToMongo();

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
app.get('/', async (req, res) => {
  try {
    console.log("Rota inicial acessada");
    const postagens = await Postagem.find().populate('categoria').sort({ date: 'desc' });
    console.log("Postagens encontradas: ", postagens);
    const mappost = postagens.map(postagem => postagem.toObject());
    res.render('index', { postagens: mappost });
  } catch (err) {
    console.error("Erro ao buscar postagens: ", err);
    req.flash('error_msg', 'Houve um erro interno');
    res.redirect('/404');
  }
});

app.get('/postagem/:slug', async (req, res) => {
  try {
    const postagem = await Postagem.findOne({ slug: req.params.slug });
    if (postagem) {
      const mappost = postagem.toObject();
      res.render('postagem/index', { postagem: mappost });
    } else {
      req.flash('error_msg', 'Esta postagem não existe');
      res.redirect('/');
    }
  } catch (err) {
    req.flash('error_msg', 'Houve um erro interno');
    res.redirect('/');
  }
});

app.get('/categorias', async (req, res) => {
  try {
    const categorias = await Categoria.find();
    const mapcategorias = categorias.map(categoria => categoria.toObject());
    res.render('categorias/index', { categorias: mapcategorias });
  } catch (err) {
    req.flash('error_msg', 'Houve um erro interno ao listar as categorias');
    res.redirect('/');
  }
});

app.get('/categorias/:slug', async (req, res) => {
  try {
    const categoria = await Categoria.findOne({ slug: req.params.slug });
    if (categoria) {
      const postagens = await Postagem.find({ categoria: categoria._id });
      const categoriaobj = categoria.toObject();
      const postagensobj = postagens.map(postagem => postagem.toObject());
      res.render('categorias/postagens', { postagens: postagensobj, categoria: categoriaobj });
    } else {
      req.flash('error_msg', 'Esta categoria não existe');
      res.redirect('/');
    }
  } catch (err) {
    req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria');
    res.redirect('/');
  }
});

app.get('/404', (req, res) => {
  res.send('Erro 404!');
});

app.get('/posts', (req, res) => {
  res.send('Lista de posts');
});

app.use('/admin', admin);
app.use('/usuarios', usuarios);

// Outros
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});

module.exports = app;