
const mongoose = require("mongoose");
//schema is class in mongoose framework

/** create schema with fields have type  */

let userSchema = new mongoose.Schema({
	firstName: {
		type: String, 
		min: 4, 
		max: 10,
		validator: "isAlphanumeric",
		required: [true, "Empty firstName are not allowed"],  
	},
	lastName: {
		type: String, 
		min: 4, 
		max: 10,
		validator: "isAlphanumeric",
		required: [true, "Empty firstName are not allowed"], 
	},
	email: {
		unique:true,
		type: String,
		trim: true,
		lowercase: true,
		required: "Email address is required",
		// validate: [validateEmail, 'Please fill a valid email address'],
	},
	password: {
		type: String,
		required: [true, "Empty password are not allowed"],
		min: 6, 
		max: 12,
	},
	stage:{
		type:String
	},
	isVerified:{
		type:Boolean,
		default:false
	},
	imageUrl: {
		type: String,
	},
}, {
	timestamps: true
});

/** register the schema */
let userCollection = mongoose.model("userCollection", userSchema);
module.exports.user= userCollection ;