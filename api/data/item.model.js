var mongoose = require('mongoose');

var objectSchema = new mongoose.Schema({
	id: Number,
	name: String,
	cost: Number,
	sprites: String,
	effect: String,
	quantity: Number
});

mongoose.model('Objects', objectSchema);