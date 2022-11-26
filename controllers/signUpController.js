const express = require('express');
const loginModel = require('../models/loginModel');
const router = express.Router();
const routeRoot = '/';
const uuid = require('uuid');


/**
 * This function is used to display the 'sign in' of Wonderful Events using Handlebars in a visually-pleasing way. 
 * @param {*} request HTTP request given by the client for accessing the 'sign in' page.
 * @param {*} response HTTP response given by the server to display the 'sign in' page.
 */
function signIn(request, response){
    let lang = request.cookies.language;

    const signInPageDataEnglish = {
        action: "/signin",
        heading: "Sign In",
        fields: [
            {field:"Username", isPassword:false, body:"Username"},
            {field:"Password", isPassword:true, body:"Password"},
        ],
        text: "Don't have an account?",
        link: "/signup",
        linkText: "Sign up!",
        displayAlert: false,
        alertMessage: "",
        alertColor: ""
    }

    const signInPageDataFrench = {
        action: "/signin",
        heading: "Se Connecter",
        fields: [
            {field:"Nom d'utilisateur",  isPassword:false, body:"Username"},
            {field:"Mot de passe",  isPassword:true, body:"Password"},
        ],
        text: "Vous n'avez pas de compte?",
        link: "/signup",
        linkText: "S'inscrire!",
        displayAlert: false,
        alertMessage: "",
        alertColor: ""
    }


    if (!lang || lang === 'en') {
        response.render('signUp.hbs', signInPageDataEnglish);
    } else {
        response.render('signUpFrench.hbs', signInPageDataFrench);
    }
}

router.get('/signin', signIn); 

/**
 * This function is used to display the 'sign up' of Wonderful Events using Handlebars in a visually-pleasing way. 
 * @param {*} request HTTP request given by the client for accessing the 'sign up' page.
 * @param {*} response HTTP response given by the server to display the 'sign up' page.
 */
function signUp(request, response){
    let lang = request.cookies.language;

    const signUpPageDataEnglish = {
        action: "/signup",
        heading: "Sign Up",
        fields: [
            {field:"Username",  isPassword:false, body:"Username"},
            {field:"Password",  isPassword:true, body:"Password"},
            {field:"RePassword", isPassword:true, body:"RePassword"}
        ],
        text: "Have an account?",
        link: "/signin",
        linkText: "Sign in!",
        displayAlert: false,
        alertMessage: "",
        alertColor: ""
    }

    const signUpPageDataFrench = {
        action: "/signup",
        heading: "S'inscrire",
        fields: [
            {field:"Nom d'utilisateur",  isPassword:false, body:"Username"},
            {field:"Mot de passe",  isPassword:true, body:"Password"},
            {field:"Re-Mot de passe", isPassword:true, body:"RePassword"}
        ],
        text: "Avez un compte?",
        link: "/signin",
        linkText: "Se Connecter!",
        displayAlert: false,
        alertMessage: "",
        alertColor: ""
    }

    if (!lang || lang === 'en') {
        response.render('signUp.hbs', signUpPageDataEnglish);
    } else {
        response.render('signUpFrench.hbs', signUpPageDataFrench);
    }
}

router.get('/signup', signUp); 



const sessions = {}

/**
 * Class response for the a session.
 */
class Session {
    constructor(username, userId, expiresAt) {
        this.username = username;
        this.userId = userId;
        this.expiresAt = expiresAt;
    }
    isExpired() {
        return this.expiresAt < (new Date());
    }
}

/**
 * Create a new session for the user.
 * @param {*} username The username of the user.
 * @param {*} userId The user id if of the user.
 * @param {*} numMinutes The duration of the session in minutes.
 * @returns The session id.
 */
function createSession(username, userId, numMinutes) {
    const sessionId = uuid.v4();

    const expiresAt = new Date(Date.now() + (numMinutes * 60000));
    const thisSession = new Session(username, userId, expiresAt);

    sessions[sessionId] = thisSession;
    return sessionId;
}

/**
 * Authenticate the user. In other words, find out if the user session has not yet expired.
 * @param {*} request HTTP request object.
 * @returns Null if session has expired, session id and userSession object otherwise.
 */
function authenticateUser(request){
    if (!request.cookies) {
        return null;
    }

    const sessionId = request.cookies['sessionId'];
    if (!sessionId) {
        return null;
    }

    let userSession = sessions[sessionId];
    if (!userSession) {
        return null;
    }

    if (userSession.isExpired()) {
        delete session[sessionId];
        return null;
    }

    return {sessionId, userSession};
}

/**
 * Refresh the session (used any time the user does anything).
 * @param {*} request The HTTP request object.
 * @param {*} response The HTTP response.
 * @returns True if session has not yet run out, false otherwise.
 */
function refreshSession(request, response) {
    const authenticatedSession = authenticateUser(request);
    if (!authenticatedSession) {
        let lang = request.cookies.language;

        const signInPageDataEnglish = {
            action: "/signin",
            heading: "Sign In",
            fields: [
                {field:"Username", isPassword:false, body:"Username"},
                {field:"Password", isPassword:true, body:"Password"},
            ],
            text: "Don't have an account?",
            link: "/signup",
            linkText: "Sign up!",
            displayAlert: true,
            alertMessage: "Your session has timed out. Please sign in again.",
            alertColor: "#f05858"
        }
    
        const signInPageDataFrench = {
            action: "/signin",
            heading: "Se Connecter",
            fields: [
                {field:"Nom d'utilisateur",  isPassword:false, body:"Username"},
                {field:"Mot de passe",  isPassword:true, body:"Password"},
            ],
            text: "Vous n'avez pas de compte?",
            link: "/signup",
            linkText: "S'inscrire!",
            displayAlert: true,
            alertMessage: "Votre session a expiré. Veuillez vous reconnecter.",
            alertColor: "#f05858"
        }
    
        if (!lang || lang === 'en') {
            response.render('signUp.hbs', signInPageDataEnglish);
        } else {
            response.render('signUpFrench.hbs', signInPageDataFrench);
        }
        return false;
    }
    // Create and store a new Session object that will expire in 2 minutes.
    const newSessionId = createSession(authenticatedSession.userSession.username, authenticatedSession.userSession.userId, 5);
    // Delete the old entry in the session map 
    delete sessions[authenticatedSession.sessionId];

    // Set the session cookie to the new id we generated, with a
    // renewed expiration time
    console.log(sessions[newSessionId]);
    response.cookie("sessionId", newSessionId, { expires: sessions[newSessionId].expiresAt })
    response.cookie("userId", sessions[newSessionId].userId, {expires: sessions[newSessionId].expiresAt});
    return true;
}

/**
 * The request from the user to sign up.
 * @param {*} request Should contain the username, password, and re-entered password.
 * @param {*} response Sign up page if unsuccessful sign up, home page otherwise.
 */
async function signUpRequest(request, response) {
    try {
        const username = request.body.Username;
        const password = request.body.Password;
        const repassword = request.body.RePassword;

        let userId = 0;
        if (username && password && password === repassword){
            userId = await loginModel.signUp(username, password);
            //.then(user => {console.log("success")}).catch((error)=>{console.log(error)});
        }
        else {
            throw new Error();
        }

        const sessionId = createSession(username, userId, 5);
    
        response.cookie("sessionId", sessionId, {expires: sessions[sessionId].expiresAt});
        response.cookie("userId", userId, {expires: sessions[sessionId].expiresAt});
        response.redirect("/");
    }
    catch (error) {
        let lang = request.cookies.language;

        const signUpPageDataEnglish = {
            action: "/signup",
            heading: "Sign Up",
            fields: [
                {field:"Username",  isPassword:false, body:"Username"},
                {field:"Password",  isPassword:true, body:"Password"},
                {field:"RePassword", isPassword:true, body:"RePassword"}
            ],
            text: "Have an account?",
            link: "/signin",
            linkText: "Sign in!",
            displayAlert: true,
            alertMessage: "Invalid input.",
            alertColor: "#f05858"
        }

        const signUpPageDataFrench = {
            action: "/signup",
            heading: "S'inscrire",
            fields: [
                {field:"Nom d'utilisateur",  isPassword:false, body:"Username"},
                {field:"Mot de passe",  isPassword:true, body:"Password"},
                {field:"Re-Mot de passe", isPassword:true, body:"RePassword"}
            ],
            text: "Avez un compte?",
            link: "/signin",
            linkText: "Se Connecter!",
            displayAlert: true,
            alertMessage: "Entrée invalide.",
            alertColor: "#f05858"
        }

        if (error instanceof loginModel.InvalidUsernameError) {
            signUpPageDataEnglish.alertMessage = "Invalid username. Please try again.";
            signUpPageDataFrench.alertMessage = "Nom d'utilisateur invalide. Veuillez réessayer.";
        }
        else if (error instanceof loginModel.InvalidPasswordError) {
            signUpPageDataEnglish.alertMessage = "Invalid password. Please try again.";
            signUpPageDataFrench.alertMessage = "Mot de passe invalide. Veuillez réessayer.";
        }
        else if (error instanceof loginModel.UsernameTakenError) {
            signUpPageDataEnglish.alertMessage = "Username is taken. Please choose a different one.";
            signUpPageDataFrench.alertMessage = "Le nom d'utilisateur est pris. Veuillez en choisir un autre.";
        }
        else if (error instanceof loginModel.SystemError) {
            signUpPageDataEnglish.alertMessage = "A system error occurred."
            signUpPageDataFrench.alertMessage = "Une erreur système s'est produite.";
        }

        if (!lang || lang === 'en') {
            response.render('signUp.hbs', signUpPageDataEnglish);
        } else {
            response.render('signUpFrench.hbs', signUpPageDataFrench);
        }
    }
}

router.post('/signup', signUpRequest);

/**
 * The request from the user to sign in.
 * @param {*} request Should contain the username and password.
 * @param {*} response Sign in page if unsuccessful sign in, home page otherwise.
 */
async function signInRequest(request, response) {
    try {
        const username = request.body.Username;
        const password = request.body.Password;
    
        let userId = await loginModel.signIn(username, password);
        const sessionId = createSession(username, userId, 5);

        response.cookie("sessionId", sessionId, {expires: sessions[sessionId].expiresAt});
        response.cookie("userId", userId, {expires: sessions[sessionId].expiresAt});
        response.redirect("/");
    } catch (error) {
        let lang = request.cookies.language;

        const signInPageDataEnglish = {
            action: "/signin",
            heading: "Sign In",
            fields: [
                {field:"Username",  isPassword:false, body:"Username"},
                {field:"Password",  isPassword:true, body:"Password"},
            ],
            text: "Don't have an account?",
            link: "/signup",
            linkText: "Sign up!",
            displayAlert: true,
            alertMessage: "Error signing in. Please try again.",
            alertColor: "#f05858"
        }

        const signInPageDataFrench = {
            action: "/signin",
            heading: "Se Connecter",
            fields: [
                {field:"Nom d'utilisateur",  isPassword:false, body:"Username"},
                {field:"Mot de passe",  isPassword:true, body:"Password"},
            ],
            text: "Vous n'avez pas de compte?",
            link: "/signup",
            linkText: "S'inscrire!",
            displayAlert: true,
            alertMessage: "Erreur lors de la connexion. Veuillez réessayer.",
            alertColor: "#f05858"
        }

        if (error instanceof loginModel.InvalidUsernameError) {
            signInPageDataEnglish.alertMessage = "Invalid username. Please try again.";
            signInPageDataFrench.alertMessage = "Nom d'utilisateur invalide. Veuillez réessayer.";
        }
        else if (error instanceof loginModel.InvalidPasswordError) {
            signInPageDataEnglish.alertMessage = "Invalid password. Please try again.";
            signInPageDataFrench.alertMessage = "Mot de passe invalide. Veuillez réessayer.";
        }
        else if (error instanceof loginModel.SystemError) {
            signInPageDataEnglish.alertMessage = "A system error occurred."
            signInPageDataFrench.alertMessage = "Une erreur système s'est produite.";

        }

        if (!lang || lang === 'en') {
            response.render('signUp.hbs', signInPageDataEnglish);
        } else {
            response.render('signUpFrench.hbs', signInPageDataFrench);
        }
    }
}

router.post('/signin', signInRequest);

/**
 * Sign out the user.
 * @param {*} request A simple get request from the user.
 * @param {*} response The home page if successful.
 * @returns Nothing.
 */
async function signOutRequest(request, response) {
    try {
        const authenticatedSession = authenticateUser(request);
        if (!authenticatedSession) {
            response.redirect('/');
            return;
        }
        delete sessions[authenticatedSession.sessionId]
        console.log("Logged out user " + authenticatedSession.userSession.username);
        
        response.cookie("sessionId", "", { expires: new Date() });
        response.cookie("userId", "", { expires: new Date() });
        response.redirect('/');
    } catch (error) {
        response.render("home.hbs");
    }

}

router.get('/signout', signOutRequest);


module.exports = {
    router,
    routeRoot,
    signIn,
    signUp,
    signUpRequest,
    authenticateUser,
    createSession,
    refreshSession,
    Session,
    signInRequest,
    signOutRequest
}