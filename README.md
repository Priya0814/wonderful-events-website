# wonderful-events
This repository contains a website designed to help people plan their events better. This was a team project of 3 people including myself and was originally published to [(https://github.com/AlexeiDanelyuk/wonderful-events-website)] by one of the team members.

It offers the user many options for planning their event:

1. Creating an event.
2. Adding songs that will be played at the event.
3. Adding guests that will coming to that event.
4. Adding what meals those guests will be eating at the event.
5. Editing all the information above.
6. Choosing between previously created events to see information about them.
7. Store all of the information on a database.

All of this functionality and more (such as selecting between French and English as the display language) is packaged in a fun and user-friendly design.

This website is coded using Node.js and Handlebars.

## Get Started Working On Files
### Add all NPM packages
`npm i express express-handlebars express-list-routes init jest mysql2 pino pino-caller pino-http pino-pretty supertest validator bcrypt cookie-parser uuid`

### Using Docker container

Create it:
`docker run -p 4242:3306 --name wonderfulEventsContainer -e MYSQL_ROOT_PASSWORD=tatltuae -e MYSQL_DATABASE=wonderful_events_db -d mysql:5.7`

Run it:
`docker container exec -it wonderfulEventsContainer`

Enter MySQL:
`mysql -u root -p`

Enter password:
`tatltuae`
