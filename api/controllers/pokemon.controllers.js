// var hotelData = require('../data/hotel-data.json');
var mongoose = require('mongoose');
var Pokedex = require('pokedex-promise-v2');
var options = {
	versionPath: '/api/v2/version/1/'
}
var P = new Pokedex();
var Pokemon = mongoose.model('Pokemon');


module.exports.getAllPokemon = function (req, res) {
	var pokemonList = new Array();
	P.getPokedexByName("kanto").then(function(response) {
		for (var i=0; i<response.pokemon_entries.length; i++) {
			pokemonList.push(response.pokemon_entries[i].pokemon_species.name);
		}
		res.status(200).json(pokemonList);
		return pokemonList;
	 }).catch(function(error) {
	 	res.status(404).json({'message' : 'There was an error '+ error});
	 });
}

module.exports.getPokemon = function(req, res) {
	P.getPokemonByName(req.params.pokemonId).then(function(response) {
	 	res.status(200).json(response);
	 }).catch(function(error) {
	 	res.status(404).json({'message': 'There was an error', error});
	 });
};

module.exports.getBagPokemons = function(req, res) {
	Pokemon.find().exec(function (err, pokemons) {
		if (err) {
			res.status(500).json(err);
		} else {
			console.log("You have " + pokemons.length + " pokemons.");
			res.json(pokemons);
		}
	});
};

module.exports.addPokemon = function(req, res) {
	// console.log(req);
	try {
		if (req.body.name > 151 && req.body.pokemonList.indexOf(req.body.name) <= 0) {
			// res.status(404).json({'message' : 'This is only a Kanto pokedex.'})
			throw 'This is a Kanto pokedex.';
		}
		var maxLevel;
		// return Math.floor(Math.random() * (max - min)) + min
		P.getPokemonSpeciesByName(req.body.name).then(function(response) {
			var re = /^https:\/\/pokeapi.co\/api\/v2\/evolution\-chain\/(\d+)\/$/;
			var evolutionChainURL = response.evolution_chain.url.match(re);
			var evolutionChainID = evolutionChainURL[1];

			P.getEvolutionChainById(evolutionChainID).then(function(resp) {
				if (response.name != resp.chain.species.name && response.name != resp.chain.evolves_to[0].evolves_to[0].species.name) {
					maxLevel = resp.chain.evolves_to[0].evolves_to[0].evolution_details[0].min_level;
					var level = Math.floor(Math.random() * (maxLevel - 1)) + 1;
					var evolutionInfo = {
						'name': resp.chain.evolves_to[0].evolves_to[0].species.name,
						'evolutionDetails': resp.chain.evolves_to[0].evolves_to[0].evolution_details[0]
					};
				} else if (response.name === resp.chain.evolves_to[0].evolves_to[0].species.name) {
					maxLevel = 98;
					var level = Math.floor(Math.random() * (maxLevel - 1)) + 1;
					var evolutionInfo = {
						'msg': 'Congratulation on getting to the last form of your pokemon.'
					};
				} else {
					maxLevel = resp.chain.evolves_to[0].evolution_details[0].min_level;
					var level = Math.floor(Math.random() * (maxLevel - 1)) + 1;
					var evolutionInfo = {
						'name': resp.chain.evolves_to[0].species.name,
						'evolutionDetails': resp.chain.evolves_to[0].evolution_details[0]
					};
				}					

				P.getPokemonByName(req.body.name).then(function(response) {
					Pokemon.create({
						base_experience: response.baseExperience,
						forms: response.forms,
						height: response.height,
						held_items: response.heldItems,
						id: response.id,
						location: response.location,
						stats: response.stats,
						sprites: response.sprites,
						name: response.name,
						species: response.species,
						types: response.types,
						weight: response.weight,
						level: level,
						maxLevel: maxLevel,
						evolutionInfo: evolutionInfo
					}, function (err, pokemon) {
						if(err) {
							console.log("Cannot create the pokemon record");
							res.status(400).json(err);
						} else {
							console.log('inserted pokemon information in datbase');
							res.status(201).json(pokemon);
						}
					});
				 })
				 .catch(function(error) {
				 	res.status(404).json({'message': 'There was an error ' + error});
				 });
			});
		});
	} catch (err) {
		res.status(404).json({'message' : err});
	}
};
