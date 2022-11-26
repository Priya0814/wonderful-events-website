const eventModel = require('../models/eventModel');
const mainModel = require('../models/mainModel');
const loginModel = require('../models/loginModel');
const songModel = require('../models/songModel');
const guestModel = require('../models/guestModel');
const mealModel = require('../models/mealModel');
const logger = require('../logger');
const dbName = "wonderful_events_db_test";

beforeEach(async () => {
    try {
        await mainModel.initialize(dbName, true);
        const addUserSql = "INSERT INTO user (Username, Password) VALUES ('user','pass');";
        await mainModel.getConnection().execute(addUserSql);
    } catch (err) {
        console.error(err);
    }
});

afterEach(async () => {
    connection = mainModel.getConnection();
    if (connection)
        await connection.close();
});


// create event function
//----------------------------------------------------------------
test("Test createEvent in model (SUCCESS)", async () => {
    await mainModel.initialize(dbName, true);
    const addUserSql = "INSERT INTO user (Username, Password) VALUES ('user','pass');";
    await mainModel.getConnection().execute(addUserSql);

    const name = "Graduation";
    const date = "2023-05-20";
    const location = "JAC";
    await eventModel.createEvent(name, date, location, 1);

    const selectQuery = "SELECT * FROM event";
    const [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe(name);
    expect((rows[0].Date+"").substring(0,15)).toBe("Sat May 20 2023");
    expect(rows[0].Location).toBe(location);
});

test("Test createEvent in model (FAIL)", async () => {
    const name = "Graduation";
    const date = "20/05/2023"; // incorrect format
    const location = "JAC";

    try {
        await eventModel.createEvent(name, date, location, 1);
    } catch(error) {
        expect(error instanceof eventModel.InvalidInputError).toBe(true);
    }
});

// delete event function
//----------------------------------------------------------------
test("Test deleteEvent in model (SUCCESS)", async () => {
    // add
    const name = "Graduation";
    const date = "2023-05-20";
    const location = "JAC";
    await eventModel.createEvent(name, date, location, 1);

    let selectQuery = "SELECT * FROM event";
    let [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe(name);
    expect((rows[0].Date+"").substring(0,15)).toBe("Sat May 20 2023");
    expect(rows[0].Location).toBe(location);

    // deleteEvent
    await eventModel.deleteEvent(1);

    selectQuery = "SELECT * FROM event";
    [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(0);
});

test("Test deleteEvent in model (FAIL)", async () => {
    // add
    const name = "Graduation";
    const date = "2023-05-20";
    const location = "JAC";
    await eventModel.createEvent(name, date, location, 1);

    let selectQuery = "SELECT * FROM event";
    let [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe(name);
    expect((rows[0].Date+"").substring(0,15)).toBe("Sat May 20 2023");
    expect(rows[0].Location).toBe(location);

    // deleteEvent
    await eventModel.deleteEvent(3); // invalid id

    selectQuery = "SELECT * FROM event";
    [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
});

// update event function
//----------------------------------------------------------------
test("Test updateEvent in model (SUCCESS)", async () => {
    // add
    const name = "Graduation";
    const date = "2023-05-20";
    const location = "JAC";
    await eventModel.createEvent(name, date, location, 1);

    let selectQuery = "SELECT * FROM event";
    let [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe(name);
    expect((rows[0].Date+"").substring(0,15)).toBe("Sat May 20 2023");
    expect(rows[0].Location).toBe(location);

    // updateEvent
    await eventModel.updateEvent(1, "Wedding", "2023-05-20", "River");

    selectQuery = "SELECT * FROM event";
    [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe("Wedding");
    expect((rows[0].Date+"").substring(0,15)).toBe("Sat May 20 2023");
    expect(rows[0].Location).toBe("River");
});

test("Test updateEvent in model (FAIL)", async () => {
    // add
    const name = "Graduation";
    const date = "2023-05-20";
    const location = "JAC";
    await eventModel.createEvent(name, date, location, 1);

    let selectQuery = "SELECT * FROM event";
    let [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe(name);
    expect((rows[0].Date+"").substring(0,15)).toBe("Sat May 20 2023");
    expect(rows[0].Location).toBe(location);

    // updateEvent
    await eventModel.updateEvent(0, "Wedding", "2023-05-20", "River"); // invalid id

    selectQuery = "SELECT * FROM event";
    [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe(name);
    expect((rows[0].Date+"").substring(0,15)).toBe("Sat May 20 2023");
    expect(rows[0].Location).toBe(location);
});

// getAllEvents function
//----------------------------------------------------------------
test("Test getAllEvents in model (SUCCESS)", async () => {
    const name = "Graduation";
    const date = "2023-05-20";
    const location = "JAC";
    await eventModel.createEvent(name, date, location, 1);

    let rows = await eventModel.getAllEvents(1);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe(name);
    expect((rows[0].Date+"").substring(0,15)).toBe("Sat May 20 2023");
    expect(rows[0].Location).toBe(location);
});

test("Test getAllEvents in model (FAIL)", async () => {
    const name = "Graduation";
    const date = "2023-05-20";
    const location = "JAC";
    await eventModel.createEvent(name, date, location, 1);

    let rows = await eventModel.getAllEvents(0);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(0);
});

// ----------------------------------------------
//  LOGIN MODEL
// ----------------------------------------------

// signUp function (this also test sign in at the same time)
//----------------------------------------------------------------
test("Test singUp in model (SUCCESS)", async () => {
    let userId = await loginModel.signUp("helloworld", "helloworld", "helloworld");

    const selectQuery = "SELECT * FROM user";
    const [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(2);
    expect(rows[1].Username).toBe("helloworld");
    expect(userId+"").toBe("2");
});

test("Test singUp in model (FAIL)", async () => {
    try {
        let userId = await loginModel.signUp("helloworld", "h", "h");
    } catch (error) {
        expect(error instanceof loginModel.InvalidPasswordError).toBe(true);
    }
});


// ----------------------------------------------
//  SONGS MODEL
// ----------------------------------------------

// addSong function
//---------------------------------
test("Test addSong (SUCCESS)", async () => {
    const addEventSql = "INSERT INTO event (Name, Date, Location, UserId) VALUES ('event','2022-05-18', 'here', 1);";
    await mainModel.getConnection().execute(addEventSql);

    const name = "gone";
    const artist = "bbno$";
    const genre = "rap";
    await songModel.addSong(name, artist, genre, 1);

    const selectQuery = "SELECT * FROM song;";
    const [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe(name);
    expect(rows[0].Artist).toBe(artist);
    expect(rows[0].Genre).toBe(genre);
});

test("Test addSong (FAIL)", async () => {
    const addEventSql = "INSERT INTO event (Name, Date, Location, UserId) VALUES ('event','2022-05-18', 'here', 1);";
    await mainModel.getConnection().execute(addEventSql);

    const name = "gone";
    const artist = "bbno$";
    const genre = "rap";

    try {
        await songModel.addSong(name, 5, genre, 1);
    } catch (error) {
        expect(error instanceof songModel.InvalidInputError).toBe(true);
    }
});

test("Test addSong (FAIL)", async () => {
    const addEventSql = "INSERT INTO event (Name, Date, Location, UserId) VALUES ('event','2022-05-18', 'here', 1);";
    await mainModel.getConnection().execute(addEventSql);

    const name = "gone";
    const artist = "bbno$";
    const genre = "rap";

    try {
        await songModel.addSong(name, artist, "green", 1);
    } catch (error) {
        expect(error instanceof songModel.InvalidInputError).toBe(true);
    }
});

// deleteSong function
//--------------------------------------------------
test("Test deleteSong (SUCCESS)", async () => {

    // create
    const addEventSql = "INSERT INTO event (Name, Date, Location, UserId) VALUES ('event','2022-05-18', 'here', 1);";
    await mainModel.getConnection().execute(addEventSql);

    const name = "gone";
    const artist = "bbno$";
    const genre = "rap";

    await songModel.addSong(name, artist, genre, 1);

    let selectQuery = "SELECT * FROM song;";
    let [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe(name);
    expect(rows[0].Artist).toBe(artist);
    expect(rows[0].Genre).toBe(genre);

    // delete
    await songModel.deleteSong(1);
    selectQuery = "SELECT * FROM song;";
    [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(0);
});

test("Test deleteSong (FAIL)", async () => {

    // create
    const addEventSql = "INSERT INTO event (Name, Date, Location, UserId) VALUES ('event','2022-05-18', 'here', 1);";
    await mainModel.getConnection().execute(addEventSql);

    const name = "gone";
    const artist = "bbno$";
    const genre = "rap";

    await songModel.addSong(name, artist, genre, 1);

    let selectQuery = "SELECT * FROM song;";
    let [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe(name);
    expect(rows[0].Artist).toBe(artist);
    expect(rows[0].Genre).toBe(genre);

    // delete
    await songModel.deleteSong(0);
    selectQuery = "SELECT * FROM song;";
    [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe(name);
    expect(rows[0].Artist).toBe(artist);
    expect(rows[0].Genre).toBe(genre);
});

// updateSong function
//----------------------------------
test("Test updateSong (SUCCESS)", async () => {

    // create
    const addEventSql = "INSERT INTO event (Name, Date, Location, UserId) VALUES ('event','2022-05-18', 'here', 1);";
    await mainModel.getConnection().execute(addEventSql);

    const name = "gone";
    const artist = "bbno$";
    const genre = "rap";

    await songModel.addSong(name, artist, genre, 1);

    let selectQuery = "SELECT * FROM song;";
    let [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe(name);
    expect(rows[0].Artist).toBe(artist);
    expect(rows[0].Genre).toBe(genre);

    // update
    await songModel.updateSong(1, "Good Luck", "Broken Bells", "indie");
    [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe("Good Luck");
    expect(rows[0].Artist).toBe("Broken Bells");
    expect(rows[0].Genre).toBe("indie");
});

test("Test updateSong (FAIL)", async () => {

    // create
    const addEventSql = "INSERT INTO event (Name, Date, Location, UserId) VALUES ('event','2022-05-18', 'here', 1);";
    await mainModel.getConnection().execute(addEventSql);

    const name = "gone";
    const artist = "bbno$";
    const genre = "rap";

    await songModel.addSong(name, artist, genre, 1);

    let selectQuery = "SELECT * FROM song;";
    let [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe(name);
    expect(rows[0].Artist).toBe(artist);
    expect(rows[0].Genre).toBe(genre);

    // update
    await songModel.updateSong(0, name, artist, genre);
    [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Name).toBe(name);
    expect(rows[0].Artist).toBe(artist);
    expect(rows[0].Genre).toBe(genre);
});

// getAllSongs function
//----------------------------------
test("Test getAllSongs (SUCCESS)", async () => {
    const addEventSql = "INSERT INTO event (Name, Date, Location, UserId) VALUES ('event','2022-05-18', 'here', 1);";
    await mainModel.getConnection().execute(addEventSql);

    await songModel.addSong("MONTERO", "Lil Nas X", "pop", 1);
    await songModel.addSong("INDUSTRY BABY", "Lil Nas X", "pop", 1);
    await songModel.addSong("sorry", "bbno$", "rap", 1);
    await songModel.addSong("DONT WANT IT", "Lil Nas X", "rap", 1);

    const songs = await songModel.getAllSongs(1);

    expect(Array.isArray(songs)).toBe(true);
    expect(songs.length).toBe(4);
    expect(songs[0].Name).toBe("MONTERO");
    expect(songs[0].Artist).toBe("Lil Nas X");
    expect(songs[0].Genre).toBe("pop");
    expect(songs[1].Name).toBe("INDUSTRY BABY");
    expect(songs[1].Artist).toBe("Lil Nas X");
    expect(songs[1].Genre).toBe("pop");
    expect(songs[2].Name).toBe("sorry");
    expect(songs[2].Artist).toBe("bbno$");
    expect(songs[2].Genre).toBe("rap");
    expect(songs[3].Name).toBe("DONT WANT IT");
    expect(songs[3].Artist).toBe("Lil Nas X");
    expect(songs[3].Genre).toBe("rap");
});

test("Test getAllSongs (FAIL)", async () => {
    const addEventSql = "INSERT INTO event (Name, Date, Location, UserId) VALUES ('event','2022-05-18', 'here', 1);";
    await mainModel.getConnection().execute(addEventSql);

    await songModel.addSong("Baggage", "Rare Americans", "indie", 1);
    await songModel.addSong("Stolen Dance", "Milky Chance", "indie", 1);
    await songModel.addSong("sorry", "bbno$", "rap", 1);
    await songModel.addSong("End of It", "Friday Pilots Club", "indie", 1);

    const songs = await songModel.getAllSongs(0);

    expect(Array.isArray(songs)).toBe(true);
    expect(songs.length).toBe(0);
});



// ----------------------------------------------
//  GUEST MODEL
// ----------------------------------------------

//------ Testing the Add Guest Function ------//


/**This test is a successful case where the Visitor can be added to the database. Expecting a Visitor object to be returned.*/
test("Success case: Can add a Guest to the database", async () => {
    
    HelperEvent();

    HelperMeal();

    let name = "Chris";
    let mealId = 1;
    let eventId = 1;
    const addedPerson = await guestModel.addGuest(name, eventId, mealId);

    const selectQuery = "SELECT * FROM guest";
    const [rows, fields] = await mainModel.getConnection().execute(selectQuery); //Executing the query, and if it's successful then it returns a Visitor object


    expect(Array.isArray(rows)).toBe(true);//Checking that there is an array returned
    expect(rows.length).toBe(1); //Checking the array length to be a size of 1 and only 1    
    expect(typeof {rows}).toBe('object'); //Checking that a Visitor object is an object
    expect(rows[0].Name.toLowerCase() === addedPerson.guestName.toLowerCase()).toBe(true); //Checking the name is correct format and matches the name
    expect(rows[0].MealId === addedPerson.mealId).toBe(true); //Checking the meal Ids are the same value
    
    logger.info("Successfully added a guest to the event!");

 });


 test("Fail case: can't add a guest to the database with invalid name type", async () => {
    
    await HelperEvent(); 
    await HelperMeal(); 

    let name = "Sh@un";
    let mealId = 1;
    let eventId = 1;
     

    try{
        await guestModel.addGuest(name, eventId, mealId); //Executing the function 
    }
    catch(err) {{
        expect(err instanceof guestModel.MyUserDataError).toBe(true);
    }}  

    const selectQuery = "SELECT * FROM guest";
    const [rows, fields] = await mainModel.getConnection().execute(selectQuery); //Executing the query, and if it's successful then it returns a Visitor object

    expect(Array.isArray(rows)).toBe(true);//Checking if an array is returned
    expect(rows.length).toBe(0); //Checking the array length to be a size of 0   
    expect(rows.typeof).toBeUndefined(); //Expecting the value in 'rows' to be undefined
    logger.info("Guest with improper name type wasn't added to database!");

 });



//------ Testing the Update Guest Function ------//

/**This test is a success case where the Guest name is found and their information is updated.*/
test("Success case: updating a Guest's name", async () => {
    
    await HelperEvent(); 
    await HelperMeal(); 

    let oldName = "Rick"; //Temporarily used guest name
    let newName = "Bernie";
    let mealId = 1;
    let eventId = 1;

    await guestModel.addGuest(oldName, eventId, mealId); //Temporarily adding a guest to be updated later    
    await guestModel.updateGuest(oldName, newName, mealId); //Executing the function and if it succeeds then information is updated  
   
    const selectQuery = 'SELECT * FROM guest WHERE Name = \'' + newName +'\''; //The query to search the database 
    const person = await mainModel.getConnection().execute(selectQuery); //Searching the database for the person 
 
    expect(typeof {person}).toBe('object'); //Checking that a Visitor object is an object
    expect.objectContaining({mealId: 1});
    expect.objectContaining({name: "Bernie"});
    
     logger.info("Successfully updated the guest in the guest table!");

 });

 /**This test is a failure case where the Guest's new name isn't the correct format and their information isn't updated.*/
test("Failed case: updating a Guest's name", async () => {
 
    await HelperEvent(); 
    await HelperMeal();

    let oldName = "Sara"; //Temporarily used guest name
    let newName = "L@n@";
    let mealId = 1;
    let eventId = 1;

    await guestModel.addGuest(oldName, eventId, mealId); //Temporarily adding a guest to be updated later
    
    try{
        await guestModel.updateGuest(oldName, newName, mealId); //Executing the function 
    }
    catch(err) {{
        expect(err instanceof guestModel.MyUserDataError).toBe(true);
    }}  
   
    const selectQuery = 'SELECT * FROM guest WHERE Name = \'' + newName +'\''; //The query to search the database 
    const [rows, fields]  = await mainModel.getConnection().execute(selectQuery); //Searching the database for the person 
 
       
    expect(Array.isArray(rows)).toBe(true);//Checking if an array is returned
    expect(rows.length).toBe(0); //Checking the array length to be a size of 0
    expect(rows.typeof).toBeUndefined(); //Expecting the value in 'rows' to be undefined
    logger.info("Guest with improper name type wasn't added to database!");


 });

//------ Testing the Delete Guest Function ------//

 /**This test is a success case where the Guest is successfully deleted from the guest table.*/
 test("Success case: deleting a Guest from the database", async () => {
 
    await HelperEvent(); 
    await HelperMeal();

    let name = "Jessie";
    let mealId = 1;
    let eventId = 1;
    await guestModel.addGuest(name, eventId, mealId); //Adding someone temporarily so we can delete them

    await guestModel.deleteGuest(name); //Executing the function and if it succeeds then information is updated  
   
    const selectQuery = 'SELECT * FROM guest WHERE Name = \'' + name +'\''; //The query to search the database 
    const personDeleted = await mainModel.getConnection().execute(selectQuery); //Searching the database for the person 
 
    expect(typeof {personDeleted}).toBe('object');
    expect(personDeleted).not.toContain('Jessie'); //Checking that the personDeleted is an object
 
    console.log("Delete successful!");

 });

  /**This test is a failed case where the Guest is not deleted from the guest table.*/
  test("Failed case: not deleting a Guest from the database", async () => {
    
    await HelperEvent(); 
    await HelperMeal();

    let name = "Regis";
    let wrongName = "Re@is";
    let mealId = 1;
    let eventId = 1;
    await guestModel.addGuest(name, eventId, mealId); //Adding someone temporarily so we can delete them

        
    try{
        await guestModel.deleteGuest(wrongName); 
    }
    catch(err) {{
        expect(err instanceof guestModel.MyUserDataError).toBe(true);
    }}    
   
    const selectQuery = 'SELECT * FROM guest WHERE Name = \'' + name +'\''; //The query to search the database 
    const [rows, fields] = await mainModel.getConnection().execute(selectQuery); //Searching the database for the person 
   
    expect(Array.isArray(rows)).toBe(true);//Checking if an array is returned
    expect(rows.length).toBe(1); //Checking the array length to be a size of 0   
    expect(typeof {rows}).toBe('object'); //Expecting the value in 'rows' to be undefined  
    logger.info("Delete function failed!");

 });


//------ Testing the Read All Guests Function ------//

 /**This test is a success case where there are guests in the table for a specific event.*/
 test("Success case: retrieving a list of guests from the database", async () => {
    
    await HelperEvent(); 
    await HelperMeal();

    //Inputting 3 guests so there's a list of guests returned
    await guestModel.addGuest("Jesse", 1, 1); 
    await guestModel.addGuest("May", 1, 1); 
    await guestModel.addGuest("Zack", 1, 1); 

    let rows = await guestModel.findGuests(1); //Executing the function, and we should expect 3 entries
   
 
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(3);  
   
    logger.info(" Retrieval successful!");

 });


// ----------------------------------------------
//  MEALS MODEL
// ----------------------------------------------

// addMeal function
//---------------------------------
test("Test addMeal (SUCCESS)", async () => {

    HelperEvent();

    const main = "pizza";
    const drink = "pepsi";
    const vegan = 0; //using 0 and 1 for true and false
    await mealModel.addMeal(main, drink, vegan, 1);

    const selectQuery = "SELECT * FROM meal;";
    const [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Main).toBe(main);
    expect(rows[0].Drink).toBe(drink);
    expect(rows[0].Vegan).toBe(vegan);
});

test("Test addMeal with Invalid Drink (FAIL)", async () => {

    HelperEvent();

    const main = "pizza";
    const drink = "pepsi2"; //using invalid drink
    const vegan = 0;

    try {
        await mealModel.addMeal(main, drink, vegan, 1);
    } catch (error) {
        expect(error instanceof mealModel.InvalidInputError).toBe(true);
    }

    const selectQuery = "SELECT * FROM meal";
    const [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(0); //Checking the array length to be a size of 0   
    expect(rows.typeof).toBeUndefined(); //Expecting the value in 'rows' to be undefined
});

test("Test addMeal with Invalid name (FAIL)", async () => {

    HelperEvent();

    const main = 123; //using invalid drink
    const drink = "pepsi";
    const vegan = 0;

    try {
        await mealModel.addMeal(main, drink, vegan, 1);
    } catch (error) {
        expect(error instanceof mealModel.InvalidInputError).toBe(true);
    }

    const selectQuery = "SELECT * FROM meal";
    const [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(0); //Checking the array length to be a size of 0   
    expect(rows.typeof).toBeUndefined(); //Expecting the value in 'rows' to be undefined
});

// // deleteMeal function
// //--------------------------------------------------
test("Test deleteMeal (SUCCESS)", async () => {

    HelperEvent();

    const main = "pizza";
    const drink = "pepsi";
    const vegan = 0; //using 0 and 1 for true and false

    await mealModel.addMeal(main, drink, vegan, 1);

    let selectQuery = "SELECT * FROM meal;";
    let [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Main).toBe(main);
    expect(rows[0].Drink).toBe(drink);
    expect(rows[0].Vegan).toBe(vegan);

    // delete
    await mealModel.deleteMeal(1);
    selectQuery = "SELECT * FROM meal;";
    [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(0);
});

test("Test deleteMeal (FAIL)", async () => {

    HelperEvent();

    const main = "pizza";
    const drink = "pepsi";
    const vegan = 0; //using 0 and 1 for true and false

    await mealModel.addMeal(main, drink, vegan, 1);

    
    let selectQuery = "SELECT * FROM meal;";
    let [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Main).toBe(main);
    expect(rows[0].Drink).toBe(drink);
    expect(rows[0].Vegan).toBe(vegan);

    // delete
    await mealModel.deleteMeal(0);
    selectQuery = "SELECT * FROM meal;";
    [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Main).toBe(main);
    expect(rows[0].Drink).toBe(drink);
    expect(rows[0].Vegan).toBe(vegan);
});

// // updateMeal function
// //----------------------------------
test("Test updateMeal (SUCCESS)", async () => {

    HelperEvent();

    const main = "pizza";
    const drink = "pepsi";
    const vegan = 0; //using 0 and 1 for true and false

    await mealModel.addMeal(main, drink, vegan, 1);

    let selectQuery = "SELECT * FROM meal;";
    let [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Main).toBe(main);
    expect(rows[0].Drink).toBe(drink);
    expect(rows[0].Vegan).toBe(vegan);

    // update
    const newMain = "fries";
    const newDrink = "coke";
    const newVegan = 1; //using 0 and 1 for true and false

    await mealModel.updateMeal(1, newMain, newDrink, newVegan);
    [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Main).toBe(newMain);
    expect(rows[0].Drink).toBe(newDrink);
    expect(rows[0].Vegan).toBe(newVegan);
});

test("Test updateMeal (FAIL)", async () => {

    HelperEvent();

    const main = "pizza";
    const drink = "pepsi";
    const vegan = 0; //using 0 and 1 for true and false

    await mealModel.addMeal(main, drink, vegan, 1);

    let selectQuery = "SELECT * FROM meal;";
    let [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Main).toBe(main);
    expect(rows[0].Drink).toBe(drink);
    expect(rows[0].Vegan).toBe(vegan);

    // update
    const newMain = "fries";
    const newDrink = "coke";
    const newVegan = 1; //using 0 and 1 for true and false

    await mealModel.updateMeal(0, newMain, newDrink, newVegan);
    [rows, fields] = await mainModel.getConnection().execute(selectQuery);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].Main).toBe(main);
    expect(rows[0].Drink).toBe(drink);
    expect(rows[0].Vegan).toBe(vegan);
});

// getAllMeals function
//----------------------------------
test("Test getAllMeals (SUCCESS)", async () => {

    HelperEvent();

    await mealModel.addMeal("pizza", "coke", 0, 1);
    await mealModel.addMeal("fries", "pepsi", 1, 1);
    await mealModel.addMeal("burger", "sprite", 0, 1);
    await mealModel.addMeal("spaghetti", "juice", 0, 1);

    const meals = await mealModel.getAllMeals(1);

    expect(Array.isArray(meals)).toBe(true);
    expect(meals.length).toBe(4);
    expect(meals[0].Main).toBe("pizza");
    expect(meals[0].Drink).toBe("coke");
    expect(meals[0].Vegan).toBe(0);
    expect(meals[1].Main).toBe("fries");
    expect(meals[1].Drink).toBe("pepsi");
    expect(meals[1].Vegan).toBe(1);
    expect(meals[2].Main).toBe("burger");
    expect(meals[2].Drink).toBe("sprite");
    expect(meals[2].Vegan).toBe(0);
    expect(meals[3].Main).toBe("spaghetti");
    expect(meals[3].Drink).toBe("juice");
    expect(meals[3].Vegan).toBe(0);
});

test("Test getAllMeals (FAIL)", async () => {

    HelperEvent();

    await mealModel.addMeal("pizza", "coke", 0, 1);
    await mealModel.addMeal("fries", "pepsi", 1, 1);
    await mealModel.addMeal("burger", "sprite", 0, 1);
    await mealModel.addMeal("spaghetti", "juice", 0, 1);

    const meals = await mealModel.getAllMeals(0);

    expect(Array.isArray(meals)).toBe(true);
    expect(meals.length).toBe(0);
});

// ----------------------------------------------
//  HELPER FUNCTIONS
// ----------------------------------------------

 /**
  * This is a HelperEvent function that's supposed to make an event to be used for testing out the
  * guests since they rely on eventId and mealId as foreign keys in the guest table.
  */
 async function HelperEvent(){
   
    const insertQuery1 = "INSERT INTO event(Name, Date, Location, UserId) VALUES('Party', '2023-01-01', 'Club', '1');";
    await mainModel.getConnection().execute(insertQuery1).then(logger.info("Created temporary event table"));
}

 /**
  * This is a HelperEvent function that's supposed to make a meal to be used for testing out the
  * guests since they rely on eventId and mealId as foreign keys in the guest table.
  */
async function HelperMeal(){

    const insertQuery2 = "INSERT INTO meal(Main, Drink, Vegan, EventId) VALUES('Falafel', 'Soda', 1, '1');";
    await mainModel.getConnection().execute(insertQuery2).then(logger.info("Created temporary meal table"));
}