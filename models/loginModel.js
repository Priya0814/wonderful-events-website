const validateInput = require('../helpers/validateInput');
const mysql = require("mysql2/promise");
const logger = require("../logger");
const mainModel = require('../models/mainModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;
let connection = mainModel.getConnection();

/**
 * Create a user in the database.
 * @param {*} username The username of the user to create.
 * @param {*} password The password of the user to create.
 * @returns The user id of the newly created user.
 */
async function signUp(username, password) {
    connection = mainModel.getConnection();
    if(!validateInput.isValidUsername(username)) {
        logger.info("Username is invalid.");
        throw new InvalidUsernameError();
    }
    if(!validateInput.isValidPassword(password)) {
        logger.info("Password is invalid.");
        throw new InvalidPasswordError();
    }

    const sqlQuery = "SELECT Username FROM user WHERE Username='"+username+"';";

    const [rows, fields] = await connection.execute(sqlQuery)
    .then(logger.info("User retrieved."))
    .catch(error => {console.log(error); throw new SystemError();});

    if (rows.length > 0){
        logger.info("Username is taken.");
        throw new UsernameTakenError();
    }

    let hashpassword = await bcrypt.hash(password, saltRounds);

    const sqlQuerySignup = "INSERT INTO user (Username, Password) VALUES ('"+username+"','"+hashpassword+"');";
    await connection.execute(sqlQuerySignup).then(logger.info("User '"+username+"' with password '"+password+"' successfully added.")).catch(error => {throw new SystemError();});

    return await signIn(username, password);
}

/**
 * Sign in a user (by checking that their password matches).
 * @param {*} username The username of the user to be signed in.
 * @param {*} password The password of the user to be signed in.
 * @returns The user id of signed in user.
 */
async function signIn(username, password) {
    connection = mainModel.getConnection();

    if(!validateInput.isValidUsername(username)) {
        logger.info("Username is invalid.");
        throw new InvalidUsernameError();
    }
    if(!validateInput.isValidPassword(password)) {
        logger.info("Password is invalid.");
        throw new InvalidPasswordError();
    }

    const sqlQuery = "SELECT UserId, Username, Password FROM user WHERE Username='"+username+"';";

    const [rows, fields] = await connection.execute(sqlQuery).then(logger.info("User retrieved.")).catch(error => {throw new SystemError();});

    if (rows.length == 0){
        logger.info("Username not found.");
        throw new InvalidUsernameError();
    }

    if (await bcrypt.compare(password, rows[0].Password)){
        return rows[0].UserId;
    }
    else {
        logger.info("Password is incorrect.");
        throw new InvalidPasswordError();
    }
}

/**
 * Class for invalid username error.
 */
 class InvalidUsernameError extends Error {
}

/**
 * Class for invalid password error.
 */
class InvalidPasswordError extends Error {
}

/**
 * Class for taken username error.
 */
class UsernameTakenError extends Error {
}

/**
 * Class for system error.
 */
class SystemError extends Error {
}

module.exports = {
    signIn,
    signUp,
    InvalidUsernameError,
    InvalidPasswordError,
    UsernameTakenError,
    SystemError
}