const express = require('express')
const morgan = require('morgan')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize')
const { success, getUniqueId } = require('./helper.js')
let pokemons = require('./mock-pokemon')
const PokemonModel = require('./src/models/pokemon.js')

const app = express()
const port = 3000

const sequelize = new Sequelize(
  'pokedex',
  'root',
  '',
  {
    host: 'localhost',
    dialect: 'mariadb',
    dialectOptions: {
      timezone: 'Etc/GMT-2'
    },
    logging: false
  }
)
sequelize.authenticate()
  .then(_ => console.log('Database connected !'))
  .catch(error => console.error(`Connection to database failed ${error}`))

const Pokemon = PokemonModel(sequelize, DataTypes)

sequelize.sync({force: true})
.then(_ => {
  console.log('La base de donnée pokedex a bien été synchronisée !')

  pokemons.map(pokemon => {
    Pokemon.create({
      name: pokemon.name,
      hp: pokemon.hp,
      cp: pokemon.cp,
      picture: pokemon.picture,
      types: pokemon.types.join()
    }).then(bulbizarre => console.log(bulbizarre.toJSON()))
  })

})

app
  .use(favicon(__dirname + '/favicon.ico'))
  .use(morgan('dev'))
  .use(bodyParser.json())

app.get('/', (req, res) => res.send('Hello, Express Jonathan ! 👋'))

//endpoints
app.get('/api/pokemons', (req, res) => {
  const message = "La liste des pokemons a bien été récupérée !"
  res.json(success(message, pokemons))
})

app.get('/api/pokemons/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const pokemon = pokemons.find(pokemon => pokemon.id === id)
  const message = "Un pokemon a bien été trouvé !"
  res.json(success(message, pokemon))
  // res.send(`Vous avez demandé le pokemon ${pokemon.name}`)
})

app.post('/api/pokemons', (req, res) => {
  const id = getUniqueId(pokemons)
  // console.log(`Contenue de req.body : ${req.body}`);
  const pokemonCreated = { ...req.body, ...{id: id, created: new Date()} }
  pokemons.push(pokemonCreated)
  const message = `Le pokemon ${pokemonCreated.name} a bien été créé !`
  res.json(success(message, pokemonCreated))
})

app.put('/api/pokemons/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const pokemonUpdated = { ...req.body, id: id }
  pokemons = pokemons.map(pokemon => {
    return pokemon.id === id ? pokemonUpdated : pokemon
  })
  const message = `Le pokemon ${pokemonUpdated.name} a bien été modifié !`
  res.json(success(message, pokemonUpdated))
})

app.delete('/api/pokemons/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const pokemonDeleted = pokemons.find(pokemon => pokemon.id === id)
  pokemons.filter(pokemon => pokemon.id !== id)
  const message = `Le pokemon ${pokemonDeleted.name} a bien été supprimé !`
  res.json(success(message, pokemonDeleted))
})

app.listen(port, () => console.log(`Notre app tourne sur : http://localhost:${port}`))

