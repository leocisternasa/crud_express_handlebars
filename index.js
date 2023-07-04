const express = require("express");
const app = express();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const exphbs = require("express-handlebars");
const PORT = 3000;

//Midelware bootstrap
app.use(
  "/bootstrap",
  express.static(__dirname + "/node_modules/bootstrap/dist/css")
);
//Midelware para usar la informacion del body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuracion de Handlebars
app.set("view engine", "handlebars");

const handlebars = exphbs.create({
  defaultLayout: __dirname + "/views/layout/Main.handlebars",
  layoutsDir: __dirname + "/views",
  partialsDir: __dirname + "/views/partials",
});

app.engine("handlebars", handlebars.engine);
//Endpoints
app.get("/", (req, res) => {
  res.render("home");
});

//Mostrar formulario para crear peliculas

app.get("/crear", (req, res) => {
  res.render("crear");
});

app.post("/crear", (req, res) => {
  console.log(req.body);
  try {
    let { titulo, sinopsis } = req.body;
    let pelicula = { id: uuidv4().slice(30), titulo, sinopsis };
    let data = fs.readFileSync("peliculas.json", "utf-8");
    let { peliculas } = JSON.parse(data);
    if (peliculas.some((pelicula) => pelicula.titulo == titulo)) {
      throw new Error(
        "<h1>La pelicula ya existe, por favor ve a actualizarla</h1>"
      );
    }
    peliculas.push(pelicula);
    fs.writeFileSync("peliculas.json", JSON.stringify({ peliculas }), "utf-8");
    res.redirect("/");
    console.log(peliculas);
  } catch (error) {
    res.send(error.message);
  }
});

app.get("/verPeliculas", (req, res) => {
  //leo el archivo
  let data = fs.readFileSync("peliculas.json", "utf-8");
  //parseo la informacion
  let { peliculas } = JSON.parse(data);
  //le envio la informacion al partial
  res.render("ver_peliculas", { peliculas: peliculas });
});

app.get("/actualizar/:id", (req, res) => {
  try {
    let { id } = req.params;
    let data = fs.readFileSync("peliculas.json", "utf-8");
    let { peliculas } = JSON.parse(data);
    let pelicula = peliculas.find((pelicula) => pelicula.id == id);
    const variables = {
      titulo: pelicula.titulo,
      id: pelicula.id
    };
    console.log(variables.titulo, variables.id)
    res.render("actualizar", variables);
  } catch (error) {
    res.send(error.message);
  }
});

app.post("/actualizar/:id", (req, res) => {
  try {
    
    let { id } = req.params;
    let { newSinopsis } = req.body;
    console.log(id)
    console.log(newSinopsis)
    let data = fs.readFileSync("peliculas.json", "utf-8");
    let { peliculas } = JSON.parse(data);
    let pelicula = peliculas.find((pelicula) => pelicula.id == id);
    pelicula.sinopsis = newSinopsis;
  
    fs.writeFileSync("peliculas.json", JSON.stringify({ peliculas }), "utf-8");
    res.redirect("/");
  } catch (error) {
    console.log(error.message)
  }
});

app.get("/delete/:id", (req, res)=>{
    let {id} = req.params
    let data = fs.readFileSync("peliculas.json", "utf-8");
    let { peliculas } = JSON.parse(data);
    peliculas = peliculas.filter((pelicula) => pelicula.id !== id);
    fs.writeFileSync("peliculas.json", JSON.stringify({peliculas}))
    res.redirect("/verPeliculas")
          
})
app.listen(PORT, () => {
  console.log(`escuchando en el puerto ${PORT}`);
});

