var mongoose = require('mongoose');

var formSchema = new mongoose.Schema({
	name: String,
	url: String
});

// var itemSchema = new mongoose.Schema({
// 	name: String,
// 	url: String
// });

var versionSchema = new mongoose.Schema({
	name: String,
	url: String,
});

// var versionDetailSchema = new mongoose.Schema({
// 	rarity: Number,
// 	version: [versionSchema]
// });

// var speciesSchema = new mongoose.Schema({
// 	name: String,
// 	url: String
// });

var spritesSchema = new mongoose.Schema({
	default: String,
	female: String,
	shiny: String,
	shiny_femail: String,
	front_default: String,
	front_female: String,
	front_shiny: String,
	front_shiny_female: String
});

var statsSchema = new mongoose.Schema({
	base_stat: Number,
	effort: Number,
	stat: formSchema
});

var typesSchema = new mongoose.Schema({
	slot: Number,
	type: formSchema
});

var evolutionDetailsSchema = new mongoose.Schema({
	gender: String,
	min_level: Number,
	trigger: [{name: String, url: String}],
	min_affection: Number,
	min_beauty: Number,
	min_happiness: Number,
	item: formSchema
});

var evolutionSchema = new mongoose.Schema({
	name: String,
	evolutionDetails: evolutionDetailsSchema
});

var pokemonSchema = new mongoose.Schema({
	base_experience: Number,
	forms: [formSchema],
	height: Number,
	held_items: [formSchema],
	id: Number,
	locationArea: String,
	name: String,
	species: [formSchema],
	sprites: [spritesSchema],
	stats: [statsSchema],
	types: [typesSchema],
	weight: Number,
	level: Number,
	evolutionInfo: evolutionSchema
});

mongoose.model('Pokemon', pokemonSchema, "pokemons");