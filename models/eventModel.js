const validateInput = require('../helpers/validateInput');
const mysql = require("mysql2/promise");
const logger = require("../logger");
const mainModel = require('../models/mainModel');
let connection = mainModel.getConnection();


/**
 * Create an event in the database.
 * @param {*} name Name of the event.
 * @param {*} date Date of the event.
 * @param {*} location Location of the event.
 * @param {*} userId The id of the user whose event is being created.
 */
async function createEvent(name, date, location, userId){
    connection = mainModel.getConnection();

    if (!name || !date || !location || !userId){
        logger.info("Invalid input.");
        throw new InvalidInputError();
    }
    
    const sqlQuery = "INSERT INTO event (Name, Date, Location, UserId) VALUES ('" + name + "','" + date + "','" + location +"', " + userId +");";
    await connection.execute(sqlQuery).then(logger.info("Event '"+name+"' successfully added.")).catch(error => {throw new InvalidInputError()});
}

/**
 * Delete an event from the database.
 * @param {*} eventId Id of the event to be deleted.
 */
 async function deleteEvent(eventId){
    connection = mainModel.getConnection();

    let sqlQuery = "DELETE FROM song WHERE eventId='"+eventId+"';";

    await connection.execute(sqlQuery).then(logger.info("Songs for event #"+eventId+" have been deleted.")).catch(error=>{throw new InvalidInputError()});

    sqlQuery = "DELETE FROM guest WHERE eventId='"+eventId+"';";

    await connection.execute(sqlQuery).then(logger.info("Guests for event #"+eventId+" have been deleted.")).catch(error=>{throw new InvalidInputError()});

    sqlQuery = "DELETE FROM meal WHERE eventId='"+eventId+"';";

    await connection.execute(sqlQuery).then(logger.info("Meals for event #"+eventId+" has been deleted.")).catch(error=>{throw new InvalidInputError()});

    sqlQuery = "DELETE FROM event WHERE eventId='"+eventId+"';";

    await connection.execute(sqlQuery).then(logger.info("Event "+eventId+" has been deleted.")).catch(error=>{throw new InvalidInputError()});
}


/**
 * Update event information.
 * @param {*} eventId The id of the event that is to be updated.
 * @param {*} newName The new name of the event.
 * @param {*} newDate The new date of the event.
 * @param {*} newLocation The new location of the event.
 */
async function updateEvent(eventId, newName, newDate, newLocation){
    connection = mainModel.getConnection();

    if (!newName || !newDate || !newLocation){
        logger.info("Invalid input.");
        throw new InvalidInputError();
    }

    const sqlQuery = "UPDATE event SET Name='"+ newName + "', Date='"+newDate+"', Location='"+newLocation+"' WHERE EventId='"+eventId+"';";

    await connection.execute(sqlQuery).then(logger.info("Successfully updated event #"+eventId+".")).catch(error=>{throw new InvalidInputError()});
}


/**
 * Retrieve all the events for the user.
 * @param {*} userId The id of the user whose events are going to be retrieved.
 * @returns An array of events.
 */
async function getAllEvents(userId){
    connection = mainModel.getConnection();

    if (userId == null){
        logger.info("User id is not set.");
        throw new InvalidInputError();
    }

    const sqlQuery = "SELECT EventId, Name, Date, Location FROM event WHERE UserId='"+userId+"';";

    const [rows, fields] = await connection.execute(sqlQuery).then(logger.info("User retrieved."));

    return rows;
}

/**
 * Class for invalid user input.
 */
class InvalidInputError extends Error {
}

module.exports = {
    InvalidInputError,
    createEvent,
    getAllEvents,
    deleteEvent,
    updateEvent,
}