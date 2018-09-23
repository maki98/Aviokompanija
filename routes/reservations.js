var express = require('express');
var router = express.Router();

// Get Flight model
var Flight = require('../models/flights');

/*
 * GET a flight
 */
router.get('/:from/:slug', function (req, res) {

    var slug = req.params.slug;

    Flight.findOne({slug: slug}, function (err, flights) {
        if (err)
            console.log(err);
        
        res.render('reservations', {
                title: flights.title,
                flights: flights
            });
    });

});

// Exports
module.exports = router;


