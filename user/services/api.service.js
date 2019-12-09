"use strict";

const ApiGateway = require("moleculer-web");
// const users = require('./greeter.service');
module.exports = {
	name: "api",
	mixins: [ApiGateway],
	settings: {
		port: process.env.PORT || 4003,
		routes: [{
			path: "/api",
			// authorization:true,
			whitelist: [
				// Access to any actions in all services under "/api" URL
				"**"
			],
			aliases:{
				"POST /registration":"users.userRegistration",
				"POST /login":"users.userLogin",
			}
		}],

		// Serve assets from "public" folder
		assets: {
			folder: "public"
		}
	}
};
