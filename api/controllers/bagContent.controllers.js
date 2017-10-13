// var hotelData = require('../data/hotel-data.json');
var mongoose = require('mongoose');
// var id = new mongoose.Types.ObjectId(stringId);
var Pokedex = require('pokedex-promise-v2');
var options = {
	timeout: 10 * 100000,
	versionPath: '/api/v1/'
}
var P = new Pokedex();
var Pokemon = mongoose.model('Pokemon');
var Objs = mongoose.model('Objects');

module.exports.getBagContent = function(req, res) {
	var items = {
		'pokemons': '',
		'objects': ''
	};

	Pokemon.find().exec(function (err, pokemons) {
		if (err) {
			res.status(500).json(err);
		} else {
			console.log("You have " + pokemons.length + " pokemons.");
			items['pokemons']= pokemons;
			Objs.find().exec(function (err, objects) {
				if (err) {
					res.status(500).json(err);
				} else {
					console.log("You have " + objects.length + " object.");
					items['objects'] = objects;
					res.status(201).json(items);
				}
			});
		}
	});
};

module.exports.deletePokemon = function(req, res) {
	Pokemon.findByIdAndRemove(req.params.id, function (err) {
		if (!err) {
			res.status(201).json({'message': 'Deleted pokemon.'});
		} else {
			res.status(404).json(err);
		}
	});
};

module.exports.deleteObject = function(req, res) {
	Objs.findByIdAndRemove(req.params.id, function (err) {
		if (!err) {
			res.status(201).json({'message': 'Deleted object.'});
		} else {
			res.status(404).json(err);
		}
	});
};

module.exports.updateObjQuantity = function(req, res) {
	console.log(req.body.flag);
	console.log(req.params.id)
	Objs
	  .findById(req.params.id)
	  .select("quantity")
	  .exec(function(err, doc) {
	  	var queryResp = {
	  		status : 200,
	  		message: doc
	  	};
	  	console.log(doc);
	  	if (err) {
	  		queryResp.status = 500;
	  		queryResp.message = doc;
	  	} else if (!doc) {
	  		queryResp.status = 404;
	  		queryResp.message = {
	  			"message": "Object ID not found in your bag"
	  		};
	  	}
	  	if (queryResp.status !== 200) {
	  		res.status(queryResp.status).json(queryResp.message);
	  	} else if (!req.body.flag) {
	  		doc.quantity -= 1;
	  		doc.save(function (err, pokemonUpdated) {
				if (err) {
					console.log("Could not save new pokemon information.");
					res.status(500).json(err);
				} else {
					res.status(204).json({'message': 'Evolution successful.'})
				}
			});
	  	} else if (req.body.flag) {
	  		doc.quantity += 1;
	  		doc.save(function (err, pokemonUpdated) {
				if (err) {
					console.log("Could not save new pokemon information.");
					res.status(500).json(err);
				} else {
					res.status(204).json({'message': 'Evolution successful.'})
				}
			});
	  	}

	  });
};

module.exports.updatePokemonInfo = function(req, res) {
	Pokemon
	  .findById(req.params.id)
	  .select("held_items")
	  .exec(function (err, doc) {
	  	var queryResp = {
	  		status : 200,
	  		message: doc
	  	};
	  	if (err) {
	  		queryResp.status = 500;
	  		queryResp.message = error;
	  	} else if (!doc) {
	  		queryResp.status = 404;
	  		queryResp.message = {
	  			"message": "Pokemon ID not found in your bag"
	  		};
	  	}
	  	if (queryResp.status !== 200) {
	  		res.status(queryResp.status).json(queryResp.message);
	  	} else {
	  		doc.held_items.push({"name": req.body.item});
	  		doc.save(function (err, pokemonUpdated) {
				if (err) {
					console.log("Could not update pokemon information.");
					res.status(500).json(err);
				} else {
					res.status(204).json({'message': 'Pokemon Information updated successfully.'});
				}
			});
	  	}
	  });
};

module.exports.evolvePokemon = function(req, res) {
	// console.log(req.body.levelUP);
	Pokemon
	  .findById(req.params.id)
	  .exec(function (err, doc) {
	  	var queryResp = {
	  		status: 200,
	  		message: doc
	  	};
	  	if (err) {
	  		queryResp.status = 500;
	  		queryResp.message = doc;
	  	} else if (!doc) {
	  		queryResp.status = 404;
	  		queryResp.message = {
	  			"message": "Pokemon ID not found in your bag"
	  		};
	  	}
	  	if (queryResp.status !== 200) {
	  		res.status(queryResp.status).json(queryResp.message);
	  	} else if (( doc.evolutionInfo.evolutionDetails.trigger.length > 0 && 
	  		doc.evolutionInfo.evolutionDetails.trigger[0].name && 
	  		doc.evolutionInfo.evolutionDetails.trigger[0].name == 'level-up' && 
	  		doc.level == doc.evolutionInfo.evolutionDetails.min_level) || 
	  	    (doc.evolutionInfo.evolutionDetails.item &&
	  	    req.body.item == doc.evolutionInfo.evolutionDetails.item.name)) {
	  		console.log('evolution!!');
	  		//We want to also make sure that the level is the correct one in the back end as an extra step validation.
	  		//Since we know that we can easily bypass javascript validation on the front end

	  		//find the evolution of the pokemon found in the bag
	  		console.log(doc.evolutionInfo.name);
	  		P.getPokemonByName(doc.evolutionInfo.name).then(function(response) {
	  			// console.log(response);
	  			P.getPokemonSpeciesByName(doc.evolutionInfo.name).then(function(result) {
					var re = /^https:\/\/pokeapi.co\/api\/v2\/evolution\-chain\/(\d+)\/$/;
					var evolutionChainURL = result.evolution_chain.url.match(re);
					console.log(result.evolution_chain.url);
					var evolutionChainID = evolutionChainURL[1];

					P.getEvolutionChainById(evolutionChainID).then(function(resp) {
						if (response.name != resp.chain.species.name && response.name != resp.chain.evolves_to[0].evolves_to[0].species.name) {
							maxLevel = resp.chain.evolves_to[0].evolves_to[0].evolution_details[0].min_level;
							var evolutionInfo = {
								'name': resp.chain.evolves_to[0].evolves_to[0].species.name,
								'evolutionDetails': resp.chain.evolves_to[0].evolves_to[0].evolution_details[0],
								'msg': 'Congratulation on getting to the last form of your pokemon.'
							};
						} else if (response.name === resp.chain.evolves_to[0].evolves_to[0].species.name) { // last evolution already the pokemon requested or no evolutions
							maxLevel = 98;
							var evolutionInfo = {
								'name': '',
								'evolutionDetails': '',
								'msg': 'Congratulation on getting to the last form of your pokemon.'
							};
						} else { // first evolution where response.name === the closest evolution
							maxLevel = resp.chain.evolves_to[0].evolution_details[0].min_level;
							var evolutionInfo = {
								'name': resp.chain.evolves_to[0].species.name,
								'evolutionDetails': resp.chain.evolves_to[0].evolution_details[0]
							};
						}
						
						console.log(response.name);
						doc.base_experience= response.baseExperience;
						doc.forms= response.forms;
						doc.height= response.height;
						doc.held_items= response.heldItems;
						doc.id= response.id;
						doc.location= response.location;
						doc.stats= response.stats;
						doc.sprites = response.sprites;
						doc.name = response.name;
						doc.species = response.species;
						doc.types = response.types;
						doc.weight = response.weight;
						doc.maxLevel = maxLevel;
						doc.evolutionInfo.name = evolutionInfo.name;
						doc.evolutionInfo.evolutionDetails = evolutionInfo.evolutionDetails;
						console.log(doc.name);
						doc.save(function (err, pokemonUpdated) {
							if (err) {
								console.log("Could not save new pokemon information.");
								res.status(500).json(err);
							} else {
								res.status(204).json({'message': 'Evolution successful.'})
							}
						});
					});
				});
	  		}); 
	  	} else if (req.body.levelUP == true){
	  		console.log('levelingUP');
	  		doc.level += 1;
	  		doc.save(function (err, pokemonUpdated) {
				if (err) {
					console.log("Could not save new pokemon information.");
					res.status(500).json(err);
				} else {
					res.status(204).json({'message': 'Level Up successful.'})
				}
			});
	  	}
	  });
};
