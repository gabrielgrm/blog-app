const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")

router.get('/', (req, res) => {
  res.render("admin/index")
})

router.get('/posts', (req, res) => {
  res.send("Página de posts")
})

router.get("/categorias", (req, res) => {
  Categoria.find().sort({date: 'desc'}).then((categorias) => {
    const plainCategorias = categorias.map(categoria => categoria.toObject());
    res.render("admin/categorias", { categorias: plainCategorias });
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as categorias");
    res.redirect("/admin");
  });
})


router.get("/categorias/add", (req, res) => {
  res.render("admin/addcategorias")
})

router.post("/categorias/nova", (req, res) => {
  var erros = []

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({texto: "Nome inválido"})
  }

  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    erros.push({texto: "Slug inválido"})
  }

  if(req.body.nome.length < 2) {
    erros.push({texto: "Nome da categoria é muito pequeno"})
  }

  if(erros.length > 0) {
    res.render("admin/addcategorias", {erros: erros})
  } else {
    
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug
    }
  
    new Categoria(novaCategoria).save().then(() => {
      req.flash("success_msg", "Categoria criada com sucesso")
      res.redirect("/admin/categorias")
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
      res.redirect("/admin")
    })
  }

})

router.get("/categorias/edit/:id", (req,res) => {
  Categoria.findOne({_id:req.params.id}).then((categoria) => {
    const plainCategorias = categoria.toObject()
    res.render("admin/editcategorias", {categoria: plainCategorias})
  }).catch((err) => {
    req.flash("error_msg", "Esta categoria não existe")
    res.redirect("/admin/categorias")
  })
})

router.post("/categorias/edit", (req, res) => {
  Categoria.findOne({ _id: req.body.id }).then((categoria) => {
    var erros1 = [];
    
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
      erros1.push({ texto: "Nome inválido" });
    }
    else if (req.body.nome.length < 2) {
      erros1.push({ texto: "Nome da categoria é muito pequeno" });
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
      erros1.push({ texto: "Slug inválido" });
    }


    if (erros1.length > 0) {
      req.flash("error_msg", erros1.map(err => err.texto).join(", "));
      return res.redirect("/admin/categorias/edit/" + req.body.id);
    } else {
      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;
      categoria.save().then(() => {
        req.flash("success_msg", "Categoria editada com sucesso!");
        res.redirect("/admin/categorias");
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao salvar a edição");
        res.redirect("/admin/categorias");
      });
    }
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao editar a categoria");
    res.redirect("/admin/categorias");
  });
});

router.post("/categorias/deletar", (req,res) => {
  Categoria.findOneAndDelete({_id: req.body.id}).then(() => {
    req.flash("success_msg", "Categoria removida com sucesso")
    res.redirect("/admin/categorias")
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao deletar categoria")
    res.redirect("/admin/categorias")
  })
})
module.exports = router