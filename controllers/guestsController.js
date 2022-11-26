const express = require('express');
const guestModel = require('../models/guestModel');
const mealModel = require('../models/mealModel');
const signUpController = require('../controllers/signUpController');
const eventsController = require('../controllers/eventsController');
const router = express.Router();
const routeRoot = '/';
let guestList = [];
let guestNames = [];
let allMealsList = [];

/**
 * As forms do not have a DELETE or PUT method, 
 * the method will be determined through a hidden field sent in with POST.
 * Source: https://stackoverflow.com/questions/8054165/using-put-method-in-html-form
 * @param {*} request 
 * @param {*} response 
 */
 async function decide(request, response){
    if (request.body._method == "post")
        await addGuest(request, response);
    else if (request.body._method == "delete")
        await deleteGuest(request, response);
    else if (request.body._method == "put")
        await updateGuest(request, response);
}

router.post('/guests', decide);

/**
 * Display the guests page along with the meal list and the guest list.
 * @param {*} request Just a get request to guests.
 * @param {*} response Render the guests page.
 */
async function guestsPage(request, response){
    let guestData;
    let lang = request.cookies.language;
    let eventId = await eventsController.getEventId(request);
    allMealsList = await mealModel.getAllMeals(eventId);

    guestList = await guestModel.findGuests(eventId);
    
    updateNamesList();

    guestData = {
        allMeals: allMealsList,
        helpers: {
            YesNoTrueFalse
        },
        showMeals: true,
        guestList: guestList,
        isSignedIn: true,
        showVisitors: guestList.length > 0,
        displayAlert: false,
        alertMessage: "",
        alertColor: ""
    }

    if (signUpController.refreshSession(request, response)) {
        if (!lang || lang === 'en') {
            response.render('guests.hbs',  guestData);
        } else {
            response.render('guestsFrench.hbs',  guestData);
        }
    }
}


/**
 * Add a new guest to the list of guests.
 * @param {*} request  Should contain the name and the meal preference of the guest.
 * @param {*} response Render the guests view with an updated guest list.
 */
async function addGuest(request, response){   
    let eventId;
    let lang = request.cookies.language;

    try{
        eventId = await eventsController.getEventId(request);

        if (guestNames.includes(request.body.guestName))
            throw new guestModel.MyUserDataError();

        const addedGuest = await guestModel.addGuest(request.body.guestName, eventId, request.body.mealId);
        
        guestList = await guestModel.findGuests(eventId);
    
        updateNamesList();
    
        const guestDataEnglish = {
            allMeals: allMealsList,
            helpers: {
                YesNoTrueFalse
            },
            showMeals: true,
            guestList: guestList,
            isSignedIn: true,
            showVisitors: guestList.length > 0,
            displayAlert: true,
            alertMessage: "Successfully added the guest '"+ addedGuest.guestName+"' with their meal of id: " + addedGuest.mealId,
            alertColor: "#5abca4"
        }
        
        const guestDataFrench = {
            allMeals: allMealsList,
            helpers: {
                YesNoTrueFalse
            },
            showMeals: true,
            guestList: guestList,
            isSignedIn: true,
            showVisitors: guestList.length > 0,
            displayAlert: true,
            alertMessage: "L'invité avec le nom '"+ addedGuest.guestName+"' a été ajouté avec succès à son repas d'identification: " + addedGuest.mealId,
            alertColor: "#5abca4"
        }

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('guests.hbs',  guestDataEnglish);
            } else {
                response.render('guestsFrench.hbs',  guestDataFrench);
            }
        }
    }
    catch(err)  
    {
        const guestDataEnglish = {
            allMeals: allMealsList,
            helpers: {
                YesNoTrueFalse
            },
            showMeals: true,
            guestList: guestList,
            isSignedIn: true,
            showVisitors: guestList.length > 0,
            displayAlert: true,
            alertMessage: "Could not add guest.",
            alertColor: "#f05858"
        }

        const guestDataFrench = {
            allMeals: allMealsList,
            helpers: {
                YesNoTrueFalse
            },
            showMeals: true,
            guestList: guestList,
            isSignedIn: true,
            showVisitors: guestList.length > 0,
            displayAlert: true,
            alertMessage: "Impossible d'ajouter un invité.",
            alertColor: "#f05858"
        }
        
        if(err instanceof guestModel.MyUserDataError)
        {
            response.status(400);
            guestDataEnglish.alertMessage = "Inappropriate name input! Name cannot contain numbers, spaces, symbols, or be a duplicate.";
            guestDataFrench.alertMessage = "Saisie de nom inappropriée! Le nom ne peut pas contenir de chiffres, d'espaces, de symboles ou être un doublon.";
        }

        else if(err instanceof guestModel.DatabaseAccessError)
        {
            response.status(500);
            guestDataEnglish.alertMessage = "Cannot connect to the database.";
            guestDataFrench.alertMessage = "Impossible de se connecter à la base de données.";
        }

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('guests.hbs',  guestDataEnglish);
            } else {
                response.render('guestsFrench.hbs',  guestDataFrench);
            }
        }
    }
}


/**
 * Update the guest information.
 * @param {*} request Should contain the old name of the guest, the new name, and the new meal preference.
 * @param {*} response Render the guest view with an updated guest list.
 */
async function updateGuest(request, response){
    let eventId;
    let lang;
    try{
        eventId = await eventsController.getEventId(request);
        lang = request.cookies.language;

        if (!guestNames.includes(request.body.oldName))
            throw new guestModel.MyUserDataError();


        const updatedGuest = await guestModel.updateGuest(request.body.oldName, request.body.newName, request.body.newMealID);
     
        if(updatedGuest)
        {            
            guestList = await guestModel.findGuests(eventId);
    
            updateNamesList();
        
            const guestDataEnglish = {
                allMeals: allMealsList,
                helpers: {
                    YesNoTrueFalse
                },
                showMeals: true,
                guestList: guestList,
                isSignedIn: true,
                showVisitors: guestList.length > 0,
                displayAlert: true,
                alertMessage: "Updated guest name! Old name: " + updatedGuest.oldName + ", New name: " + updatedGuest.newName +".",
                alertColor: "#5abca4"
            }

            const guestDataFrench = {
                allMeals: allMealsList,
                helpers: {
                    YesNoTrueFalse
                },
                showMeals: true,
                guestList: guestList,
                isSignedIn: true,
                showVisitors: guestList.length > 0,
                displayAlert: true,
                alertMessage: "Nom d'invité mis à jour ! View nom: " + updatedGuest.oldName + ", Nouveau nom: " + updatedGuest.newName +".",
                alertColor: "#5abca4"
            }

            if (signUpController.refreshSession(request, response)) {
                if (!lang || lang === 'en') {
                    response.render('guests.hbs',  guestDataEnglish);
                } else {
                    response.render('guestsFrench.hbs',  guestDataFrench);
                }
            }
        } else {
            throw new Error();
        }
    }
    catch(err)  
    {
        const guestDataEnglish = {
            allMeals: allMealsList,
            helpers: {
                YesNoTrueFalse
            },
            showMeals: true,
            guestList: guestList,
            isSignedIn: true,
            showVisitors: guestList.length > 0,
            displayAlert: true,
            alertMessage: "Could not add guest.",
            alertColor: "#f05858"
        }

        const guestDataFrench = {
            allMeals: allMealsList,
            helpers: {
                YesNoTrueFalse
            },
            showMeals: true,
            guestList: guestList,
            isSignedIn: true,
            showVisitors: guestList.length > 0,
            displayAlert: true,
            alertMessage: "Impossible d'ajouter un invité.",
            alertColor: "#f05858"
        }
        
        if(err instanceof guestModel.MyUserDataError)
        {
            response.status(400);
            guestDataEnglish.alertMessage = "Inappropriate name input! Name cannot contain numbers, spaces, symbols, or be a duplicate.";
            guestDataFrench.alertMessage = "Saisie de nom inappropriée! Le nom ne peut pas contenir de chiffres, d'espaces, de symboles ou être un doublon.";
        }

        else if(err instanceof guestModel.DatabaseAccessError)
        {
            response.status(500);
            guestDataEnglish.alertMessage = "Cannot connect to the database.";
            guestDataFrench.alertMessage = "Impossible de se connecter à la base de données.";
        }

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('guests.hbs',  guestDataEnglish);
            } else {
                response.render('guestsFrench.hbs',  guestDataFrench);
            }
        }
    }   

}

/**
 * Delete a guest from the guest list.
 * @param {*} request Should contain the name of the guest to be deleted.
 * @param {*} response Render the guest view with an updated guest list.
 */
async function deleteGuest(request, response){
    let eventId;
    let lang;
    try{
        eventId = await eventsController.getEventId(request);
        lang = request.cookies.language;

        if (!guestNames.includes(request.body.guestName))
            throw new guestModel.MyUserDataError();

        const deletedGuest = await guestModel.deleteGuest(request.body.guestName);
        response.status(200);    
        
        guestList = await guestModel.findGuests(eventId);
    
        updateNamesList();
        
        const guestDataEnglish = {
            allMeals: allMealsList,
            helpers: {
                YesNoTrueFalse
            },
            showMeals: true,
            guestList: guestList,
            isSignedIn: true,
            showVisitors: guestList.length > 0,
            displayAlert: true,
            alertMessage: "Successfully deleted the guest "+ deletedGuest.guestName+" from the database.",
            alertColor: "#5abca4"
        }
        
        const guestDataFrench = {
            allMeals: allMealsList,
            helpers: {
                YesNoTrueFalse
            },
            showMeals: true,
            guestList: guestList,
            isSignedIn: true,
            showVisitors: guestList.length > 0,
            displayAlert: true,
            alertMessage: "L'invité a bien été supprimé "+ deletedGuest.guestName+" de la base de données.",
            alertColor: "#5abca4"
        }
        
        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('guests.hbs',  guestDataEnglish);
            } else {
                response.render('guestsFrench.hbs',  guestDataFrench);
            }
        }
    }
    catch(err)  
    {
        const guestDataEnglish = {
            allMeals: allMealsList,
            helpers: {
                YesNoTrueFalse
            },
            showMeals: true,
            isSignedIn: true,
            guestList: guestList,
            showVisitors: guestList.length > 0,
            displayAlert: true,
            alertMessage: "Could not add guest.",
            alertColor: "#f05858"
        }

        const guestDataFrench = {
            allMeals: allMealsList,
            helpers: {
                YesNoTrueFalse
            },
            showMeals: true,
            isSignedIn: true,
            guestList: guestList,
            showVisitors: guestList.length > 0,
            displayAlert: true,
            alertMessage: "Impossible d'ajouter un invité.",
            alertColor: "#f05858"
        }
        
        if(err instanceof guestModel.MyUserDataError)
        {
            response.status(400);
            guestDataEnglish.alertMessage = "Inappropriate name input! Name cannot contain numbers, spaces, symbols, and it must be present in the guest list.";
        }
        else if(err instanceof guestModel.NoExistingUserDataError)
        {
            response.status(400);
            guestDataEnglish.alertMessage = "There's no guest with that name.";
        }
        else if(err instanceof guestModel.DatabaseAccessError)
        {
            response.status(500);
            guestDataEnglish.alertMessage = "Cannot connect to the database.";
        }

        if(err instanceof guestModel.MyUserDataError)
        {
            response.status(400);
            guestDataEnglish.alertMessage = "Inappropriate name input! Name cannot contain numbers, spaces, symbols, or be a duplicate.";
            guestDataFrench.alertMessage = "Saisie de nom inappropriée! Le nom ne peut pas contenir de chiffres, d'espaces, de symboles ou être un doublon.";
        }
        else if(err instanceof guestModel.NoExistingUserDataError)
        {
            response.status(400);
            guestDataEnglish.alertMessage = "There's no guest with that name.";
            guestDataFrench.alertMessage = "Il n'y a pas d'invité avec ce nom.";
        }
        else if(err instanceof guestModel.DatabaseAccessError)
        {
            response.status(500);
            guestDataEnglish.alertMessage = "Cannot connect to the database.";
            guestDataFrench.alertMessage = "Impossible de se connecter à la base de données.";
        }

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('guests.hbs',  guestDataEnglish);
            } else {
                response.render('guestsFrench.hbs',  guestDataFrench);
            }
        }
    }
}


router.get('/guests', guestsPage); //This is the endpoint for rendering the regular guest page
router.post('/guests', addGuest); //This is endpoint is used for adding guests to the guest table in the database.
//router.get('/guests', findGuests) //This is endpoint is used for finding all guests from the guest table in the database.
router.put('/guests', updateGuest); //This is endpoint is used for updating a guest from the guest table in the database.
router.delete('/guests', deleteGuest); //This is endpoint is used for deleting a guest from the guest table in the database.

/**
 * Convert boolean to yes or no.
 * @param {*} boolean The boolean to convert.
 * @returns Yes if true, no if false.
 */
function YesNoTrueFalse(boolean, language) {
    if (boolean) {
        if (language == 'en'){
            return "Yes";
        }
        else {
            return "Oui";
        }
    }
    else{
        if (language == 'en'){
            return "No";
        }
        else {
            return "Non";
        }
    } 
}

/**
 * Update the list of guests.
 */
function updateNamesList(){
    guestNames = [];
    for(let x = 0; x < guestList.length; x++)
    {
        guestNames.push(guestList[x].Name+"");
    }
}

module.exports = {
    router,
    routeRoot,
    guestsPage,
    addGuest,
    updateGuest,
    deleteGuest
}