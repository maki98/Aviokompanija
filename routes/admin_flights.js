var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var mkdirp = require('mkdirp');

//get flight model
var Flight = require('../models/flights');

/*
    * GET flights index
*/

router.get('/', function(req, res){
    var count;

    Flight.count(function(err, c) {
        count = c;
    });

    Flight.find(function(err,flights){
        res.render('admin/flights', {
            flights: flights,
            count: count
        });
    });
});

/*
    * GET add flight
*/
router.get('/add-flight', function(req, res){
    var title = "";
    var from = "";
    var to = "";
    var price = "";
    var slug = "";
    var time = "";
    var date = "";
    var capacity = "";

    res.render('admin/add_flight', {
        title: title,
        slug: slug,
        from: from,
        to: to,
        date: date,
        time: time,
        price: price,
        capacity: capacity
    });
});

/*
    * POST add flight
*/
router.post('/add-flight', function(req, res){

    //exp validator
    req.checkBody('title', 'morate uneti naziv').notEmpty();
    req.checkBody('from', 'morate uneti mesto polaska').notEmpty();
    req.checkBody('to', 'morate uneti mesto dolaska').notEmpty();
    req.checkBody('date', 'morate uneti datum').notEmpty();
    req.checkBody('time', 'morate uneti vreme').notEmpty();
    req.checkBody('price', 'morate uneti cenu').notEmpty();
    req.checkBody('capacity', 'morate uneti kapacitet leta').notEmpty();


    console.log("Sve ok");
    var title = req.body.title;
    var from = req.body.from;
    var to = req.body.to;
    var date = req.body.date;
    var time = req.body.time;
    var price = req.body.price;
    var capacity = req.body.capacity;

    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();
    if(errors)
    {
        res.render('admin/add_flight', {
            title: title,
            slug: slug,
            from: from,
            to: to,
            date: date,
            time: time,
            price: price,
            errors: errors
        });
    } else{
        Flight.findOne({slug: slug}, function(err, flight) {
            if(flight)
            {
                req.flash("danger", "skraćenica za URL već postoji - izaberite neku drugu");
                res.render('admin/add_flight', {
                    title: title,
                    slug: slug,
                    from: from,
                    to: to,
                    date: date,
                    price: price,
                    time: time,
                    capacity: capacity,
                });
            } else {
            var flight = new Flight({
                title: title,
                    slug: slug,
                    from: from,
                    to: to,
                    date: date,
                    time: time,
                    price: price,
                    capacity: capacity
            });

            flight.save(function(err){
                if (err)
                    return console.log(err);
            
            req.flash('success', 'Let je dodat!');
            res.redirect('/admin/flights');
            });
        }
    });
}
});

/*
    * GET edit flight
*/

router.get('/edit-flight/:id', function (req, res) {

    Flight.findById(req.params.id, function (err, flight) {
        if (err)
            return console.log(err);

        res.render('admin/edit_flight', {
            title: flight.title,
            slug: flight.slug,
            from: flight.from,
            to: flight.to,
            date: flight.date,
            price: flight.price,
            time: flight.time,
            capacity: flight.capacity,
            id: flight._id
        });
    });

});

/*
 * POST edit flight
 */
router.post('/edit-flight/:id', function (req, res) {
    
    req.checkBody('title', 'morate uneti naziv').notEmpty();
    req.checkBody('from', 'morate uneti mesto polaska').notEmpty();
    req.checkBody('to', 'morate uneti mesto dolaska').notEmpty();
    req.checkBody('date', 'morate uneti datum').notEmpty();
    req.checkBody('time', 'morate uneti vreme').notEmpty();
    req.checkBody('price', 'morate uneti cenu').notEmpty();
    req.checkBody('capacity', 'morate uneti kapacitet mesta').notEmpty();


    console.log("Sve ok");
    var title = req.body.title;
    var from = req.body.from;
    var to = req.body.to;
    var date = req.body.date;
    var time = req.body.time;
    var price = req.body.price;   
    var capacity = req.body.capacity;   
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/flights/edit-flight/' + id);
        /*res.render('admin/edit_flight', {
           /* errors: errors,
            title: title,
            slug: slug,
            from: from,
            to: to,
            date: date,
            time: time,
            id: id
        });*/
    } else {
        Flight.findOne({slug: slug, _id: {'$ne': id}}, function (err, flight) {
            if(err)
                console.log(err);
            
            if (flight) {
                req.flash('danger', 'skraćenica za URL je zauzeta!');
                res.redirect('/admin/flights/edit-flight/' + id);
                /* res.render('admin/edit_flight', {
                    errors: errors,
                    title: title,
                    slug: slug,
                    from: from,
                    to: to,
                    date: date,
                    time: time,
                    _id: id
                });*/
            } else {
                Flight.findById(id, function (err, flight) {
                    if (err)
                        return console.log(err);

                    flight.title = title;
                    flight.from = from;
                    flight.to = to;
                    flight.date = date;
                    flight.time = time;
                    flight.price = price;
                    flight.capacity = capacity;


                    flight.save(function (err) {
                        if (err)
                            return console.log(err);
                            
                                                                                    
                            /*Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    req.app.locals.pages = pages;
                                }
                            });*/

                        req.flash('success', 'Let je izmenjen!');
                        res.redirect('/admin/flights/edit-flight/' + id);
                    });
                });
            }
        });
    }

});


/*
    * GET delete flight 
*/

router.get('/delete-flight/:id', function(req, res){
    Flight.findByIdAndRemove(req.params.id, function(err){
        if(err)
            return console.log(err);

        req.flash('success', 'Let je obrisan!');
        res.redirect('/admin/flights');
    });
});

/*
* POST REORDER PAGES
*/
router.post('/reorder-pages', function(req, res){
    var ids = req.body['id[]'];

    var count = 0;

        for(var i = 0; i < ids.length; i++){
            var id = ids[i];
            count++;
            
            (function(count) {
            Page.findById(id, function(err, page){
                page.sorting = count;
                page.save(function(err){
                if (err) 
                    return console.log(err);
            });
        });
    }) (count);
    }
});

module.exports = router;
