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

# Requests

## POST /login

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
| code: 401, message | You are already logged in, or, you have been logged out. |
| code: 403, message | The account is banned, or, you have been IP banned. |
| code: 404, message | The account you\'re attempting to log in as, does not exist. |
| code: 200, message, account | You are logged in as debug user. |
| code: 200, id, account | You are logged in. |

## POST /logout

No query parameters

No body

| Returns | Case |
|---------|------|
| code: 401, message | You have been logged out (because the password changed). |
| code: 403, message | You don\'t have permission to do this, or, you have been banned, or, you have been IP banned. |
| code: 200, message | You have been logged out. |

## GET /me

No query parameters

No body

| Returns | Case |
|---------|------|
| code: 401, message | You have been logged out (because the password changed). |
| code: 403, message | You don\'t have permission to do this, or, you have been banned, or, you have been IP banned. |
| code: 200, id, account | You get the account id, and account information. |

## POST /register/token

No query parameters

Body formatted as
```
{
    email: String,
    role: Number (Optional)
}
```

Email will be sent to the given email address, with a link to register on the website.
Role :
    - if defaultRole is set, and you are not logged in, can\'t be entered, will be set to defaultRole
    - if you are logged in, rolesCreateRoles of your role must contain the role you given, or will be set to the first value, if you didn\'t set any
    - DebugUser can set any role

| Returns | Case |
|---------|------|
| code: 400, message | Non-logged in users can\'t create accounts, or, The register request was already sent recently. |
| code: 401, message | InstantRegistration is true, or, You have been logged out because the password of your account got changed. |
| code: 403, message | You are not allowed to create an account, or an account with set role in body, or, Your account was banned, or, Your IP address got banned |
| code: 200, message | The register request got sent successfully. |

## POST /register/valid

No query parameters

Body formatted as
```
{
    token: String
}
```

Where token is the token found inside the link, given in the email sent by POST /register/token

| Returns | Case |
|---------|------|
| code: 401, message | InstantRegistration is on, You are logged in (if loginAfterRegister is true and you are logged in) or, You have been logged out because the password got changed (if you are logged in), or, The token has expired, or, The token was used |
| code: 403, message | Your account was banned (if loginAfterRegister is false, and you are logged in), or, Your IP address got banned |
| code: 404, message | The token never was issued by the server. |
| code: 200, message | The token is valid. |

## POST /register/final

No query parameters

Body formatted as
```
{
    token: String,
    username: String,
    password: String
}
```

Where token is the token found inside the link, given in the email sent by POST /register/token
Username, for the account, in plain-text
And password, also in plain-text. Will be passed through the password method

| Returns | Case |
|---------|------|
| code: 500, message | Either you set instantRegistration true, and no defaultValue, or, some other server error |
| code: 401, message | You are logged in (if loginAfterRegister is true and you are logged in) or, You have been logged out because the password got changed (if you are logged in), or, The token has expired, or, The token was used |
| code: 403, message | Your account was banned (if you are logged in), or, Your IP address got banned |
| code: 404, message | The token you had provided, never existed. |
| code: 200, message (and maybe account, if loginAfterRegister is true) | You have successfully registered an account. |
