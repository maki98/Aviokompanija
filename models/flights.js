var mongoose = require('mongoose');

// Flight Schema
var FlightSchema = mongoose.Schema({
   
    title: {
        type: String,
        required: true
    },
    from:{
        type:String,
        required:true
    },
    airportfrom:{
        type:String
    },
    to:{
        type:String,
        required:true
    },
    airportto:{
        type:String
    },
    date:{
        type:String,
        required:true
    },
    time:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    capacity: {
        type: Number,
        required: true
    },
    slug: {
        type: String
    }
});

var Flight = module.exports = mongoose.model('Flight', FlightSchema);

