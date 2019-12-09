"use strict";
require("dotenv").config();
const DbService = require("moleculer-db");
const MongooseAdapter = require("moleculer-db-adapter-mongoose");
const userCollection = require("../models/user");
const { MoleculerError } = require("moleculer").Errors;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const redis = require("redis");
// const redisClient = redis.createClient({ host: "localhost", port: 6379 });
// redisClient.on("connected", () => {
// 	this.logger.info("Redis Client Is Connected ");
// }).on("error", (err) => {
// 	this.logger.error("Redis Client Is Disconnected Due To Some Error " + err);
// 	process.exit();
// });
module.exports = {
	name: "users",
	mixins: [DbService],
	adapter: new MongooseAdapter("mongodb://mongo/trackSheetDb"),
	model: userCollection,
	/**
	 * Service settings
	 */
	settings: {
		JWT_SECRET: process.env.JWT_SECRET,

		entityValidator: {
			firstName: { type: "string", validator: "isAlphanumeric" },
			lastName: { type: "string", validator: "isAlphanumeric" },
			email: { type: "email" },
			password: { type: "string", min: 6, max: 10 },
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
		userRegistration: {
			params: {
				userDetails: {
					type: "object", props: {
						firstName: { type: "string" },
						lastName: { type: "string" },
						email: { type: "string" },
						password: { type: "string" }
					}
				},
			},
			handler(ctx) {
				let entity = ctx.params.userDetails;
				return this.validateEntity(entity)
					.then(() => {
						return userCollection.user.findOne({ email: ctx.params.userDetails.email })
							.then((user) => {
								if (user != null) {
									return Promise.reject(new MoleculerError("User is already exist!", 422, "", [{ field: "email", message: "is already exist" }]));
								}
							});
					}).then(() => {
						let userDetail = new userCollection.user({
							"firstName": entity.firstName,
							"lastName": entity.lastName,
							"email": entity.email,
							"password": bcrypt.hashSync(entity.password, 10)
						});
						userDetail.save().then((savedDetails) => {
							this.logger.info("Registration Done Successfully", savedDetails);
							return Promise.resolve({message:"registration successfully Done",data:userDetail});
						});
					});
			},
		},
		userLogin: {
			params: {
				userLoginDetails: {
					type: "object", props: {
						email: { type: "string" },
						password: { type: "string" }
					}
				},
			},
			handler(ctx) {
				let { email, password } = ctx.params.userLoginDetails;
			
				return new Promise((resolve, reject) => {
					userCollection.user.find({ email: email })
						.then((user) => {
							console.log("count", user);

							this.logger.info("user", user);
							if (user == null) {
								reject(new MoleculerError("User is not registered!", 422, "", [{ field: "email", message: "is not regestered user" }]));
							}
							else {
								bcrypt.compare(password, user[0].password, (err) => {
									if (err) {
										this.logger.info("bycrypt==>error", err);
									}
									else {
										let response = {
											"_id": user[0]._id,
											"firstName": user[0].firstName,
											"lastName": user[0].lastName,
											"email": user[0].email
										};
										this.logger.info("login successfully...", response);
										let payload = {
											email: user[0].email,
											_id: user[0]._id
										};
										let token = this.generateJWT(payload);
										// let key = user[0]._id;
										// let field = "token";
										// let value = token;
										// let status="status";
										// let statusValue=true;
										// redisClient.hmset(key, field, value,status,statusValue);
										resolve({ message: "successfully logged In", userDetails: response, token: token });
									}
								});
							}
						}).catch((err) => {
							this.logger.info(err);
						});
				}).catch((err) => {
					this.logger.info(err);
				});
			},
		},
		verifyToken: {
			handler(ctx) {
				return new Promise((resolve, reject) => {
					jwt.verify(ctx.params.token, this.settings.JWT_SECRET, (err, decoded) => {
						if (err)
							reject({ error: "credential doesn't match" });
						else
							resolve(decoded);
					});
				});
			}
		},

	},
	/**
	 * Events
	 */

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
		generateJWT(payload) {
			const today = new Date();
			const exp = new Date(today);
			exp.setDate(today.getDate() + 60);
			return jwt.sign({
				id: payload._id,
				email: payload.email,
				exp: Math.floor(exp.getTime() / 1000)
			}, this.settings.JWT_SECRET);
		},

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