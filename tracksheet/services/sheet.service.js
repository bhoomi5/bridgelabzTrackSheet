"use strict";
// require("dotenv").config();
const DbService = require("moleculer-db");
const MongooseAdapter = require("moleculer-db-adapter-mongoose");
const sheetCollection = require("../models/sheet");
// const userModel = require("../../user/models/note");
const technologyCollection = sheetCollection.tech;
const stageCollection = sheetCollection.stage;
const weekCollection = sheetCollection.week;
const taskCollection = sheetCollection.task;
// const redis = require("redis");
// const redisClient = redis.createClient({ host: "Redis", port: 6379 });

// const userCollection = userModel.user;

// const { MoleculerError } = require("moleculer").Errors;
module.exports = {
	name: "sheet",
	mixins: [DbService],
	adapter: new MongooseAdapter("mongodb://mongo/trackSheetDb"),
	model: sheetCollection,
	/**
	 * Service settings
	 */
	settings: {
		entityValidator: {
			technologyName: { type: "string", validator: "isAlphanumeric" },
			stageId: { type: "string", validator: "isAlphanumeric" },
			weekId: { type: "number", validator: "isAlphanumeric" },
			taskId: { type: "string", validator: "isAlphanumeric" },
			userId: { type: "string", validator: "isAlphanumeric" }
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
					const sheetDetail = new technologyCollection({
						"technologyName": entity.technologyName,
						"userId": "5de8e9d88fa4b31fb5341c89"
					});
					sheetDetail.save().then((savedDetails) => {
						this.logger.info(" Done Successfully", savedDetails);
						resolve({ message: "successfully added technology", Details: sheetDetail });
					});
				}).catch((err) => {
					this.logger.info(err);
				});
			},
		},
		addStage: {
			params: {
				stageDetails: {
					type: "object", props: {
						stage: { type: "string" },
					}
				},
			},
			handler(ctx) {
				let entity = ctx.params.stageDetails;
				console.log("entity", technologyCollection);

				return new Promise((resolve) => {
					const stageDetail = new stageCollection({
						"stage": entity.stage,
						"userId": "5de8e9d88fa4b31fb5341c89"
					});
					stageDetail.save().then((savedDetails) => {
						this.logger.info("Done Successfully", savedDetails);
						resolve({ message: "successfully added stage", Details: stageDetail });
					});
				}).catch((err) => {
					this.logger.info(err);
				});
			},
		},
		addWeeks: {
			params: {
				weekDetails: {
					type: "object", props: {
						week: { type: "string" },
					}
				},
			},
			handler(ctx) {
				let entity = ctx.params.weekDetails;
				return new Promise((resolve) => {
					const weekDetail = new weekCollection({
						"week": entity.week,
						"userId": "5de8e9d88fa4b31fb5341c89"
					});
					weekDetail.save().then((savedDetails) => {
						this.logger.info("Done Successfully", savedDetails);
						resolve({ message: "successfully added stage", Details: weekDetail });
					});
				}).catch((err) => {
					this.logger.info(err);
				});
			},
		},
		addTasks: {
			params: {
				taskDetails: {
					type: "object", props: {
						task: { type: "string" },
					}
				},
			},
			handler(ctx) {
				let entity = ctx.params.taskDetails;
				return new Promise((resolve) => {
					const taskDetail = new taskCollection({
						"task": entity.task,
						"userId": "5de8e9d88fa4b31fb5341c89"
					});
					taskDetail.save().then((savedDetails) => {
						this.logger.info("Done Successfully", savedDetails);
						resolve({ message: "successfully added stage", Details: taskDetail });
					});
				}).catch((err) => {
					this.logger.info(err);
				});
			},
		},
		addStageToTechnology: {
			params: {
				Details: {
					type: "object", props: {
						stageId: { type: "string" },
						techId: { type: "string" },
						weekId: { type: "string" },
						taskId: { type: "string" }
					}
				},
			},
			handler(ctx) {
				let entity = ctx.params.Details;
				console.log("ctx", ctx.params);
				return new Promise((resolve, reject) => {
					if (entity.techId) {
						technologyCollection.find({ _id: entity.techId })
							.then((findTech) => {
								console.log("findTech", findTech);
								if (findTech.length > 0) {
									let updateQuery = { $addToSet: { "stage": entity.stageId } };
									technologyCollection.findOneAndUpdate({ "_id": entity.techId }, updateQuery, { new: true })
										.then((updateStage) => {
											console.log("updateSchema", updateStage);
											ctx.call("sheet.addWeeksToStage", {
												Details: {
													stageId: entity.stageId,
													weekId: entity.weekId
												}
											});
											ctx.call("sheet.addTasksToWeeks", {
												Details: {
													taskId: entity.taskId,
													weekId: entity.weekId
												}
											});
											resolve({ message: "successfully added stage to technology", data: updateStage });
										}).catch((err) => {
											this.logger.info(err);
										});
								}
								else {
									reject({ message: "technology not found" });
								}
							}).catch((err) => {
								this.logger.info(err);
							});
					}
				});

			},
		},
		addWeeksToStage: {
			handler(ctx) {
				let entity = ctx.params.Details;
				return new Promise((resolve, reject) => {
					if (entity.stageId) {
						stageCollection.find({ _id: entity.stageId })
							.then((findStage) => {
								console.log("findStage", findStage);
								if (findStage.length > 0) {
									let query = { "_id": entity.stageId };
									let updateQuery = { $addToSet: { "week": entity.weekId } };
									console.log("query", query, ".....", updateQuery);
									stageCollection.findOneAndUpdate(query, updateQuery, { new: true })
										.then((updateweek) => {
											console.log("updateSchema", updateweek);
											resolve({ message: "successfully added week to stage", data: updateweek });
										}).catch((err) => {
											this.logger.info(err);
										});
								}
								else {
									reject({ message: "stage not found" });
								}
							}).catch((err) => {
								this.logger.info(err);
							});
					}
				});

			},
		},
		addTasksToWeeks: {
			params: {
				Details: {
					type: "object", props: {
						taskId: { type: "string" },
						weekId: { type: "string" }
					}
				},
			},
			handler(ctx) {
				let entity = ctx.params.Details;
				return new Promise((resolve, reject) => {
					if (entity.weekId) {
						weekCollection.find({ _id: entity.weekId })
							.then((findWeek) => {
								console.log("findWeek", findWeek);
								if (findWeek.length > 0) {
									let query = { "_id": entity.weekId };
									let updateQuery = { $addToSet: { "task": entity.taskId } };
									console.log("query", query, ".....", updateQuery);
									weekCollection.findOneAndUpdate(query, updateQuery, { new: true })
										.then((updateTask) => {
											console.log("updateSchema", updateTask);
											resolve({ message: "successfully added week to stage", data: updateTask });
										}).catch((err) => {
											this.logger.info(err);
										});
								}
								else {
									reject({ message: "stage not found" });
								}
							}).catch((err) => {
								this.logger.info(err);
							});
					}
				});

			},
		},
		getTrackSheet: {
			async handler(ctx) {
				let entity = ctx.params.Details;
				let tech = await technologyCollection.find({ _id: entity.techId })
					.populate({
						path: "stage",
						populate: {
							path: "week",
							model: "weekCollection",
							populate: {
								path: "task",
								model: "taskCollection"
							}
						},
					});
				console.log("tech", tech);
				return (tech);
			},
		},
		generateTrackSheet: {
			params: {
				Details: {
					type: "object", props: {
						techId: { type: "string" },
						stageId: { type: "string" },
						weekId: { type: "string" },
						taskId: { type: "string" },
						// userId: { type: "string" }
					}
				},
			},
			async handler(ctx) {
				let entity = ctx.params.Details;
				let l = Object.keys(entity);
				if (l.length == 4) {
					let tech = await technologyCollection.find({ _id: entity.techId });
					if (tech) {
						let updateQuery = { $addToSet: { "stage": entity.stageId } };
						let stage = await technologyCollection.findOneAndUpdate({ "_id": entity.techId }, updateQuery, { new: true });
						if (stage) {
							console.log("stage", stage);
							let updateQuery = { $addToSet: { "week": entity.weekId } };
							let week = await stageCollection.findOneAndUpdate({ "_id": stage.stage[0] }, updateQuery, { new: true });
							if (week) {
								console.log("week", week);
								let updateQuery = { $addToSet: { "task": entity.taskId } };
								let task = await weekCollection.findOneAndUpdate({ "_id": week.week[0] }, updateQuery, { new: true });
								if (task) {
									return ({ message: "tracksheet generated successfully" });
								}
								else {
									return ({ message: "tracksheet has not generated successfully" });
								}
							}
							else {
								return ({ message: "weekid is not present" });
							}
						}
						else {
							return ({ message: "stageid is not present" });
						}
					}
					else {
						return ({ message: "wrong technology" });
					}
				}
				else {
					return ({ message: "unsufficient parameter" });
				}
			},
		},
	},

	/**
 * Events
 */
	// events: {
	// },
	// /**
	//  * Methods
	//  */
	// methods: {
	// 	/**
	// 	 * Generate a JWT token from user entity
	// 	 * 
	// 	 * @param {Object} user 
	// 	 */
	// },

};