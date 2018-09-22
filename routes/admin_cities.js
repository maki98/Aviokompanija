var express = require('express');
var router = express.Router();

//get city model
var City = require('../models/cities');

/*
    * GET cities index
*/

router.get('/', function(req, res){
    var count;

    City.count(function(err, c) {
        count = c;
    });

    City.find(function(err,cities){
        res.render('admin/cities', {
            cities: cities,
            count: count
        });
    });
});

/*
    * GET add city
*/
router.get('/add-city', function(req, res){
    var title = "";
    var slug = "";
    var airportname = "";

    res.render('admin/add_city', {
        title: title,
        slug: slug,
        airportname: airportname
    });
});

/*
    * POST add city
*/
router.post('/add-city', function(req, res){

    //exp validator
    req.checkBody('title', 'morate uneti naziv grada').notEmpty();
    req.checkBody('airportname', 'morate uneti naziv aerodroma').notEmpty();

    var title = req.body.title;
    var airportname = req.body.airportname;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();
    if(errors)
    {
        res.render('admin/add_city', {
            title: title,
            slug: slug,
            airportname: airportname,
            errors: errors
        });
    } else{
        City.findOne({slug: slug}, function(err, city) {
            if(city)
            {
                req.flash("danger", "skraćenica za URL već postoji - izaberite neku drugu");
                res.render('admin/add_city', {
                    title: title,
                    slug: slug,
                    airportname: airportname
                });
            } else {
            var city = new City({
                title: title,
                slug: slug,
                airportname: airportname
            });

            city.save(function(err){
                if (err)
                    return console.log(err);
            
            City.find({}).sort({sorting: 1}).exec(function (err, cities) {
                if (err) {
                    console.log(err);
                } else {
                    req.app.locals.cities = cities;
                }
            });
            req.flash('success', 'Mesto za polazak je dodato!');
            res.redirect('/admin/cities');
            });
        }
    });
}
});

/*
    * GET delete page 
*/

router.get('/delete-city/:id', function(req, res){
    City.findByIdAndRemove(req.params.id, function(err){
        if(err)
            return console.log(err);

        City.find({}).sort({sorting: 1}).exec(function (err, cities) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.cities = cities;
            }
        });
        res.redirect('/admin/cities');
    });
});

module.exports = router;
