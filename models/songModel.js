const validateInput = require('../helpers/validateInput');
const mysql = require("mysql2/promise");
const logger = require("../logger");
const mainModel = require('../models/mainModel');
let connection = mainModel.getConnection();

/**
 * Add a song to the database of songs.
 * @param {*} name Name of the song.
 * @param {*} artist Name of the artist of the song.
 * @param {*} genre Genre of the song.
 * @param {*} eventId Id of the event that the song belongs to.
 * @returns Song object if successful, null otherwise.
 */
 async function addSong(name, artist, genre, eventId) {
    if (!validateInput.isValidSong(name, artist, genre)) {
        logger.info("Invalid input.")
        throw new InvalidInputError();
    }

    connection = mainModel.getConnection();

    const sqlQuery =  "INSERT INTO song(Name, Artist, Genre, EventId) VALUES ('"+name+"', '"+artist+"', '"+genre+"', "+eventId+");";

    await connection.execute(sqlQuery).then(logger.info("Song named '" + name + "' of genre '"+genre+"' by artist named '" + artist
     + "' has been added.")).catch(error => {throw new SystemError()});

    return {name, artist, genre};
}

/**
 * Delete specified song from database.
 * @param {*} songId Id of the song to be deleted.
 */
async function deleteSong(songId) {
    connection = mainModel.getConnection();

    const sqlQuery = "DELETE FROM song WHERE SongId='"+songId+"';";

    await connection.execute(sqlQuery).then(logger.info("Song  #" + songId + " has been deleted.")).catch(error => {throw new SystemError()});
}

/**
 * Replace a song in the database by another song.
 * Assumption: all new info is provided.
 * @param {*} songId Id of the song to update.
 * @param {*} newName New name of the song.
 * @param {*} newArtist New name of the artist of the song.
 * @param {*} newGenre New genre of the songs.
 */
async function updateSong(songId, newName, newArtist, newGenre) {
    if (!validateInput.isValidSong(newName, newArtist, newGenre)) {
        logger.info("Invalid input for new song info.")
        throw new InvalidInputError();
    }

    connection = mainModel.getConnection();

    const sqlQuery = "UPDATE song SET Name='"+ newName + "', Artist='"+newArtist+"', Genre='"+newGenre+"' WHERE SongId='"+songId+"';";

    await connection.execute(sqlQuery).then(logger.info("Song  #" + songId + " successfully updated to have the name '" + newName + "', genre '"+newGenre+"', and artist  '" + newArtist
    + "'.")).catch(error => {throw new SystemError()});
}

/**
 * Find all the songs the event.
 * @param {*} eventId Id of the event.
 * @returns An array of songs of the specified event.
 */
async function getAllSongs(eventId) {
    connection = mainModel.getConnection();

    const sqlQuery = "SELECT SongId, Name, Artist, Genre FROM song WHERE EventId='"+eventId+"';";

    const [rows, fields] = await connection.execute(sqlQuery).then(logger.info("Songs of event '" + eventId + "' found.")).catch(error => {throw new SystemError()});

    return rows;
}

/**
 * Class for user error.
 */
 class InvalidInputError extends Error {
}

/**
 * Class for system error.
 */
class SystemError extends Error {
}

/**
 * Class for invalid id error.
 */
class InvalidIdError extends Error {
}

module.exports = {
    addSong,
    deleteSong,
    updateSong,
    getAllSongs,
    InvalidInputError,
    SystemError,
    InvalidIdError
}