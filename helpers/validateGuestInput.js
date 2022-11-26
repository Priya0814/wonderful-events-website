
const { TestResult } = require('@jest/types');
const val = require('validator');

//const minVisitorNumber = 1200; //This is the starting number for the attendee's badge number. Staff and other volunteers get different numbers, but all attendees badge numbers start at 1200

/**
 * Verifies the guests old name and new name is a string type and alphabet letters only
 * @param {*} oldName The old name of the guest
 * @param {*} newName The new name of the guest
 * @returns true if all the information is valid, false otherwise.
*/
function isValidGuest(oldName, newName){
      
    if(typeof oldName === "string" && typeof newName === "string")
    {
        if(val.isAlpha(oldName) && val.isAlpha(newName)) //truthy check to see if the names are alphabet letters only
        {
            return true;
        }
    }
    return false;

}

/**
 * Make sure that the guest name is valid.
 * @param {*} name The name of the guest.
 * @returns True if it is valid, false otherwise.
 */
function isValidGuestName(name){
      
    if(typeof name === "string")
    {
        if(val.isAlpha(name)) //truthy check to see if the names are alphabet letters only
        {
            return true;
        }
    }
    return false;

}


module.exports = {
    isValidGuest,
    isValidGuestName
}