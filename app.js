require("dotenv").config(); // Define Environment variables

const mongoose = require("mongoose");

const express = require("express");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const saltRounds = 11;


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema ({
    email: {
        type: String,
        required: [true, "EMAIL IS NECESSARY"],
    },
    password: {
        type: String,
        required: [true, "PASSWORD IS NECESSARY"],
    }
});




const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.route("/login")
    .get(function(req, res){
        res.render("login");
    })

    .post(function(req,res){
        const password = req.body.password;
        const username = req.body.username;

        User.findOne({email: username}, (err, foundUser)=>{
            if(!err){
                if(foundUser){

                    bcrypt.compare(password, foundUser.password, function(error, result){
                        if(result){
                            res.render("secrets");
                        }
                    });

                }else{
                    res.send("Incorrect username and/or password, try again");
                }
            }else{
                console.log(err);
                res.send("Error please try again later");
            }
        });
        
    });

app.route("/register")
    .get(function(req, res){
        res.render("register");
    })
    
    .post(function(req,res){
        bcrypt.hash(req.body.password,saltRounds,function(error, hash){
            const newUser = new User ({
                email:  req.body.username,
                password: hash,
            });
            
            newUser.save(function(err){
                !err ? res.render("secrets") : console.log(err);
            });
        });
       
   
    });

app.listen(3000, function(){
    console.log("Server started on port 3000");
});
