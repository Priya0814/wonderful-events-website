const validateInput = require('../helpers/validateMealInput');
const mysql = require("mysql2/promise");
const logger = require("../logger");
const mainModel = require('../models/mainModel');
let connection = mainModel.getConnection();

/**
 * Add a meal to the database of meals.
 * @param {*} main Main dish of the meal.
 * @param {*} drink Drink of the meal.
 * @param {*} vegan If meal is vegan.
 * @param {*} eventId Id of the event that the meal belongs to.
 * @returns Meal object if successful, null otherwise.
 */
 async function addMeal(main, drink, vegan, eventId) {
    //vegan is not validated because its a checkbox (either true or false)
    if (!validateInput.isValidMeal(main, drink)) {
        logger.info("Invalid input.")
        throw new InvalidInputError();
    }

    connection = mainModel.getConnection();

    const sqlQuery =  "INSERT INTO meal(Main, Drink, Vegan, EventId) VALUES ('"+main+"', '"+drink+"', "+vegan+", "+eventId+");";

    await connection.execute(sqlQuery).then(logger.info("Meal with main dish: '" + main + "', drink: '"+drink+"' and vegan type: '" + vegan
     + "' has been added.")).catch(error => {throw new SystemError()});

    return {main, drink, vegan};
}

/**
 * Delete specified meal from database.
 * @param {*} mealId Id of the meal to be deleted.
 */
async function deleteMeal(mealId) {
    connection = mainModel.getConnection();

    const sqlQuery = "DELETE FROM meal WHERE MealId='"+mealId+"';";

    await connection.execute(sqlQuery).then(logger.info("Meal  #" + mealId + " has been deleted.")).catch(error => {throw new SystemError()});
}

/**
 * Replace a meal in the database by another meal.
 * Assumption: all new info is provided.
 * @param {*} mealId Id of the meal to update.
 * @param {*} newMain New main dish of the meal.
 * @param {*} newDrink New drink of the meal.
 * @param {*} newVegan New vegan type of the meal.
 */
async function updateMeal(mealId, newMain, newDrink, newVegan) {
    //newVegan is not validated because its a checkbox (either true or false)
    if (!validateInput.isValidMeal(newMain, newDrink)) {
        logger.info("Invalid input for new meal info.")
        throw new InvalidInputError();
    }

    connection = mainModel.getConnection();

    const sqlQuery = "UPDATE meal SET Main='"+ newMain + "', Drink='"+newDrink+"', Vegan="+newVegan+" WHERE MealId="+mealId+";";

    await connection.execute(sqlQuery).then(logger.info("Meal  #" + mealId + " successfully updated to have the main dish '" + newMain + "', drink: '"+newDrink+"', and vegan type:  '" + newVegan
    + "'.")).catch(error => {throw new SystemError()});
}

/**
 * Find all the meals the event.
 * @param {*} eventId Id of the event.
 * @returns An array of meals of the specified event.
 */
async function getAllMeals(eventId) {
    connection = mainModel.getConnection();

    const sqlQuery = "SELECT MealId, Main, Drink, Vegan FROM meal WHERE EventId='"+eventId+"';";

    const [rows, fields] = await connection.execute(sqlQuery).then(logger.info("Meals of event '" + eventId + "' found.")).catch(error => {throw new SystemError()});

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

module.exports = {
    addMeal,
    deleteMeal,
    updateMeal,
    getAllMeals,
    InvalidInputError,
    SystemError
}