const jwt = require('jsonwebtoken');
const HttpError = require('../http-error');
const RegisterRequest = require('../../data/register-request');

module.exports = (methods, config) => {
	/*
		Config map
		roles: {
			defaultRole,
			adminRoles,
			rolesCreateRoles
		}
		'DefaultRole' is the role set when an account is created by non-logged-in user
		*IMPORTANT* if there is no defaultRole, non-logged-in users can't create accounts
		'AdminRoles' are just roles that will have access to admin functions
		Will default to [666] if nothing gets set
		'RolesCreateRoles' only serves for logged-in users registering new accounts
	 */

	return async (req, res, next) => {
		try {
			/*
				The config has data, on which roles can create tokens at all.
				And on which roles can create which roles.
				Check right away, if non-logged-in users are at all able to create accounts.
			 */

			if (config.options.instantRegistration) {
				return next({code: 401, message: 'Instant Registration is on, no tokens.'});
			}

			const data = {};

			/*
				Part where we find out the role of the new account.
			 */
			if (req.account) {
				if (config.isDebugUser(req.account.id, req.account.password)) {
					data.role = req.body.role || 0;
				} else {
					const {role} = req.account;
					const roles = config.options.roles.rolesCreateRoles[role];

					if (!roles) {
						return next({code: 403, message: 'You are not permitted to create an account!'});
					}

					if (req.body.role) {
						data.role = req.body.role;
					} else {
						data.role = roles[0];
					}

					if (!roles.includes(data.role)) {
						return next({
							code: 403,
							message: 'You are not permitted to create an account with that role!'
						});
					}
				}
			} else {
				if (!config.options.roles.defaultRole) {
					throw new HttpError('Non-logged in users can\'t create accounts!', 400);
				}

				data.role = config.options.roles.defaultRole;
			}

			/*
				We need to look up the already existing requests.
				If there is one, check if it was sent in last X minutes. If yes, say boohoo.
				If no, send it again.
				If there is no one, create a new one, record it in the database, and send it.
			 */
			const requests = await methods.registerRequests.findByEmail(req.body.email);
			const request = requests[0] ? requests[0].dataValues : null;
			const now = new Date();

			if (request && !request.used && (request.dateCreation < now && now < request.dateExpiry)) {
				const seconds = (now - request.dateLastSent) / 1000;
				/*
					This is if there already is one that still hasn't expired.
				 */
				if (!(seconds > (config.options.time.registerRepeatTime * 60))) {
					return res.status(400).send({
						message: 'You already sent a request in past ' + config.options.time.registerRepeatTime + ' minutes.'
					});
				}

				/*
					We update the one already existing, and send it.
				 */

				requests[0].dateLastSent = new Date();
				await methods.registerRequests.update(requests[0]);

				const email = await config.nodemailer.sendMail({
					to: request.email,
					subject: 'Account registration',
					template: 'register',
					ctx: {
						email: request.email,
						link: 'http://' + (req.headers.origin || request.ip) + '/register?token=' + request.token
					}
				});

				if (!email.accepted.includes(request.email)) {
					return res.status(400).send({
						message: 'Email wasn\'t sent.'
					});
				}

				return res.status(200).send({
					message: 'Successfully sent an email.'
				});
			}

			/*
				Creation of a new request. We need a new token.
			 */
			data.email = req.body.email;

			/*
				We need a check, if the email already has account about it.
			 */
			const account = await methods.account.findByIdentification(req.body.email);
			if (account) {
				return res.status(400).send({
					message: 'There already is an account with that email address.'
				});
			}

			data.ip = req.ip;
			if (data.ip.lastIndexOf(':') !== -1) {
				data.ip = data.ip.substring(data.ip.lastIndexOf(':') + 1);
			}

			data.dateCreation = new Date();
			data.dateExpiry = new Date(Date.now() + (1000 * 60 * config.options.time.registerTokenTime));
			data.dateLastSent = new Date();

			const token = jwt.sign({
				role: data.role,
				email: data.email,
				ip: data.ip,
				dateCreation: data.dateCreation,
				dateExpiry: data.dateExpiry
			}, config.secret);
			data.token = token;

			await methods.registerRequests.create(RegisterRequest.createFromObject(data));

			/*
				And sending the email.
			 */
			const email = await config.nodemailer.sendMail({
				to: req.body.email,
				subject: 'Account registration',
				template: 'register',
				ctx: {
					email: req.body.email,
					link: 'http://' + (req.headers.origin || data.ip) + '/register?token=' + token
				}
			});

			if (!email.accepted.includes(req.body.email)) {
				return res.status(400).send({
					message: 'Email wasn\'t sent.'
				});
			}

			return res.status(200).send({
				message: 'Successfully sent an email.'
			});
		} catch (error) {
			if (typeof error.code === 'string') {
				error.code = 500;
			}

			return next(error);
		}
	};
};
