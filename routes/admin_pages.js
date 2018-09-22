var express = require('express');
var router = express.Router();

//get page model
var Page = require('../models/page');

/*
    * GET pages index
*/

router.get('/', function(req, res){
    Page.find({}).sort({sorting: 1}).exec(function(err, pages){
        res.render('admin/pages', {
            pages: pages
        });
    });
});

/*
    * GET add page
*/
router.get('/add-page', function(req, res){
    var title = "";
    var slug = "";
    var content = "";


    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });
});

/*
    * POST add page
*/
router.post('/add-page', function(req, res){

    //exp validator
    req.checkBody('title', 'morate uneti naziv').notEmpty();
    req.checkBody('content', 'morate uneti sadržaj').notEmpty();

    var title = req.body.title;
    var content = req.body.content;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();
    if(errors)
    {
        res.render('admin/add_page', {
            title: title,
            slug: slug,
            content: content,
            errors: errors
        });
    } else{
        Page.findOne({slug: slug}, function(err, page) {
            if(page)
            {
                req.flash("danger", "skraćenica za URL već postoji - izaberite neku drugu");
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
            var page = new Page({
                title: title,
                slug: slug,
                content: content,
                sorting: 100
            });

            page.save(function(err){
                if (err)
                    return console.log(err);
            
            Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                if (err) {
                    console.log(err);
                } else {
                    req.app.locals.pages = pages;
                }
            });
            req.flash('success', 'Stranica je dodata!');
            res.redirect('/admin/pages');
            });
        }
    });
}
});

/*
    * GET edit page
*/

router.get('/edit-page/:id', function (req, res) {

    Page.findById(req.params.id, function (err, page) {
        if (err)
            return console.log(err);

        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });

});

/*
 * POST edit page
 */
router.post('/edit-page/:id', function (req, res) {
    req.checkBody('title', 'morate uneti naziv.').notEmpty();
    req.checkBody('content', 'morate uneti sadržaj.').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        Page.findOne({slug: slug, _id: {'$ne': id}}, function (err, page) {
            if (page) {
                req.flash('danger', 'skraćenica za URL je zauzeta!');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    _id: id
                });
            } else {
                Page.findById(id, function (err, page) {
                    if (err)
                        return console.log(err);

                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save(function (err) {
                        if (err)
                            return console.log(err);
                            
                                                                                    
                    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });

                        res.redirect('/admin/pages/edit-page/' + page.slug);
                    });
                });
            }
        });
    }

});


/*
    * GET delete page 
*/

router.get('/delete-page/:id', function(req, res){
    Page.findByIdAndRemove(req.params.id, function(err){
        if(err)
            return console.log(err);

        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
        req.flash('success', 'Stranica je obrisana!');
        res.redirect('/admin/pages');
    });
});

/*
* POST REORDER PAGES
*/
/*
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
*/

// Sort pages function
function sortPages(ids, callback) {
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err)
                        return console.log(err);
                    ++count;
                    if (count >= ids.length) {
                        callback();
                    }
                });
            });
        })(count);

    }
}

/*
 * POST reorder pages
 */
router.post('/reorder-pages', function (req, res) {
    var ids = req.body['id[]'];

    sortPages(ids, function () {
        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
    });

});


module.exports = router;
