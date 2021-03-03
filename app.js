require("dotenv").config(); // Define Environment variables

const mongoose = require("mongoose");

const express = require("express");
const ejs = require("ejs");

const session =require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

// Set Up the sessions
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}));

// Init the passport package
app.use(passport.initialize());
// Use passport to manage whith the sessions
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
    email: {
        type: String,
    },
    password: {
        type: String,
    }
});

userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userSchema);

// Create a local Strategy to serialize and deserialize the user
passport.use(User.createStrategy());    
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
});

app.route("/login")
    .get(function(req, res){
        res.render("login");
    })

    .post(function(req,res){
        const user = new User({
            username: req.body.username,
            password: req.body.password,
        });
        req.login(user, function(err){
            if(!err){
                passport.authenticate("local")(req,res,function(){res.redirect("/secrets");});
            }else{
                console.log(err);
                res.render("login");
            }
        });
    });

app.route("/register")
    .get(function(req, res){
        res.render("register");
    })
    
    .post(function(req,res){
        User.register({username: req.body.username}, req.body.password, function(err, user){
            if(!err){
                passport.authenticate("local")(req,res,function(){res.redirect("/secrets");});
            }else{
                console.log(err);
                res.render("register");
            }
        });
    });

app.get("/secrets", function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.render("login");
    } 
});

app.get("/logout", function(req,res){
    req.logOut(); 
    res.redirect("/");     
}); 


app.listen(3000, function(){
    console.log("Server started on port 3000");
});
