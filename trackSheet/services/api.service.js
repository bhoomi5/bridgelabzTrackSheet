"use strict";

const ApiGateway = require("moleculer-web");

module.exports = {
	name: "api",
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 3000,

		routes: [{
			path: "/api",
			authorization: true,
			whitelist: [
				// Access to any actions in all services under "/api" URL
				"**"
			],
			aliases: {
				"POST /addTechnology":"sheet.addTechnology",
				"POST /addStage":"sheet.addStage",
				"POST /addWeeks":"sheet.addWeeks",
				"POST /addTasks":"sheet.addTasks",
				"POST /addStageToTechnology":"sheet.addStageToTechnology",
				"POST /addWeekToStage":"sheet.addWeeksToStage",
				"POST /addTasksToWeeks":"sheet.addTasksToWeeks",
				"POST /getTrackSheet":"sheet.getTrackSheet"
			},
			cors: true,
			bodyParsers: {
				json: {
					strict: false
				},
				urlencoded: {
					extended: false
				}
			}
		}],

		// Serve assets from "public" folder
		assets: {
			folder: "public"
		}
	},
	methods: {
		authorize(ctx, route, req) {
			return new Promise((resolve,reject)=>{
				let token = req.headers.token;
				if (token) {
					// Verify JWT token
					ctx.call("users.verifyToken", { token })
						.then(user => {
							if (user) {
								ctx.meta.user = user;
								resolve(ctx);
							}
							else{
								this.logger.info("hello");
								reject({message:"credential does not match"});
							}
						}).catch(err => {
							// Ignored because we continue processing if user is not exist
							this.logger.info(err);
							reject(err); 
							return null;
						});
				}
				else{
					reject({message:"Authentication Issue:"});
				}
			});
		}
	}
};
