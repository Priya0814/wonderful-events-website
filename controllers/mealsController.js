const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require('../models/mealModel');
const signUpController = require('../controllers/signUpController');
const eventsController = require('../controllers/eventsController');

let mealIds = [];
let mealsArray = [];

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

async function meals(request, response) {
    let eventId = await eventsController.getEventId(request);
    let lang = request.cookies.language;
    
    mealsArray = await model.getAllMeals(eventId);

    updateMealIds();

    const mealsDataEnglish = {
        allMeals: mealsArray,
        noMeals: mealsArray.length == 0,
        isSignedIn: true,
        helpers: {
            YesNoTrueFalse
        },
        displayAlert: false,
        alertMessage: "",
        alertColor: ""
    };

    const mealsDataFrench = {
        allMeals: mealsArray,
        noMeals: mealsArray.length == 0,
        isSignedIn: true,
        helpers: {
            YesNoTrueFalse
        },
        displayAlert: false,
        alertMessage: "",
        alertColor: ""
    };

    if (signUpController.refreshSession(request, response)) {
        if (!lang || lang === 'en') {
            response.render('meals.hbs', mealsDataEnglish);
        } else {
            response.render('mealsFrench.hbs', mealsDataFrench);
        }
    }
}


router.get('/myMeals', meals); 


/**
 * As forms do not have a DELETE or PUT method, 
 * the method will be determined through a hidden field sent in with POST.
 * Source: https://stackoverflow.com/questions/8054165/using-put-method-in-html-form
 * @param {*} request 
 * @param {*} response 
 */
async function decide(request, response){
    if (request.body._method == "post")
        await createMeal(request, response);
    else if (request.body._method == "put")
        await updateMeal(request, response);
    else if (request.body._method == "delete")
        await deleteMeal(request, response);
}

/**
 * POST request to create a meal.
 * @param {*} request 
 * @param {*} response 
 */
async function createMeal(request, response) {
    let lang = request.cookies.language;
    try {
        let eventId = await eventsController.getEventId(request);

        let requestJson = request.body;

        if(requestJson.mealVegan == 'on')
            var vegan = 1;
        else
            var vegan = 0;
        
        await model.addMeal(requestJson.mealMain, requestJson.mealDrink, vegan, eventId);

        mealsArray = await model.getAllMeals(eventId);

        updateMealIds();
    
        const mealsDataEnglish = {
            allMeals: mealsArray,
            noMeals: mealsArray.length == 0,
            isSignedIn: true,
            helpers: {
                YesNoTrueFalse
            },
            displayAlert: true,
            alertMessage: "Successfully added meal: '"+requestJson.mealMain+"' with drink: '"+requestJson.mealDrink+"' and vegan type: '"+vegan+"'.",
            alertColor: "#5abca4"
        };

        const mealsDataFrench = {
            allMeals: mealsArray,
            noMeals: mealsArray.length == 0,
            isSignedIn: true,
            helpers: {
                YesNoTrueFalse
            },
            displayAlert: true,
            alertMessage: "Repas ajouté avec succès: '"+requestJson.mealMain+"' avec boisson: '"+requestJson.mealDrink+"' et de type végétalien: '"+vegan+"'.",
            alertColor: "#5abca4"
        };

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('meals.hbs', mealsDataEnglish);
            } else {
                response.render('mealsFrench.hbs', mealsDataFrench);
            }
        }
    } catch (err) {
        const mealsDataEnglish = {
            allMeals: mealsArray,
            noMeals: mealsArray.length == 0,
            isSignedIn: true,
            helpers: {
                YesNoTrueFalse
            },
            displayAlert: true,
            alertMessage: "Could not add meal.",
            alertColor: "#f05858"
        };

        const mealsDataFrench = {
            allMeals: mealsArray,
            noMeals: mealsArray.length == 0,
            isSignedIn: true,
            helpers: {
                YesNoTrueFalse
            },
            displayAlert: true,
            alertMessage: "Impossible d'ajouter un repas.",
            alertColor: "#f05858"
        };

        if (err instanceof model.SystemError) {
            mealsDataEnglish.alertMessage = "A system error occurred.";
            mealsDataFrench.alertMessage = "Une erreur système s'est produite.";
        } else if (err instanceof model.InvalidInputError) {
            mealsDataEnglish.alertMessage = "Invalid input. Please try again.";
            mealsDataFrench.alertMessage = "Entrée invalide. Veuillez réessayer.";
        }

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('meals.hbs', mealsDataEnglish);
            } else {
                response.render('mealsFrench.hbs', mealsDataFrench);
            }
        }
    }
}

router.post('/meals', decide);

/**
 * DELETE request to delete a meal.
 * @param {*} request 
 * @param {*} response 
 */
async function deleteMeal(request, response) {
    let lang = request.cookies.language;
    try {
        let eventId = await eventsController.getEventId(request);

        let requestJson = request.body;

        if (!mealIds.includes(requestJson.mealId+""))
            throw new model.InvalidIdError();
        
        await model.deleteMeal(requestJson.mealId);

        mealsArray = await model.getAllMeals(eventId);

        updateMealIds();
    
        const mealsDataEnglish = {
            allMeals: mealsArray,
            noMeals: mealsArray.length == 0,
            isSignedIn: true,
            helpers: {
                YesNoTrueFalse
            },
            displayAlert: true,
            alertMessage: "Successfully deleted meal #"+requestJson.mealId+".",
            alertColor: "#5abca4"
        };

        const mealsDataFrench = {
            allMeals: mealsArray,
            noMeals: mealsArray.length == 0,
            isSignedIn: true,
            helpers: {
                YesNoTrueFalse
            },
            displayAlert: true,
            alertMessage: "Repas supprimé avec succès #"+requestJson.mealId+".",
            alertColor: "#5abca4"
        };

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('meals.hbs', mealsDataEnglish);
            } else {
                response.render('mealsFrench.hbs', mealsDataFrench);
            }
        }
    } catch (err) {
        const mealsDataEnglish = {
            allMeals: mealsArray,
            noMeals: mealsArray.length == 0,
            isSignedIn: true,
            helpers: {
                YesNoTrueFalse
            },
            displayAlert: true,
            alertMessage: "Could not delete meal.",
            alertColor: "#f05858"
        };

        const mealsDataFrench = {
            allMeals: mealsArray,
            noMeals: mealsArray.length == 0,
            isSignedIn: true,
            helpers: {
                YesNoTrueFalse
            },
            displayAlert: true,
            alertMessage: "Impossible de supprimer le repas.",
            alertColor: "#f05858"
        };

        if (err instanceof model.SystemError) {
            mealsDataEnglish.alertMessage = "A system error occurred.";
            mealsDataFrench.alertMessage = "Une erreur système s'est produite.";
        } else if (err instanceof model.InvalidInputError) {
            mealsDataEnglish.alertMessage = "Invalid id. Please try again.";
            mealsDataFrench.alertMessage = "Id invalide. Veuillez réessayer.";
        }

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('meals.hbs', mealsDataEnglish);
            } else {
                response.render('mealsFrench.hbs', mealsDataFrench);
            }
        }
    }
}


/**
 * PUT request to update a meal.
 * @param {*} request 
 * @param {*} response 
 */
async function updateMeal(request, response) {
    let lang = request.cookies.language;
    try {
        let eventId = await eventsController.getEventId(request);

        let requestJson = request.body;

        console.log(mealIds);

        if (!mealIds.includes(requestJson.mealId+""))
            throw new model.InvalidIdError();
        
        if(requestJson.newVegan == 'on')
            var vegan = 1;
        else
            var vegan = 0;
        
        await model.updateMeal(requestJson.mealId, requestJson.newMain, requestJson.newDrink, vegan);

        mealsArray = await model.getAllMeals(eventId);

        updateMealIds();
    
        const mealsDataEnglish = {
            allMeals: mealsArray,
            noMeals: mealsArray.length == 0,
            isSignedIn: true,
            helpers: {
                YesNoTrueFalse
            },
            displayAlert: true,
            alertMessage: "Successfully updated meal #"+requestJson.mealId+".",
            alertColor: "#5abca4"
        };

        const mealsDataFrench = {
            allMeals: mealsArray,
            noMeals: mealsArray.length == 0,
            isSignedIn: true,
            helpers: {
                YesNoTrueFalse
            },
            displayAlert: true,
            alertMessage: "Repas mis à jour avec succès #"+requestJson.mealId+".",
            alertColor: "#5abca4"
        };

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('meals.hbs', mealsDataEnglish);
            } else {
                response.render('mealsFrench.hbs', mealsDataFrench);
            }
        }
    } catch (err) {
        const mealsDataEnglish = {
            allMeals: mealsArray,
            noMeals: mealsArray.length == 0,
            isSignedIn: true,
            helpers: {
                YesNoTrueFalse
            },
            displayAlert: true,
            alertMessage: "Could not update meal.",
            alertColor: "#f05858"
        };

        const mealsDataFrench = {
            allMeals: mealsArray,
            noMeals: mealsArray.length == 0,
            isSignedIn: true,
            helpers: {
                YesNoTrueFalse
            },
            displayAlert: true,
            alertMessage: "Impossible de mettre à jour le repas.",
            alertColor: "#f05858"
        };

        if (err instanceof model.SystemError) {
            mealsDataEnglish.alertMessage = "A system error occurred.";
            mealsDataFrench.alertMessage = "Une erreur système s'est produite.";
        } else if (err instanceof model.InvalidInputError) {
            mealsDataEnglish.alertMessage = "Invalid input for new meal info or incorrect meal id.";
            mealsDataFrench.alertMessage = "Entrée non valide pour les nouvelles informations sur le repas ou identifiant de repas incorrect.";
        }

        if (signUpController.refreshSession(request, response)) {
            if (!lang || lang === 'en') {
                response.render('meals.hbs', mealsDataEnglish);
            } else {
                response.render('mealsFrench.hbs', mealsDataFrench);
            }
        }
    }
}

/**
 * Update the list of meal ids.
 */
function updateMealIds(){
    mealIds = [];
    for (let i = 0; i < mealsArray.length; i++) {
        mealIds.push(mealsArray[i].MealId+"");
    }
}

module.exports = {
    router,
    routeRoot,
    meals,
    createMeal,
    decide
}