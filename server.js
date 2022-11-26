const app = require('./app.js');
const port = 1339;
const model = require('./models/mainModel');

let dbName = process.argv[2];
if (!dbName) {
    dbName = 'wonderful_events_db';
}

//model.initialize(dbName, false)
//    .then(
        app.listen(port) // Run the server
//    );