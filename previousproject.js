let Project = new Vue({
    el: "#vue_project",
    data: {
        project: BLANK_PROJECT,
        showProjectStats: true,
        editingProjectTitle: true,
        calculateNotePlaceHolderMessage: function () {
            if (this.project.intentions.length === 1 && this.project.intentions[0].note.text === "") {
                return "Define the approach to the project by writing some notes";
            } else {
                return "Add another note"
            }
        }
    },
    created: function () {

        // A completely blank slate

        console.log("isLast", this.isIntentionLast(0));
        console.log("isEmpty", this.isIntentionEmpty(0));
        console.log("isNoteEmpty", this.isNoteEmpty(0));

        // A couple of things should happen if the project is completely blank. Probably a new one.
        if (this.isProjectEmpty()) {
            console.log("Project is completely empty.");

            this.addAnotherTodo = false; // Don't let them add a todo just yet.
            this.showProjectStats = false; // Don't show the project stats just yet.
            this.editingProjectTitle = true; // Immeditely make the project title editable and focus on it.
            this.$forceUpdate();
        }

        // Check if we should add another intention immedietly.
        this.shouldAddAnotherBlankIntention(0);
    },
    methods: {

        /*
         * @description - Adds a todo to the intention
         * @prop intentionIndex:Number - the intention to add it to
         */
        addTodo: function (intentionIndex) {
            this.project.intentions[intentionIndex].todos.push({
                text: "",
                isCompleted: false,
                isEditing: true
            });

            this.shouldAddAnotherBlankIntention(intentionIndex);
        },

        /*
         * @description - Remove a specific todo from a specific intention
         * @prop intentionIndex:Number - the index of the intention
         * @prop todoIndex:Number - the index of the todo
         * @return Void
         */
        removeTodo: function (intentionIndex, todoIndex) {
            console.log("Calling Project.removeTodo");
            this.project.intentions[intentionIndex].todos.splice(todoIndex, 1);
            this.shouldAddAnotherBlankIntention(intentionIndex);
        },

        /*
         * @description - Adds a new intention to the project
         * @prop intentionIndex:Number - Adds the new intention after the intention index that was passed in
         * @return Void
         */
        addIntention: function (intentionIndex) {
            console.log("Project.addIntention");
        },
        /*
         * @description - Remove a specific intention from the project
         * @prop intentionIndex:Number - the index of the intention
         * @return Void
         */
        removeIntention: function (intentionIndex) {
            console.log("Project.removeIntention");
        },

        shouldAddAnotherBlankIntention: function (intentionIndex) {

            // Super basic implementation that isn't really going to work in reality, because there will be the ability to like
            // remove notes and stuff in between other todos, etc.

            if (this.project.intentions.length > 1) {

                console.log("There's more than one intention.");

                if ( ! this.isIntentionLast(intentionIndex)) {
                    console.log("This intention isn't the last intention.");
                    if ( ! this.isIntentionEmpty(intentionIndex) && ! this.isIntentionEmpty(intentionIndex + 1)) {
                        console.log("This intention isn't empty and the next one isn't empty either.")
                        this.addBlankIntention();
                    }
                } else {
                    console.log("There's only one intention.");
                    this.addBlankIntention();
                }

            } else {
                if ( ! this.isIntentionEmpty(intentionIndex)) {
                    console.log("About to add a blank intention.");
                    this.addBlankIntention();
                }
            }

        },
        isIntentionLast: function (intentionIndex) {
            if (intentionIndex + 1 === this.project.intentions.length) {
                return true;
            } else {
                return false;
            }
        },
        isIntentionEmpty: function (intentionIndex) {
            return this.isNoteEmpty(intentionIndex) && this.project.intentions[intentionIndex].todos.length === 0;
        },
        isNoteEmpty: function (intentionIndex) {
            return this.project.intentions[intentionIndex].note.text === "";
        },
        isProjectEmpty: function () {
            // New projects will always start off with at least a single and empty intention
            return this.isIntentionLast(0) && this.isIntentionEmpty(0) && this.isNoteEmpty(0);
        },
        addBlankIntention: function () {
            this.project.intentions.push({
                note: {
                    text: ""
                },
                todos: []
            });
        },
        intentionHasTodos: function (intentionIndex) {
            console.log("In intentionHasTodos");
            console.log("What's intentionIndex?", intentionIndex);
            return this.project.intentions[intentionIndex].todos && this.project.intentions[intentionIndex].todos.length >= 1;
        },
        checkProjectTitle: function (hasValue, value) {
            console.log("Calling checkProjectTitle");

            if (hasValue) {
                this.project.title = value;
                this.editingProjectTitle = false;

                // If the project is empty, I want to focus on the next (empty) note immeditely.
                if (this.isProjectEmpty()) {
                    console.log("Is the project empty?");
                    console.log("What's this.$refs?", this.$refs);

                    // Immeditely focus on the first note if the project is empty.
                    Vue.nextTick(() => UTILS.autoSizeAndFocus(this.$refs.note[0].$el));
                }

                this.$forceUpdate();
            }

        },
        editProjectTitle: function () {
            console.log("Calling editProjectTitle");
            this.editingProjectTitle = true;
            this.$forceUpdate();
        },
        shouldShowNoteActions: function (hasValue) {
            if (hasValue) {
                this.addAnotherTodo = true;
            } else {
                this.addAnotherTodo = false;
            }
            this.$forceUpdate();
        }
    }
});