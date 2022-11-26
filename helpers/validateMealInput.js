const validator = require('validator');
const validDrinks = [
    "water", "juice", "milk", "soft drink", "beer", "wine", "cider", "coffee", "tea", "hot chocolate", "soda", "coke", "pepsi", "sprite"
]
/**
 * Make sure the main dish of meal, its drink, and the vegan bool are all valid.
 * @param {*} name Main dish of the meal.
 * @param {*} drink Drink of the meal.
 * @returns true if valid, false otherwise.
 */
function isValidMeal(main, drink) {
    return (validDrinks.includes(drink.toLowerCase()) && 
           typeof main === 'string' && main && validator.isAlpha(main));
}

module.exports = {
    isValidMeal
}