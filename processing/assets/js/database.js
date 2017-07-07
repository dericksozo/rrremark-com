"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Initialize Firebase
var config = {
    apiKey: "AIzaSyCfilMPI3GT5ujZPcowVwHFIaknVa3uc3U",
    authDomain: "rrremark-7fa66.firebaseapp.com",
    databaseURL: "https://rrremark-7fa66.firebaseio.com",
    storageBucket: "rrremark-7fa66.appspot.com",
    messagingSenderId: "27202409223"
};

firebase.initializeApp(config);

var database = firebase.database();

console.log("What's currentUser?", firebase.auth().currentUser);

var DATABASE = {

    /*
     * Gets all projects (very soon will only get projects for a specific user)
     * @param callback:Function
     */
    getProjects: function getProjects(callback) {

        console.log("DATABASE.getProjects");

        var projects = [];

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                firebase.database().ref('projectList/' + user.uid).on('value', function (snapshot) {

                    // Make sure to empty out this array so it doesn't get computed when the
                    // value function eventually gets called again.
                    projects = [];

                    console.log("What's snapshot?", snapshot);

                    snapshot.forEach(function (childSnapshot) {
                        var data = childSnapshot.val();
                        data.key = childSnapshot.getKey();
                        projects.push(data);
                    });

                    callback(projects);
                });
            }
        });
    },


    /*
     * Gets a single project (with all intentions)
     * @param projectKey:String - the key associated with the project in the database
     * @param callback:Function
     */
    getSingleProject: function getSingleProject(projectKey, callback) {
        console.log("DATABASE.getSingleProject");

        var userid = firebase.auth().currentUser.uid;

        if (userid) {
            firebase.database().ref('projects/' + userid + "/" + projectKey).once('value', function (snapshot) {
                var project = snapshot.val();
                project.key = snapshot.key;

                project.intentions.forEach(function (intention) {
                    // Setting up a couple of defaults for UI editing purposes
                    if (typeof intention.note.isEditing === "undefined") {
                        intention.note.isEditing = false;
                    }

                    // Empty todos if there aren't any
                    if (typeof intention.todos === "undefined") {
                        intention.todos = [];
                    } else {
                        intention.todos.forEach(function (todo) {
                            todo.isEditing = false;
                        });
                    }
                });

                callback(project);
                DATABASE.setDefaultProject(projectKey);
            });
        }
    },


    /* Create a new project for the current user
     * @prop projectTitle:String - The title of the new project */
    createProject: function createProject(projectTitle, callback) {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                var newProjectRef = firebase.database().ref("/projects/" + user.uid).push();
                callback(newProjectRef);
            }
        });
    },


    /* Sets the default project for the user to get upon load
     * @param projectKey:String - the string of the project
     */
    setDefaultProject: function setDefaultProject(projectKey) {
        var userid = firebase.auth().currentUser.uid;

        var updateObj = _defineProperty({}, 'defaultProjects/' + userid, projectKey);

        firebase.database().ref().update(updateObj);
    },


    /* Gets the default project for the user if there is one */
    getDefaultProject: function getDefaultProject(callback) {
        console.log("DATABASE.getDefaultProject");

        var userid = firebase.auth().currentUser.uid;

        firebase.database().ref('defaultProjects/' + userid).once('value', function (snapshot) {
            if (snapshot.val() && snapshot.val() !== "") {
                DATABASE.getSingleProject(snapshot.val(), callback);
            } else {
                callback(false);
            }
        });
    },


    /*
     * Updates the title for a project
     * @param projectKey:String - The key associated with the project
     * @param projectTitle:String - The new project title
     */
    updateProjectTitle: function updateProjectTitle(projectKey, projectTitle, callback) {
        var _updateObj2;

        var userid = firebase.auth().currentUser.uid;

        var updateObj = (_updateObj2 = {}, _defineProperty(_updateObj2, 'projectList/' + userid + "/" + projectKey + '/title', projectTitle), _defineProperty(_updateObj2, 'projects/' + userid + "/" + projectKey + '/title', projectTitle), _updateObj2);

        console.log("What's updateObj?", updateObj);

        return firebase.database().ref().update(updateObj, callback);
    },
    updateIntentionNote: function updateIntentionNote(projectKey, intentionIndex, noteText, callback) {
        console.log("Database.updateIntentionNote");

        var userid = firebase.auth().currentUser.uid;

        var updateObj = _defineProperty({}, 'projects/' + userid + "/" + projectKey + '/intentions/' + intentionIndex + '/note/text', noteText);

        console.log("What's updateObj?", updateObj);

        return firebase.database().ref().update(updateObj, callback);
    },


    /*
     * Replaces the todos array for an intention with a new todos array
     * @param projectKey:String - The key associated with the project
     * @param intentionIndex:Number - The index of the intention to update
     * @param todos:Array<Object> - The new todos array
     * @return Void
     */
    replaceTodos: function replaceTodos(projectKey, intentionIndex, todos, callback) {
        var _updateObj4;

        var userid = firebase.auth().currentUser.uid;

        var unCompletedTodos = 0,
            completedTodos = 0;

        todos.forEach(function (todo) {
            if (todo.isCompleted) {
                completedTodos += 1;
            } else {
                unCompletedTodos += 1;
            }
        });

        var updateObj = (_updateObj4 = {}, _defineProperty(_updateObj4, 'projects/' + userid + "/" + projectKey + '/intentions/' + intentionIndex + '/todos', todos), _defineProperty(_updateObj4, 'projects/' + userid + "/" + projectKey + '/completedTodos', completedTodos), _defineProperty(_updateObj4, 'projectList/' + userid + "/" + projectKey + '/completedTodos', completedTodos), _defineProperty(_updateObj4, 'projects/' + userid + "/" + projectKey + '/unCompletedTodos', unCompletedTodos), _defineProperty(_updateObj4, 'projectList/' + userid + "/" + projectKey + '/unCompletedTodos', unCompletedTodos), _updateObj4);

        return firebase.database().ref().update(updateObj, callback);
    },


    /* A wrapper function for logging the user in */
    loginInUser: function loginInUser(email, password, errorCallback) {
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
            console.log("There was an error when logging in.");
            console.log("error", error);
            errorCallback(error.message);
        });
    },
    signUpUser: function signUpUser(email, password, errorCallback) {
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
            errorCallback(error.message);
        });
    }
};
//# sourceMappingURL=database.js.map
