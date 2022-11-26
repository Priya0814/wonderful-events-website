const mysql = require("mysql2/promise");
const logger = require("../logger");
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

var connection;

/**
 * Initialize the connection to the wonder events database.
 * @param {*} dbname Database to connect to.
 * @param {*} reset Drop existing tables if true, don't drop otherwise.
 */
async function initialize(dbname, reset) {
    connection = await mysql.createConnection({
        host: 'localhost', 
        user: 'root',
        port: '4242',
        password: 'tatltuae',
        database: dbname
    });

    if (reset) {
        let dropQuery = "DROP TABLE IF EXISTS song;";
        await connection.execute(dropQuery).then(logger.info("song table dropped"));
        dropQuery = "DROP TABLE IF EXISTS guest;";
        await connection.execute(dropQuery).then(logger.info("guest table dropped"));
        dropQuery = "DROP TABLE IF EXISTS meal;";
        await connection.execute(dropQuery).then(logger.info("meal table dropped"));
        dropQuery = "DROP TABLE IF EXISTS event;";
        await connection.execute(dropQuery).then(logger.info("event table dropped"));
        dropQuery = "DROP TABLE IF EXISTS user;";
        await connection.execute(dropQuery).then(logger.info("user table dropped"));
    }

    let sqlQuery = "CREATE TABLE IF NOT EXISTS user(UserId INTEGER PRIMARY KEY AUTO_INCREMENT, Username VARCHAR(100), Password VARCHAR(100));";   
    await connection.execute(sqlQuery).then(logger.info("User table created/exists"));
    sqlQuery = "CREATE TABLE IF NOT EXISTS event(EventId INTEGER PRIMARY KEY AUTO_INCREMENT, Name VARCHAR(100), Date DATE, Location VARCHAR(100), UserId INTEGER, FOREIGN KEY(UserId) REFERENCES user(UserId));"
    await connection.execute(sqlQuery).then(logger.info("Event table created/exists"));
    sqlQuery = "CREATE TABLE IF NOT EXISTS meal(MealId INTEGER PRIMARY KEY AUTO_INCREMENT, Main VARCHAR(100), Drink VARCHAR(100), Vegan BOOLEAN, EventId INTEGER, FOREIGN KEY(EventId) REFERENCES event(EventId));";
    await connection.execute(sqlQuery).then(logger.info("Meal table created/exists"));
    sqlQuery = "CREATE TABLE IF NOT EXISTS guest(GuestId INTEGER PRIMARY KEY AUTO_INCREMENT, Name VARCHAR(100), EventId INTEGER, MealId INTEGER, FOREIGN KEY(MealId) REFERENCES meal(MealId), FOREIGN KEY(EventId) REFERENCES event(EventId));";
    await connection.execute(sqlQuery).then(logger.info("Guest table created/exists"));
    sqlQuery = "CREATE TABLE IF NOT EXISTS song(SongId INTEGER PRIMARY KEY AUTO_INCREMENT, Name VARCHAR(50), Artist VARCHAR(50), Genre VARCHAR(50), EventId INTEGER, FOREIGN KEY(EventId) REFERENCES event(EventId));";
    await connection.execute(sqlQuery).then(logger.info("Song table created/exists"));

}

/**
 * Public access to the database connection.
 * @returns The connection to the database.
 */
function getConnection(){
    return connection;
}

/**
 * Class for system error.
 */
class SystemError extends Error {
}

module.exports = {
    initialize,
    getConnection,
    SystemError
}