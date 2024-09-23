const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
require("../models/Postagem")
const Categoria = mongoose.model("categorias")
const Postagem = mongoose.model("postagens")

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

router.get("/postagens", (req, res) => {
  Postagem.find().populate("categoria").sort({ date: "desc" }).then((postagens) => {
    const postagensMapeadas = postagens.map(postagem => postagem.toObject());
    res.render("admin/postagens", { postagens: postagensMapeadas });
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as postagens");
    res.redirect("/admin");
  });
});

router.get("/postagens/add", (req,res) => {
  Categoria.find().then((categorias) => {
    const plainCategorias = categorias.map(categoria => categoria.toObject());
    res.render("admin/addpostagem", {categorias: plainCategorias})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar o formulário");
    res.redirect("/admin");
  });
})

router.post("/postagens/nova", (req,res) => {
  var erros = []

  if(req.body.categoria == "0") {
    erros.push({texto:" Categoria inválida, registre uma categoria!"})
  }
  if(erros.length > 0) {
    res.render("admin/addpostagem", {erros: erros})
  }else {
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug
    }
    new Postagem(novaPostagem).save().then(() => {
      req.flash("success_msg", "Postagem criada com sucesso!")
      res.redirect("/admin/postagens")
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
      res.redirect("/admin/postagens")
    })
  }
})

router.get("/postagens/edit/:id", (req,res) => {
  
  Postagem.findOne({_id: req.params.id}).then((postagem) => {
    Categoria.find().then((categorias) => {
      const plainCategorias = categorias.map(categoria => categoria.toObject());
      const plainPostagem = postagem.toObject()
      res.render("admin/editpostagens", {categorias: plainCategorias, postagem: plainPostagem})
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias")
      res.redirect("/admin/postagens")
    })

  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
    res.redirect("/admin/postagens")
  })
})

router.post("/postagens/edit", (req,res) => {

  Postagem.findOne({_id: req.body.id}).then((postagem) => {
    postagem.titulo = req.body.titulo
    postagem.slug = req.body.slug
    postagem.descricao = req.body.descricao
    postagem.conteudo = req.body.conteudo
    postagem.categoria = req.body.categoria

    postagem.save().then(() => {
      req.flash("success_msg", "Postagem editada com sucesso!")
      res.redirect("/admin/postagens")
    }).catch((err) => {
      req.flash("error_msg", "Erro interno")
      res.redirect("/admin/postagens")
    })
  }).catch((err) =>{
    console.log(err)
    req.flash("error_msg","Houve um erro ao salvar a edição")
    res.redirect("/admin/postagens")
  })
})

router.get("/postagens/deletar/:id", (req,res) => {
  Postagem.findByIdAndDelete({_id: req.params.id}).then(() => {
    req.flash("success_msg", "Postagem deletada com sucesso")
    res.redirect("/admin/postagens")
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro interno")
    res.redirect("/admin/postagens")
  })
})

module.exports = router