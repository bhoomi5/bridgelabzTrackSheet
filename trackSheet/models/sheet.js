
const mongoose = require("mongoose");
//schema is class in mongoose framework

/** create schema with fields have type  */

let sheetSchema = new mongoose.Schema({
	technologyName: {
		type: String, 
		// require:true,
		validator: "isAlpha",
		// required: [true, "Empty Technology Field is not allowed"],  
	},
	stage:{
		type:String
	},
	weeks:{
		type:String
	},
	tasks:{
		type:String
	},
	userId:{
		type:String,
		require:true
	}
	
}, {
	timestamps: true
});

/** register the schema */
let sheetCollection = mongoose.model("sheetCollection", sheetSchema);
module.exports= sheetCollection ;