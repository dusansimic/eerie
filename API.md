# Config

| Option | Optional | Type | Values |
|--------|----------|------|--------|
| debug  |    no    |Boolean| true -> Enables debug mode|
| secret |    no    |String| whatever you put -> Keyword used to encrypt tokens.|
| options.instantRegistration | yes |Boolean| if true, disables POST /register/token and POST /register/valid, and creates account directly in POST /register/final, without emails, and role as defaultValue |
| options.passwordMethod | no |String| SHA256, bcrypt |
| options.loginAfterRegister |no|Boolean| true -> requires to be logged out for POST /register/valid and POST /register/final |
| options.time.registerTokenTime |no|Number| Time in minutes for how much register token is valid for.  |
| options.time.registerRepeatTime |no|Number| Time in minutes for how often can a register email be sent/resent. |
| options.time.passwordTokenTime |no|Number| Time in minutes for how much password register token is valid for.  |
| options.time.passwordRepeatTime |no|Number| Time in minutes for how often can a reset password email be sent/resent. |
| options.roles.defaultValue | required only if options.instantRegistration is true | Number | The default Role for account created when instantRegistration is on |
| options.roles.adminRoles | no | Array of numbers | Array that contains all roles that have access to admin requests |
| options.roles.rolesCreateRoles | not necessary if instantRegistration is true  | Object | Object's fields represent with which account role you can create accounts with which roles. Object fields need to be numbers, and values need to be arrays of numbers. The first one is the default for that creating role, if when register is initiated, and a role isn't specified. |
| sequelizeConfig | no |Object| config like you would write for sequelize |
| redisConfig | no |Object| config like you would write for ioreds |
| nodemailerConfig | no | Object | config like you would write for nodemailer |

# POST /login

No query parameters

Body formatted as
```
{
    identification: String,
    password: String
}
```

Identification is String that contains either the username or email of account.
Password can be either plain text, or hashed password (if you use a hashing passwordMethod like 'SHA256') as the account password.

| Returns | Case |
|---------|------|
| code: 400, message | The password you entered is not correct. |
| code: 401, message | You are already logged in. |
| code: 403, message | The account is banned. |
| code: 404, message | The account you\'re attempting to log in as, does not exist. |
| code: 200, message, account | You are logged in as debug user. |
| code: 200, id, account | You are logged in. |

