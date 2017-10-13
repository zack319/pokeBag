// var hotelData = require('../data/hotel-data.json');
var mongoose = require('mongoose');
var Pokedex = require('pokedex-promise-v2');
var options = {
	timeout: 10 * 100000,
	versionPath: '/api/v1/'
}
var P = new Pokedex();
var Pokemon = mongoose.model('Pokemon');
var Objs = mongoose.model('Objects');

//GET list of all objects FOR DISPLAY
module.exports.getObjects = function(req, res) {
	var objectList = new Array();
	P.getItemsList().then(function(response) {
		console.log(typeof response.results);
		(response.results).forEach( function(object) {
			objectList.push(object.name);
		});
		res.status(200).json(objectList);
		return objectList;
	 })
	 .catch(function(error) {
	 	res.status(404).json({'message': 'There was an error ' + error});
	 });
};

//get the info for one object FOR DISPLAY
module.exports.getObject = function(req, res) {
	P.getItemByName(req.params.objectId).then(function(response) {
		res.status(200).json(response);
	}).catch(function(error) {
		res.status(404).json({'message': 'There was an error '+ error});
	});
};

module.exports.getBagObjects = function(req, res) {
	Objs.find().exec(function (err, objects) {
		if (err) {
			res.status(500).json(err);
		} else {
			console.log("You have " + objects.length + " pokemons.");
			res.json(objects);
		}
	});
};

//OBJECT look up to add to bag
module.exports.addObject = function(req, res) {
	console.log(req.body);
	P.getItemByName(req.body.name).then(function(response) {
		Objs.create({
			id: response.id,
			cost: response.cost,
			Sprites: response.sprites,
			name: response.name,
			effect: response.effect_entries[0].short_effect + " " + response.effect_entries[0].effect,
			quantity: 1
		}, function (err, object) {
			if (err) {
				console.log("Cannot create the object record");
				res.status(400).json(err)
			} else {
				console.log('inserted object information in datbase');
				res.status(201).json(object);
			}
		});
	}).catch(function(error) {
		res.status(404).json({'message': 'There was an error '+ error});
	});
}
