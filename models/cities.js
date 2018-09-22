var mongoose = require('mongoose');

// Page Schema
var CitySchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    airportname:
    {
        type: String,
        required:true
    },
    slug: {
        type: String
    }
    
});

var City = module.exports = mongoose.model('City', CitySchema);

