require("dotenv").config(); // Define Environment variables

const mongoose = require("mongoose");

const express = require("express");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption"); // Must see documentation https://www.npmjs.com/package/mongoose-encryption

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

// Encryption key
const secret = process.env.SECRET;
// Set the plugin into the mongoose schema and encrypt certain fields
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password'/*, ...*/]});


const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.route("/login")
    .get(function(req, res){
        res.render("login");
    })

    .post(function(req,res){
        const username = req.body.username;
        const password = req.body.password;
        // Automatically mongoose-encrypt will decrypt the password field
        User.findOne({email: username}, (err, foundUser)=>{
            if(!err){
                if(foundUser){
                    if(foundUser.password === password){
                        res.render("secrets");
                    }
                }else{
                    res.send("Incorrect username and/or password, try again");
                }
            }else{
                console.log(err);
                res.send("Error please try again later");
            }
        })
    })

app.route("/register")
    .get(function(req, res){
        res.render("register");
    })
    
    .post(function(req,res){
        const newUser = new User ({
            email: req.body.username,
            password: req.body.password,
        });
        // Automatically mongoose-encrypt will encrypt the password field
        newUser.save(function(err){
            !err ? res.render("secrets") : console.log(err);
        });
    })





app.listen(3000, function(){
    console.log("Server started on port 3000");
});
