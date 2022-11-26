const express = require('express');
const router = express.Router();
const routeRoot = '/';
const signUpController = require('../controllers/signUpController');

/**
 * This function is used to display the 'homepage' of Wonderful Events using Handlebars in a visually-pleasing way. 
 * @param {*} request HTTP request given by the client for accessing the home page.
 * @param {*} response HTTP response given by the server to display the home page.
 */
function home(request, response){
    let signedIn = false;
    let welcomeSignEnglish;
    let welcomeSignFrench;
    let sessionId;
    let trackerCookie;
    let lang;

    const expiresAt = new Date(2147483647000);

    
    if (request.cookies){
        sessionId = request.cookies['sessionId'];
        trackerCookie =request.cookies['tracker']; 
        lang = request.cookies.language;
    }
    if (sessionId) {
        signedIn = true;
    }

    if(trackerCookie)
    {   response.cookie('tracker', 'Welcome back', {expires: expiresAt} );
        welcomeSignEnglish = "Welcome back";
        welcomeSignFrench = "Content de vous revoir";
    }
    else
    {      
        response.cookie('tracker', 'Welcome', {expires: expiresAt} );   
        welcomeSignEnglish = "Welcome";
        welcomeSignFrench = "Bienvenue";
    }

    const pageDataEnglish = {
        welcomeText: welcomeSignEnglish, 
        eventIdeas: [
                "Your pet panther's wedding", 
                "Your 50th wedding anniversary",
                "Duffcoin becoming the main currency of Canada", 
                "A launch party your newest album"
                ],
        isSignedIn: signedIn,
        current: "English"
    }

    const pageDataFrench = {
        welcomeText: welcomeSignFrench, 
        eventIdeas: [
                "Le mariage de votre panthère de compagnie", 
                "Votre 50e anniversaire de mariage",
                "Le Duffcoin devient la principale monnaie du Canada", 
                "Une soirée de lancement de votre nouvel album"
                ],
        isSignedIn: signedIn,
        current: "French"
    }

    if (!lang || lang === 'en') {
        response.render('home.hbs', pageDataEnglish);
    } else {
        response.render('homeFrench.hbs', pageDataFrench);
    }
}


/**
 * This function is used to display the 'about us' of Wonderful Events using Handlebars in a visually-pleasing way. 
 * @param {*} request HTTP request given by the client for accessing the home page.
 * @param {*} response HTTP response given by the server to display the home page.
 */
 function aboutUs(request, response){
    let signedIn = false;
    let welcomeSignEnglish;
    let welcomeSignFrench;
    let sessionId;
    let trackerCookie;
    let lang;

    const expiresAt = new Date(2147483647000);

    if (request.cookies){
        sessionId = request.cookies['sessionId'];
        trackerCookie =request.cookies['tracker']; 
        lang = request.cookies.language;
    }
    if (sessionId) {
        signedIn = true;
    }

    if(trackerCookie)
    {   response.cookie('tracker', 'Welcome back', {expires: expiresAt} );
        welcomeSignEnglish = "Welcome back";
        welcomeSignFrench = "Content de vous revoir";
    }
    else
    {      
        response.cookie('tracker', 'Welcome', {expires: expiresAt} );   
        welcomeSignEnglish = "Welcome";
        welcomeSignFrench = "Bienvenue";
    }

    const pageDataEnglish = {
        welcomeText: welcomeSignEnglish, 

        image1:"images/alexei.jpg",
        image2:"images/priya.jpg",
        image3:"images/lauren.jpg", 
        isSignedIn: signedIn,
        current: "English"
    }

    const pageDataFrench = {
        welcomeText: welcomeSignFrench, 

        image1:"images/alexei.jpg",
        image2:"images/priya.jpg",
        image3:"images/lauren.jpg", 
        isSignedIn: signedIn,
        current: "French"
    }

    if (!lang || lang === 'en') {
        response.render('aboutUs.hbs', pageDataEnglish);
    } else {
        response.render('aboutUsFrench.hbs', pageDataFrench);
    }
}

router.get('/', home); 
router.get('/home', home);
router.get('/aboutUs', aboutUs);


module.exports = {
    router,
    routeRoot,
    home,
    aboutUs
}