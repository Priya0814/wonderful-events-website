const validator = require('validator');

const minimumPasswordLength = 8;

/**
 * Make sure the username is valid.
 * @param {*} username Username.
 * @returns True if valid, false otherwise.
 */
function isValidUsername(username) {
    return ((typeof username === 'string') && username && validator.isAscii(username));
}

/**
 * Make sure the password is valid.
 * @param {*} password Password.
 * @returns True if valid, false otherwise.
 */
function isValidPassword(password) {
    return ((typeof password === 'string') && password
    && validator.isAscii(password) && password.length >= minimumPasswordLength)
}

const validGenres = ["rock", "rap", "pop", "country", "classical", "indie", "meme", "blues", "punk"];

/**
 * Make sure the name of song, its artist, and the genre are all valid.
 * @param {*} name Name of the song.
 * @param {*} artist Name of the artist.
 * @param {*} genre Genre of the song.
 * @returns true if valid, false otherwise.
 */
function isValidSong(name, artist, genre) {
    return ((typeof artist === 'string') && name && artist 
    && validator.isAscii(name) && validator.isAscii(artist) 
    && validGenres.includes(genre.toLowerCase()));
}

module.exports = {
    isValidUsername,
    isValidPassword,
    isValidSong
}