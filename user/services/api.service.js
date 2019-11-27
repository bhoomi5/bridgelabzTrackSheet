"use strict";

const ApiGateway = require("moleculer-web");
// const users = require('./greeter.service');
module.exports = {
	name: "api",
	mixins: [ApiGateway],
	settings: {
		port: process.env.PORT || 4000,
		routes: [{
			path: "/api",
			// authorization:true,
			whitelist: [
				// Access to any actions in all services under "/api" URL
				"**"
			],
			aliases:{
				"POST /users":"users.userRegistration",
				"POST /login":"users.userLogin",
				"POST /tokenVerification":"users.verifyToken"
			}
		}],

		// Serve assets from "public" folder
		assets: {
			folder: "public"
		}
	}
};
