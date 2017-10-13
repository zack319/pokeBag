var express = require('express');
var router = express.Router();

var ctrlObjects = require('../controllers/objects.controllers.js');
var ctrlPokemon = require('../controllers/pokemon.controllers.js');
var ctrlBag = require('../controllers/bagContent.controllers.js');
router
  .route('/pokemon')
  .post(ctrlPokemon.addPokemon) //add one pokemon to bag
  .get(ctrlPokemon.getAllPokemon); //get list of all pokemons names

router
  .route('/bag')
  .get(ctrlBag.getBagContent); //get content of the trainer's bag

router
  .route('/bag/pokemon/:id')
  .put(ctrlBag.evolvePokemon)
  .delete(ctrlBag.deletePokemon); //delete one pokemon from my bag

router
  .route('/bag/pokemon/update/:id')
  .put(ctrlBag.updatePokemonInfo);

router
  .route('/bag/object/:id')
  .put(ctrlBag.updateObjQuantity)
  .delete(ctrlBag.deleteObject);

router
  .route('/object')
  .get(ctrlObjects.getObjects) //get list of all objects
  .post(ctrlObjects.addObject); //add one object to bag

router
  .route('/object/:objectId')
  .get(ctrlObjects.getObject);

router
  .route('/pokemon/:pokemonId')
  .get(ctrlPokemon.getPokemon);


module.exports = router;