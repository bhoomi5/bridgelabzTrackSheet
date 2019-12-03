
const mongoose = require("mongoose");
//schema is class in mongoose framework

/** create schema with fields have type  */

let technologySchema = new mongoose.Schema({
	technologyName: {
		type: String,
		validator: "isAlpha"
	},
	userId: {
		type: String,
		require: true
	},
	stage: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "stageCollection"
	}]
}, {
	timestamps: true
});
let stageSchema = new mongoose.Schema({
	stage: {
		type: String,
	},
	week: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "weekCollection"
	}]
}, {
	timestamps: true
});
let weekSchema = new mongoose.Schema({
	week: {
		type: String,
		required: true
	},
	task: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "taskCollection"
	}]
}, {
	timestamps: true
});
let taskSchema = new mongoose.Schema({
	task: {
		type: String,
	}
}, {
	timestamps: true
});
/** register the schema */
let technologyCollection = mongoose.model("technologyCollection", technologySchema);
let stageCollection = mongoose.model("stageCollection", stageSchema);
let weekCollection = mongoose.model("weekCollection", weekSchema);
let taskCollection = mongoose.model("taskCollection", taskSchema);
module.exports.tech = technologyCollection;
module.exports.stage = stageCollection;
module.exports.week = weekCollection;
module.exports.task = taskCollection;