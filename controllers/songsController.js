const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require('../models/songModel');
const signUpController = require('../controllers/signUpController');
const eventsController = require('../controllers/eventsController');

let songIds = [];
let songsArray = [];

/**
 * Load the songs page.
 * @param {*} request Get request.
 * @param {*} response Render the mySongs view.
 */
async function songs(request, response){
    let eventId = await eventsController.getEventId(request);
    songsArray = await model.getAllSongs(eventId);
    let lang = request.cookies.language;  

    updateSongIds();

    const songsDataEnglish = {
        allSongs: songsArray,
        noSongs: songsArray.length == 0,
        isSignedIn: true,
        displayAlert: false,
        alertMessage: "",
        alertColor: ""
    };

    const songsDataFrench = {
        allSongs: songsArray,
        noSongs: songsArray.length == 0,
        isSignedIn: true,
        displayAlert: false,
        alertMessage: "",
        alertColor: ""
    };

    if (signUpController.refreshSession(request, response)) {
        if (!lang || lang === 'en') {
            response.render('songs.hbs', songsDataEnglish);
        } else {
            response.render('songsFrench.hbs', songsDataFrench);
        }
    }
}


router.get('/mySongs', songs); 


/**
 * As forms do not have a DELETE or PUT method, 
 * the method will be determined through a hidden field sent in with POST.
 * Source: https://stackoverflow.com/questions/8054165/using-put-method-in-html-form
 * @param {*} request 
 * @param {*} response 
 */
async function decide(request, response){
    if (request.body._method == "post")
        await createSong(request, response);
    else if (request.body._method == "put")
        await updateSong(request, response);
    else if (request.body._method == "delete")
        await deleteSong(request, response);
}

/**
 * Add a new song to the list.
 * @param {*} request Must contain the name, artist, and genre of the song.
 * @param {*} response Render the songs view.
 */
async function createSong(request, response) {
    let lang = request.cookies.language;
    try {
        let eventId = await eventsController.getEventId(request);
        songsArray = await model.getAllSongs(eventId);

        let requestJson = request.body;
        await model.addSong(requestJson.songName, requestJson.artistName, requestJson.genreName, eventId);

        songsArray = await model.getAllSongs(eventId);
   
        updateSongIds();
    
        const songsDataEnglish = {
            allSongs: songsArray,
            noSongs: songsArray.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Successfully added song '"+requestJson.songName+"' by '"+requestJson.artistName+"' of genre '"+requestJson.genreName+"'.",
            alertColor: "#5abca4"
        };

        const songsDataFrench = {
            allSongs: songsArray,
            noSongs: songsArray.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Chanson ajoutée avec succès '"+requestJson.songName+"' de '"+requestJson.artistName+"' du genre '"+requestJson.genreName+"'.",
            alertColor: "#5abca4"
        };

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('songs.hbs', songsDataEnglish);
            } else {
                response.render('songsFrench.hbs', songsDataFrench);
            }
        }
    } catch (err) {
        const songsDataEnglish = {
            allSongs: songsArray,
            noSongs: songsArray.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Could not add song.",
            alertColor: "#f05858"
        };

        const songsDataFrench = {
            allSongs: songsArray,
            noSongs: songsArray.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Impossible d'ajouter la chanson.",
            alertColor: "#f05858"
        };

        if (err instanceof model.SystemError) {
            songsDataEnglish.alertMessage = "A system error occurred.";
            songsDataFrench.alertMessage = "Une erreur système s'est produite.";
        } else if (err instanceof model.InvalidInputError) {
            songsDataEnglish.alertMessage = "Invalid input. Please try again.";
            songsDataFrench.alertMessage = "Entrée invalide. Veuillez réessayer.";
        }

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('songs.hbs', songsDataEnglish);
            } else {
                response.render('songsFrench.hbs', songsDataFrench);
            }
        }
    }
}

router.post('/songs', decide);

/**
 * Delete a song from the list.
 * @param {*} request Must contain the id of the song to be deleted.
 * @param {*} response Render the songs view.
 */
async function deleteSong(request, response) {
    let lang = request.cookies.language;
    try {
        let eventId = await eventsController.getEventId(request);
        songsArray = await model.getAllSongs(eventId);

        let requestJson = request.body;

        if (!songIds.includes(requestJson.songId+""))
            throw new model.InvalidIdError();
        
        await model.deleteSong(requestJson.songId);

        songsArray = await model.getAllSongs(eventId);
   
        updateSongIds();
    
        const songsDataEnglish = {
            allSongs: songsArray,
            noSongs: songsArray.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Successfully deleted song #"+requestJson.songId+".",
            alertColor: "#5abca4"
        };

        const songsDataFrench = {
            allSongs: songsArray,
            noSongs: songsArray.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Chanson supprimée avec succès #"+requestJson.songId+".",
            alertColor: "#5abca4"
        };

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('songs.hbs', songsDataEnglish);
            } else {
                response.render('songsFrench.hbs', songsDataFrench);
            }
        }
    } catch (err) {
        const songsDataEnglish = {
            allSongs: songsArray,
            noSongs: songsArray.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Could not delete song.",
            alertColor: "#f05858"
        };

        const songsDataFrench = {
            allSongs: songsArray,
            noSongs: songsArray.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Impossible d'ajouter la chanson.",
            alertColor: "#f05858"
        };

        if (err instanceof model.SystemError) {
            songsDataEnglish.alertMessage = "A system error occurred.";
            songsDataFrench.alertMessage = "Une erreur système s'est produite.";
        } else if (err instanceof model.InvalidInputError) {
            songsDataEnglish.alertMessage = "Invalid input. Please try again.";
            songsDataFrench.alertMessage = "Entrée invalide. Veuillez réessayer.";
        }

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('songs.hbs', songsDataEnglish);
            } else {
                response.render('songsFrench.hbs', songsDataFrench);
            }
        }
    }
}


/**
 * Update the song info.
 * @param {*} request Must contain the id of the song to update, a new name, a new artist, a new genre.
 * @param {*} response Render the songs view.
 */
async function updateSong(request, response) {
    let lang = request.cookies.language;
    try {
        let eventId = await eventsController.getEventId(request);
        songsArray = await model.getAllSongs(eventId);

        let requestJson = request.body;

        if (!songIds.includes(requestJson.songId+""))
            throw new model.InvalidIdError();
        
        await model.updateSong(requestJson.songId, requestJson.newName, requestJson.newArtist, requestJson.newGenre);

        songsArray = await model.getAllSongs(eventId);
   
        updateSongIds();
    
        const songsDataEnglish = {
            allSongs: songsArray,
            noSongs: songsArray.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Successfully updated song #"+requestJson.songId+".",
            alertColor: "#5abca4"
        };

        const songsDataFrench = {
            allSongs: songsArray,
            noSongs: songsArray.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Chanson mise à jour avec succès #"+requestJson.songId+".",
            alertColor: "#5abca4"
        };

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('songs.hbs', songsDataEnglish);
            } else {
                response.render('songsFrench.hbs', songsDataFrench);
            }
        }
    } catch (err) {
        const songsDataEnglish = {
            allSongs: songsArray,
            noSongs: songsArray.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Could not update song.",
            alertColor: "#f05858"
        };

        const songsDataFrench = {
            allSongs: songsArray,
            noSongs: songsArray.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Impossible d'ajouter la chanson.",
            alertColor: "#f05858"
        };

        if (err instanceof model.SystemError) {
            songsDataEnglish.alertMessage = "A system error occurred.";
            songsDataFrench.alertMessage = "Une erreur système s'est produite.";
        } else if (err instanceof model.InvalidIdError){
            songsDataEnglish.alertMessage = "Incorrect song id.";
            songsDataFrench.alertMessage = "Id de chanson incorrect.";
        } else if (err instanceof model.InvalidInputError) {
            songsDataEnglish.alertMessage = "Invalid input. Please try again.";
            songsDataFrench.alertMessage = "Entrée invalide. Veuillez réessayer.";
        }

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('songs.hbs', songsDataEnglish);
            } else {
                response.render('songsFrench.hbs', songsDataFrench);
            }
        }
    }
}

/**
 * Update the list of song ids.
 */
function updateSongIds(){
    songIds = [];
    for (let i = 0; i < songsArray.length; i++) {
        songIds.push(songsArray[i].SongId+"");
    }
}

module.exports = {
    router,
    routeRoot,
    songs,
    createSong,
    decide
}