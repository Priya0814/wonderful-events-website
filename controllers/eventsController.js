const express = require('express');
const router = express.Router();
const routeRoot = '/';
const eventModel = require('../models/eventModel');
const signUpController = require('../controllers/signUpController');
let eventIds = [];
let eventsList = [];

/**
 * As forms do not have a DELETE or PUT method, 
 * the method will be determined through a hidden field sent in with POST.
 * Source: https://stackoverflow.com/questions/8054165/using-put-method-in-html-form
 * @param {*} request 
 * @param {*} response 
 */
 async function decide(request, response){
    if (request.body._method == "post")
        await createEvent(request, response);
    else if (request.body._method == "delete")
        await deleteEvent(request, response);
    else if (request.body._method == "put")
        await updateEvent(request, response);
}

router.post('/events', decide);

/**
 * Load the myEvents page along with all the events that user has.
 * @param {*} request Just a get request to events.
 * @param {*} response Render the myEvents view.
 */
async function events(request, response){
    let lang = request.cookies.language;
    try {
        let signedIn = false;
        let sessionId;
        let userId;

        if (request.cookies){
            sessionId = request.cookies['sessionId'];
            userId = request.cookies['userId'];
        }
        
        if (sessionId) {
            signedIn = true;
        }

        let rows = await eventModel.getAllEvents(userId);

        updateEventsList(rows);


        const eventsDataEnglish = {
                allEvents: eventsList,
                noEvents: eventsList.length == 0,
                isSignedIn: true,
                displayAlert: false,
                alertMessage: "",
                alertColor: ""
            };

        const eventsDataFrench = {
                allEvents: eventsList,
                noEvents: eventsList.length == 0,
                isSignedIn: true,
                displayAlert: false,
                alertMessage: "",
                alertColor: ""
            };

        if (signUpController.refreshSession(request, response)){
            if (!lang || lang === 'en') {
                response.render('events.hbs', eventsDataEnglish);
            } else {
                response.render('eventsFrench.hbs', eventsDataFrench);
            }
        }
    } catch (error){
        if (!signUpController.refreshSession(request, response)){
            let signedIn = false;
            let sessionId;
            if (request.cookies){
                sessionId = request.cookies['sessionId'];    
            }
            if (sessionId) {
                signedIn = true;
            }
        
            const pageDataEnglish = {
                image:"images/obnoxious.jpeg", 
                eventIdeas: [
                        "Your pet panther's wedding", 
                        "Your 50th wedding anniversary",
                        "Duffcoin becoming the main currency of Canada", 
                        "A launch party your newest album"
                    ],
                isSignedIn: signedIn,
            }

            const pageDataFrench = {
                image:"images/obnoxious.jpeg", 
                eventIdeas: [
                        "Le mariage de votre panthère de compagnie", 
                        "Votre 50e anniversaire de mariage",
                        "Le Duffcoin devient la principale monnaie du Canada", 
                        "Une soirée de lancement de votre nouvel album"
                    ],
                isSignedIn: signedIn,
            }

            if (!lang || lang === 'en') {
                response.render('home.hbs', pageDataEnglish);
            } else {
                response.render('homeFrench.hbs', pageDataFrench);
            }
        }
    }
}

router.get('/myEvents', events); 

/**
 * Load the editEvent page for a specific event selected by the user.
 * @param {*} request Should contain the id of the event to be edited.
 * @param {*} response Render the editEvent view if the id is valid, render events view if not.
 */
async function editEvent(request, response){
    let lang = request.cookies.language;
    try{
        let eventId;

        if ((request.url+"").includes("?")) // inspired from: https://bobbyhadz.com/blog/javascript-check-if-url-has-query-parameters#:~:text=Parameters%20using%20indexOf%20%23-,To%20check%20if%20a%20url%20has%20query%20parameters%2C%20call%20the,')%20!%3D%3D
            eventId = request.query.eventId;
        else {
            eventId = await getEventId(request);
        }

        if (eventIds.includes(eventId+"")){
            response.cookie("eventId", eventId, {expires: new Date(Date.now() + (1000*60*60*9000))}); // expire in 9000 hours
            eventsDataEnglish = {
                isSignedIn: true,
                eventId: eventId,
                displayAlert: false,
                alertMessage: "",
                alertColor: ""
            };
    
            eventsDataFrench = {
                isSignedIn: true,
                eventId: eventId,
                displayAlert: false,
                alertMessage: "",
                alertColor: ""
            };
    
            if (signUpController.refreshSession(request, response)) {
                if (!lang || lang === 'en') {
                    response.render('editEvents.hbs', eventsDataEnglish);
                } else {
                    response.render('editEventsFrench.hbs', eventsDataFrench);
                }
            }
        }
        else {
            eventsDataEnglish = {
                allEvents: eventsList,
                noEvents: eventsList.length == 0,
                isSignedIn: true,
                displayAlert: true,
                alertMessage: "Incorrect event id.",
                alertColor: "#f05858"
            };

            eventsDataFrench = {
                allEvents: eventsList,
                noEvents: eventsList.length == 0,
                isSignedIn: true,
                displayAlert: true,
                alertMessage: "Identifiant d'événement incorrect.",
                alertColor: "#f05858"
            };

            if (signUpController.refreshSession(request, response))
            if (!lang || lang === 'en') {
                response.render('events.hbs', eventsDataEnglish);
            } else {
                response.render('eventsFrench.hbs', eventsDataFrench);
            }
        }
    } catch(error){
        eventsDataEnglish = {
            allEvents: eventsList,
            noEvents: eventsList.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "An error occurred.",
            alertColor: "#f05858"
        };

        eventsDataFrench = {
            allEvents: eventsList,
            noEvents: eventsList.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Une erreur s'est produite.",
            alertColor: "#f05858"
        };

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('events.hbs', eventsDataEnglish);
            } else {
                response.render('eventsFrench.hbs', eventsDataFrench);
            }
        }
    }

}

router.get('/events', editEvent)


/**
 * Create an event with the information the user provides.
 * @param {*} request Should contain the name, the date, and the location of the event.
 * @param {*} response Render the events view.
 */
async function createEvent(request, response){
    let userId;
    let lang = request.cookies.language;

    try{
        if (request.cookies){
            userId = request.cookies['userId']; 
        }
        
        let eventsDataEnglish;

        if (userId != null) {
            const name = request.body.newEventName;
            const date = request.body.newEventDate;
            const location = request.body.newEventLocation;
        
            await eventModel.createEvent(name, date, location, userId);
    
            const rows = await eventModel.getAllEvents(userId);

            updateEventsList(rows);

            eventsDataEnglish = {
                allEvents: eventsList,
                noEvents: eventsList.length == 0,
                isSignedIn: true,
                displayAlert: true,
                alertMessage: "Successfully added event named '"+name+"'.",
                alertColor: "#5abca4"
            };

            eventsDataFrench = {
                allEvents: eventsList,
                noEvents: eventsList.length == 0,
                isSignedIn: true,
                displayAlert: true,
                alertMessage: "L'événement nommé a bien été ajouté '"+name+"'.",
                alertColor: "#5abca4"
            };
        }
        else {
            eventsDataEnglish = {
                allEvents: eventsList,
                noEvents: eventsList.length == 0,
                isSignedIn: true,
                displayAlert: true,
                alertMessage: "Could not add event.",
                alertColor: "#f05858"
            };

            eventsDataFrench = {
                allEvents: eventsList,
                noEvents: eventsList.length == 0,
                isSignedIn: true,
                displayAlert: true,
                alertMessage: "Impossible d'ajouter l'événement.",
                alertColor: "#f05858"
            };
        }

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('events.hbs', eventsDataEnglish);
            } else {
                response.render('eventsFrench.hbs', eventsDataFrench);
            }
        }
    }
    catch (error){
        eventsDataEnglish = {
            allEvents: eventsList,
            noEvents: eventsList.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Could not add event.",
            alertColor: "#f05858"
        };

        eventsDataFrench = {
            allEvents: eventsList,
            noEvents: eventsList.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Impossible d'ajouter l'événement.",
            alertColor: "#f05858"
        };

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('events.hbs', eventsDataEnglish);
            } else {
                response.render('eventsFrench.hbs', eventsDataFrench);
            }
        }
    }
}

/**
 * Delete an event by its id specified by the user.
 * @param {*} request Should contain the id of the event to be deleted.
 * @param {*} response Render the events view.
 */
async function deleteEvent(request, response){
    let userId;
    let lang = request.cookies.language;

    if (request.cookies){
        userId = request.cookies['userId'];
    }

    try{
        const eventId = request.body.eventId;
        if (!eventIds.includes(eventId+"")) {
            throw new Error();
        }
            
        if (userId == null) {
            throw new Error();
        }
    
        await eventModel.deleteEvent(eventId);

        const rows = await eventModel.getAllEvents(userId);
    
        updateEventsList(rows);

        const eventsDataEnglish = {
            allEvents: eventsList,
            noEvents: eventsList.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Successfully deleted event named of id "+eventId+".",
            alertColor: "#5abca4"
        };

        const eventsDataFrench = {
            allEvents: eventsList,
            noEvents: eventsList.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "L'événement nommé d'id a bien été supprimé "+eventId+".",
            alertColor: "#5abca4"
        };
        
        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('events.hbs', eventsDataEnglish);
            } else {
                response.render('eventsFrench.hbs', eventsDataFrench);
            }
        }
    } catch (error){
        const eventsDataEnglish = {
            allEvents: eventsList,
            noEvents: eventsList.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Could not delete event.",
            alertColor: "#f05858"
        };

        const eventsDataFrench = {
            allEvents: eventsList,
            noEvents: eventsList.length == 0,
            isSignedIn: true,
            displayAlert: true,
            alertMessage: "Impossible de supprimer l'événement.",
            alertColor: "#f05858"
        };

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('events.hbs', eventsDataEnglish);
            } else {
                response.render('eventsFrench.hbs', eventsDataFrench);
            }
        }
    }
    
}


/**
 * Update an event to the information the user provides.
 * @param {*} request Should contain the event id, the new event name, the new event date, and the new event location.
 * @param {*} response Render the view editEvents.
 */
async function updateEvent(request, response){
    let lang = request.cookies.language;
    try {
        let eventId = await getEventId(request);

        const name = request.body.newEventName;
        const date = request.body.newDate;
        const location = request.body.newLocation;

        await eventModel.updateEvent(eventId, name, date, location);

        const eventsDataEnglish = {
            isSignedIn: true,
            eventId: eventId,
            displayAlert: true,
            alertMessage: "Successfully updated event named '"+name+"'.",
            alertColor: "#5abca4"
        };

        eventsDataFrench = {
            isSignedIn: true,
            eventId: eventId,
            displayAlert: true,
            alertMessage: "L'événement nommé a bien été mis à jour '"+name+"'.",
            alertColor: "#5abca4"
        };

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('editEvents.hbs', eventsDataEnglish);
            } else {
                response.render('editEventsFrench.hbs', eventsDataFrench);
            }
        }
    } catch (error) {
        eventsDataEnglish = {
            isSignedIn: true,
            eventId: eventId,
            displayAlert: true,
            alertMessage: "Could not update event.",
            alertColor: "#f05858"
        };

        eventsDataFrench = {
            isSignedIn: true,
            eventId: eventId,
            displayAlert: true,
            alertMessage: "Impossible de mettre à jour l'événement.",
            alertColor: "#f05858"
        };

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('editEvents.hbs', eventsDataEnglish);
            } else {
                response.render('editEvents.hbs', eventsDataFrench);
            }
        }
    }
}

/**
 * Retrieve the event id from the cookie.
 * @param {*} request Request containing the cookie (among other things).
 * @returns The eventId.
 */
async function getEventId(request){
    let eventId;
    if (request.cookies){
        eventId = request.cookies['eventId'];
    }

    if (eventId == null)
        throw new Error();
    
    return eventId;
}

/**
 * Update the list of events and event ids.
 * @param {*} rows The rows returned from the database.
 */
function updateEventsList(rows){
    eventsList = [];
    eventIds = [];
    for (let i = 0; i < rows.length; i++) {
        eventIds.push(rows[i].EventId+"");
        let dateStr = rows[i].Date + "";
        dateStr = dateStr.substring(0,15);
        eventsList.push({id: rows[i].EventId, name: rows[i].Name, date: dateStr, location: rows[i].Location})
    }
}

module.exports = {
    router,
    routeRoot,
    events,
    editEvent,
    createEvent,
    deleteEvent,
    getEventId
}