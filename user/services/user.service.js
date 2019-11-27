"use strict";
require("dotenv").config();
const DbService = require("moleculer-db");
const MongooseAdapter = require("moleculer-db-adapter-mongoose");
const userCollection = require("../models/note");
const { MoleculerError } = require("moleculer").Errors;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
module.exports = {
	name: "users",
	mixins: [DbService],
	adapter: new MongooseAdapter("mongodb://localhost/userDb"),
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
						return userCollection.findOne({ email: ctx.params.userDetails.email })
							.then((user) => {
								if (user != null) {
									return Promise.reject(new MoleculerError("User is already exist!", 422, "", [{ field: "email", message: "is already exist" }]));
								}
							});
					}).then(() => {
						let userDetail = new userCollection({
							"firstName": entity.firstName,
							"lastName": entity.lastName,
							"email": entity.email,
							"password": bcrypt.hashSync(entity.password, 10)
						});
						userDetail.save().then((savedDetails) => {
							this.logger.info("Registration Done Successfully", savedDetails);
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
					userCollection.findOne({ email: email })
						.then((user) => {
							this.logger.info("user", user);
							if (user == null) {
								reject(new MoleculerError("User is not registered!", 422, "", [{ field: "email", message: "is not regestered user" }]));
							}
							else {
								bcrypt.compare(password, user.password, (err) => {
									if (err) {
										this.logger.info("bycrypt==>error", err);
									}
									else {
										let response = {
											"_id": user._id,
											"firstName": user.firstName,
											"lastName": user.lastName,
											"email": user.email
										};
										this.logger.info("login successfully...", response);
										let payload = {
											email: user.email,
											_id: user._id
										};
										let token = this.generateJWT(payload);
										resolve({ message: "successfully logged In", userDetails: response, token: token });
									}
								});
							}
						}).catch((err) => {
							this.logger.info(err);
						});
				}).catch((err) => {
					this.logger.Errors(err);
				});
			},
			/**
	 * Events
	 */
		},
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
		verifyToken(token) {
			return jwt.verify(token, this.settings.JWT_SECRET);
		}
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