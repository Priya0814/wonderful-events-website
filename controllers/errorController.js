const express = require('express');
const router = express.Router();
const routeRoot = '/';

/**This function is used to display a error about the wrong page being reached. 
 * It is used in case none of the home or ComicCon endpoints don't function properly.
 * @param {*} request The HTTP request that contains the information from the client
 * @param {*} response The HTTP response that renders the warning sent to the client
 */
function giveError(request, response){
    
    const errorPageData = {alertMessage: "Error! Wrong page reached! Please go back and try again.",
    alertClass: "alert-warning"};
    response.render("error.hbs",  errorPageData );
}



router.all('*', giveError);

module.exports = {
    giveError,
    router,
    routeRoot
}