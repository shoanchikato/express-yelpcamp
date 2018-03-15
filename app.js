var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    seedDB     = require("./seeds")

mongoose.connect("mongodb://127.0.0.1/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static('public'));
seedDB();

app.get("/", function(req, res){
	res.render("landing");
});

// INDEX - show all campgrounds
app.get("/campgrounds", function(req, res){
	// Get all campgrounds from the DB
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	});
	
});
// CREATE - add new campground to DB
app.post("/campgrounds", function(req, res){	
	// get data from form and add to campgrounds array
	var name = req.body.name
	var image = req.body.image
	var desc = req.body.description
	var file = req.body.file

	var newCampground = {name: name, image: image, description: desc, file: file}
	// Create new campground and save to DB 
	Campground.create(newCampground, function(err, newlyCreated){
		 if(err){
		 	console.log(err);
		 } else {
		 	// redirect back to campgrounds page
			res.redirect("/campgrounds");
		 }
	});
	
});
// NEW - show form to create new campground
app.get("/campgrounds/new", function(req, res){
	res.render("campgrounds/new");
});

// SHOW - shows more info about one campground  
app.get("/campgrounds/:id", function(req, res){
	// find campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		} else {
			console.log(foundCampground);
			// render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});		
});

// ====================================
// COMMENTS ROUTES
// ====================================

app.get("/campgrounds/:id/comments/new", function(req, res){
	// find by id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground});
		}		
	});
	
});

app.post("/campgrounds/:id/comments", function(req, res){
	// lookup campground using ID
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			// create new comment
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				} else {
					// connect new comment to campground
					campground.comments.push(comment);
					campground.save();
					// redirect campground show page
					res.redirect('/campgrounds/' + campground._id);
				}
			});			
		}
	});
	
});


app.listen(3000, function(){
	console.log("YelpCamp Server Has Started!");
});