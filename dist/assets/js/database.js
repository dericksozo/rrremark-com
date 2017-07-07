// Initialize Firebase
var config = {
    apiKey: "AIzaSyCfilMPI3GT5ujZPcowVwHFIaknVa3uc3U",
    authDomain: "rrremark-7fa66.firebaseapp.com",
    databaseURL: "https://rrremark-7fa66.firebaseio.com",
    storageBucket: "rrremark-7fa66.appspot.com",
    messagingSenderId: "27202409223"
};

firebase.initializeApp(config);

const database = firebase.database();

console.log("What's currentUser?", firebase.auth().currentUser);

const DATABASE = {

    /*
     * Gets all projects (very soon will only get projects for a specific user)
     * @param callback:Function
     */
    getProjects(callback) {

        console.log("DATABASE.getProjects");

        var projects = [];

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                firebase.database().ref('projectList/' + user.uid).on('value', function (snapshot) {

                    // Make sure to empty out this array so it doesn't get computed when the
                    // value function eventually gets called again.
                    projects = [];

                    console.log("What's snapshot?", snapshot);

                    snapshot.forEach(function (childSnapshot) {
                        let data = childSnapshot.val();
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
    getSingleProject(projectKey, callback) {
        console.log("DATABASE.getSingleProject");

        const userid = firebase.auth().currentUser.uid;

        if (userid) {
            firebase.database().ref('projects/' + userid + "/" + projectKey).once('value', function (snapshot) {
                let project = snapshot.val();
                project.key = snapshot.key;

                project.intentions.forEach( intention => {
                    // Setting up a couple of defaults for UI editing purposes
                    if (typeof intention.note.isEditing === "undefined") {
                        intention.note.isEditing = false;
                    }

                    // Empty todos if there aren't any
                    if (typeof intention.todos === "undefined") {
                        intention.todos = [];
                    } else {
                        intention.todos.forEach( todo => {
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
    createProject(projectTitle, callback) {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                let newProjectRef = firebase.database().ref("/projects/" + user.uid).push();
                callback(newProjectRef);
            }
        });
    },

    /* Sets the default project for the user to get upon load
     * @param projectKey:String - the string of the project
     */
    setDefaultProject(projectKey) {
        const userid = firebase.auth().currentUser.uid;

        let updateObj = {
            ['defaultProjects/' + userid]: projectKey
        };

        firebase.database().ref().update(updateObj);
    },

    /* Gets the default project for the user if there is one */
    getDefaultProject(callback) {
        console.log("DATABASE.getDefaultProject");

        const userid = firebase.auth().currentUser.uid;

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
    updateProjectTitle(projectKey, projectTitle, callback) {

        const userid = firebase.auth().currentUser.uid;

        let updateObj = {
            ['projectList/' + userid + "/" + projectKey + '/title']: projectTitle,
            ['projects/' + userid + "/" + projectKey + '/title']: projectTitle
        };

        console.log("What's updateObj?", updateObj);

        return firebase.database().ref().update(updateObj, callback);
    },

    updateIntentionNote(projectKey, intentionIndex, noteText, callback) {
        console.log("Database.updateIntentionNote");

        const userid = firebase.auth().currentUser.uid;

        let updateObj = {
            ['projects/' + userid + "/" + projectKey + '/intentions/' + intentionIndex + '/note/text']: noteText
        };

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
    replaceTodos(projectKey, intentionIndex, todos, callback) {

        const userid = firebase.auth().currentUser.uid;

        let unCompletedTodos = 0,
            completedTodos = 0;

        todos.forEach(todo => {
            if (todo.isCompleted) {
                completedTodos += 1;
            } else {
                unCompletedTodos += 1;
            }
        });

        let updateObj = {
            ['projects/' + userid + "/" + projectKey + '/intentions/' + intentionIndex + '/todos']: todos,

            ['projects/' + userid + "/" + projectKey + '/completedTodos']: completedTodos,
            ['projectList/' + userid + "/" + projectKey + '/completedTodos']: completedTodos,

            ['projects/' + userid + "/" + projectKey + '/unCompletedTodos']: unCompletedTodos,
            ['projectList/' + userid + "/" + projectKey + '/unCompletedTodos']: unCompletedTodos
        };

        return firebase.database().ref().update(updateObj, callback);
    },

    /* A wrapper function for logging the user in */
    loginInUser(email, password, errorCallback) {
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
            console.log("There was an error when logging in.");
            console.log("error", error);
            errorCallback(error.message);
        });
    },

    signUpUser(email, password, errorCallback) {
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
            errorCallback(error.message);
        });
    }
};