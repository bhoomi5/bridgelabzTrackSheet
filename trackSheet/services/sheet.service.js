"use strict";
// require("dotenv").config();
const DbService = require("moleculer-db");
const MongooseAdapter = require("moleculer-db-adapter-mongoose");
const sheetCollection = require("../models/sheet");
// const { MoleculerError } = require("moleculer").Errors;
module.exports = {
	name: "sheet",
	mixins: [DbService],
	adapter: new MongooseAdapter("mongodb://localhost/trackSheetDb"),
	model: sheetCollection,
	/**
	 * Service settings
	 */
	settings: {
		entityValidator: {
			// technologyName: { type: "string", validator: "isAlphanumeric" },
			// userId: { type: "string" }
		}
	},
	/**
	 * Service dependencies
	 */
	dependencies: [],
	/**
	 * Actions
	 */
	actions: {
		/**
		 * Api For User Registration
		 *
		 * @param {String} name - User name
		 */
		addTechnology: {
			params: {
				techDetails: {
					type: "object", props: {
						technologyName: { type: "string" },
					}
				},
			},
			handler(ctx) {
				let entity = ctx.params.techDetails;
				return new Promise((resolve) => {
					const sheetDetail = new sheetCollection({
						"technologyName": entity.technologyName,
						"userId": ctx.meta.user.id
					});
					sheetDetail.save().then((savedDetails) => {
						this.logger.info("Registration Done Successfully", savedDetails);
						resolve({ message: "successfully added technology", Details: sheetDetail });
					});
				}).catch((err)=>{
					this.logger.info(err);
				});
			},
		},
		addStage:{
			params: {
				stageDetails: {
					type: "object", props: {
						stage: { type: "string" },
						sheetId:{type:"string"}
					}
				},
			},
			handler(ctx) {
				let entity = ctx.params.stageDetails;
				return new Promise((resolve) => {
					let ancestorpath = sheetCollection.findOne({_id:entity.sheetId});
					console.log("path",ancestorpath);
                    
					ancestorpath += "5dde5f916968195df90ad234,";
					sheetCollection.insertMany({stage:entity.stage, path:ancestorpath});
					resolve({message:"successfull"});
				});
			}
		},
		/**
	 * Events
	 */
	},
	events: {
	},
	/**
	 * Methods
	 */
	methods: {
		/**
		 * Generate a JWT token from user entity
		 * 
		 * @param {Object} user 
		 */
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {

	}
};