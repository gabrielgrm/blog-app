if(process.env.NODE_ENV == "production") {
  module.exports = {mongoURI: "mongodb+srv://gabrielgrmagalhaes:NqM3fvjIfrINuplP@blogapp.n96m4.mongodb.net/?retryWrites=true&w=majority&appName=blogapp"}
} else {
  module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}