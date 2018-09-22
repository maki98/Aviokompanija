var express = require('express');
var router = express.Router();

// Get Flight model
var Flights = require('../models/flights');

//Get City model
var Cities = require('../models/cities');

/*
 * GET a flight
 */
router.get('/:city', function (req, res) {

    var citySlug = req.params.city;

    Cities.findOne({slug: citySlug}, function (err, c) {
        Flights.find({from: citySlug}, function (err, flights) {
            if (err)
                console.log(err);

            res.render('city_flights', {
                title: c.title,
                flights: flights
            });
            console.log("PRIKAZ");

        });
    });
});

/*
 * GET a flight details
 */
router.get('/:cities/:flights', function (req, res) {
    
    Flights.findOne({slug: req.params.flights}, function(err, flights) {
       if(err)
       {
           console.log(err);
       } else {
           res.render('flights', {
                title: flights.title,
                flights: flights
           });
           console.log("PROSAO NA FLIGHTS");
       }
    });
});


// Exports
module.exports = router; 