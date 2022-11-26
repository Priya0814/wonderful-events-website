const validateInput = require('../helpers/validateGuestInput');
const mysql = require("mysql2/promise");
const logger = require("../logger");
const mainModel = require('../models/mainModel');
connection = mainModel.getConnection();

/**This error is used for when the user-input given to a database may contain unwanted values or characters. 
 * Rather than crashing the program it allows it fail with grace.
 * This inherits the Error class. 
  */
class MyUserDataError extends Error{   
    

}

/**This error is used for when the user-input given to a database may may not have any matches in the database. 
* Rather than crashing the program it allows it fail with grace.
 * This inherits the Error class. 
  */
class NoExistingUserDataError extends Error{   
    

}

/**This error is used for when the server connection is disabled and the operation couldn't be completed. 
  * Rather than crashing the program it allows it fail with grace.
 * This inherits the Error class. 
  */
class DatabaseAccessError extends Error{

}


/**
 * Adds a guest to the guest table in the Database if the sent-in data is valid. Doesn't add the guest if the data is invalid.
 * @param {*} guestName The name of the guest, acts as a Primary Key for the table.
 * @param {*} eventId The id of the event this guest is associated with
 * @param {*} mealId The name of the guest.
 * @returns If the addition fails, an error is thrown. If the addition is successful, the name and meal Id of the guest. 
*/
async function addGuest(guestName, eventId, mealId){
    connection = mainModel.getConnection();
    if(!validateInput.isValidGuestName(guestName)) //This validates if the information sent in is correct before continuing with the operation.
    {throw new MyUserDataError();}

    const addQuery = 'INSERT INTO guest(Name, EventId, MealId) VALUES (\"' + guestName + '\",\"' + eventId + '\",\"' + mealId + '\")' ; //Query to be sent in for the database.

    try{       
            
        await connection.execute(addQuery) //Executing the query.
        .then(logger.info("Guest added!")) //If the operation is successful then this is run
        

        return {"guestName":guestName, "mealId":mealId}; //Returning the name and badge number of the successfully-added visitor.
             
    }
    catch(error){
        logger.info('Error has occurred: ' + error); //If there was an error then it's caught and presented on the console.   
        throw new DatabaseAccessError();      
    }

}




/**
 * The method 'findGuests' searches the database to find all of the guests included in a specific event.
 * @param {*} eventId The id of the event these guests are included in.
 * @returns If the search fails or invalid data is found, an empty array. If the search is successful, an array of Guest objects. 
*/
async function findGuests(eventId)
{ 
    connection = mainModel.getConnection();
    const findQuery = 'SELECT * FROM guest WHERE EventId = \'' + eventId + '\';'; //Query for the database.      
                   
    try 
    {                         
        const [rows, fields] = await connection.execute(findQuery); //Executing the query, and storing the results into [rows, fields].          
        return rows;
    } 
    catch(error){
        logger.info('Error has occurred: ' + error); //If there was an error then it's caught and presented on the console.   
        throw new DatabaseAccessError();      
    }
  
}

/**
 * The method 'updateGuest' will search the database for the name sent in, and update the visitor's name and meal id accordingly. 
 * If old name is found, then the new name and meal id are inserted, and the guests old name, new name and meal id are returned accordingly.
 * If not found or the information is invalid, the return is null.
 * @param {*} oldName The old name of the guest to be replaced in the database.
 * @param {*} newName The new name of the guest to be updated in the database.
 * @param {*} newMealId The new meal Id of the guest to be updated in the database.
 * @returns If the search fails or invalid data is found, an error is thrown. If the search is successful, the updated guest object. 
*/
async function updateGuest(oldName, newName, newMealId)
{
    connection = mainModel.getConnection();

    if(!validateInput.isValidGuest(oldName, newName))//This validates if the information sent in is correct before continuing with the operation. Will log the error and return null if information is not correct.
    {throw new MyUserDataError();}


    const updateQuery = 'UPDATE guest SET Name = \'' + newName + '\', MealId = \'' + newMealId + '\'WHERE Name = \'' + oldName + '\''; //Query for the database.

    try
    {
        const [rows, fields] = await connection.execute(updateQuery); //Executing the query, and storing the results into [rows, fields].

        if(rows.affectedRows>0) //Checking if there were changes made in the database, and if so, then it's console logged and the updated object is returned.
        {
            logger.info("Successfully updated guest's information!"); //Console logging the changes.
            return {"oldName": oldName, "newName":newName, "newMealId":newMealId}; //Returning the updated guest object.
        }
        else if(rows.affectedRows===0)
        {
            logger.info("Couldn't update the guest's information, there's no matching badge in the registration database.")
            throw new NoExistingUserDataError();
        }
        
    }
    catch(error){
        logger.info('Error has occurred: ' + error); //If there was an error then it's caught and presented on the console.   
        throw new DatabaseAccessError();      
    }

}

/**
 * The method 'deleteGuest' will search the database for the sent-in name and delete the row it's associated with. 
 * If name is found, then the row with the guests's information is deleted.
 * If not found or the information is invalid, the return is null.
 * @param {*} guestName The guestName to be searched for in the database.
 * @returns If the search fails or invalid data is found, an error is thrown. If the search is successful, the name of the deleted guest. 
*/
async function deleteGuest(guestName)
{
    connection = mainModel.getConnection();
    
    if(!validateInput.isValidGuestName(guestName)) //This validates if the information sent in is correct before continuing with the operation. Will log the error and return null if information is not correct.
    {throw new MyUserDataError();}

    
    const deleteQuery = 'DELETE FROM guest WHERE Name = \'' + guestName +'\''; //Query for the database.

    try
    {
        const [rows, fields] = await connection.execute(deleteQuery); //Executing the query, and storing the results into [rows, fields].

        if(rows.affectedRows>0) //Checking if there were changes made in the database, and if so, then it's console logged to provide information.
        {
            logger.info("Successfully found and deleted guest information from database with guest name of: " +guestName); //Console logging the changes.
            return {"guestName":guestName}; //Returning the badge number of the deleted visitor object.
        }
        if(rows.affectedRows===0)
        {
            logger.info("Couldn't delete the guest's information, there's no matching name in the guests database.")
            throw new NoExistingUserDataError();
                
        }
      
    }
    catch(error){

        logger.info('Error has occurred: ' + error); //If there was an error then it's caught and presented on the console.   
        throw new DatabaseAccessError();      
    }

   

}

module.exports = {
    
    addGuest,
    deleteGuest,
    updateGuest,
    findGuests,
    MyUserDataError,
    NoExistingUserDataError,
    DatabaseAccessError

}