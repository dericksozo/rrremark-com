"use strict";

(function () {

    console.log("Autosize defined?", autosize);

    // Directives

    var ClickOutsideDirective = {

        HANDLER: '_vue_click_outside_handler',

        bind: function bind(el, binding) {

            ClickOutsideDirective.unbind(el);

            console.log("Calling the bind method for v-click-outside");

            // make a event handler for click event

            console.log("el", el);
            console.log("binding", binding);

            var initialMacrotaskEnded = false;

            setTimeout(function () {
                initialMacrotaskEnded = true;
            }, 0);

            el[ClickOutsideDirective.HANDLER] = function (e) {

                // Is the target child of the component?
                var itsChildren = el.contains(e.target);

                // When there is no delay, usually not followed by v-if, v-show, v-cloak directive
                console.log("CLICK AND ABOUT TO CALL BINDING EXPRESSION");

                if (initialMacrotaskEnded && e.target != el && !itsChildren) {
                    console.log("About to call the binding value expression func.");
                    binding.value(e);
                }
            };

            // Attach Event Listener to body
            document.documentElement.addEventListener('click', el[ClickOutsideDirective.HANDLER], false);
        },
        unbind: function unbind(el) {
            // Remove Event Listener from body
            document.documentElement.removeEventListener('click', el[ClickOutsideDirective.HANDLER], false);
        }
    };

    Vue.directive('click-outside', ClickOutsideDirective);

    // Components

    // Takes create of dragging and dropping of todos
    Vue.component('todos', {
        template: "#vue_tmpl_todos",
        props: {
            todos: {
                type: Array,
                required: true
            },
            intentionIndex: {
                type: Number,
                required: true
            }
        },
        mounted: function mounted() {

            console.log("todos.mounted");
            console.log("What's this?", this);

            var self = this;
            var oldElementIndex = void 0,
                // The index of the todo before dragging begins.
            newElementIndex = void 0; // The index of the todo after dragging ends.

            dragula([this.$el], {
                revertOnSpill: true,
                moves: function moves(el, container, handle) {
                    return handle.classList.contains("Todo-drag");
                }
            }).on('over', function (el, container) {
                container.classList.add("Todos--dragging");
                el.style.opacity = 1;

                oldElementIndex = Array.prototype.indexOf.call(container.children, el);
            }).on('out', function (el, container) {
                container.className = container.className.replace("Todos--dragging", "");
                el.style.opacity = null;

                newElementIndex = Array.prototype.indexOf.call(container.children, el);

                console.log("dragula out event.");
                console.log("What's self.todos?", self.todos);
                console.log("What's self.intentionIndex?", self.intentionIndex);
                console.log("What's oldElementIndex?", oldElementIndex);
                console.log("What's newElementIndex?", newElementIndex);

                // The index of the todo actually changed and is in a new position
                if (oldElementIndex !== newElementIndex) {
                    self.$emit("reorder-todos", self.intentionIndex, oldElementIndex, newElementIndex);
                }
            });
        }
    });

    Vue.component('todo', {
        template: "#vue_tmpl_todo",
        props: {
            value: {
                type: Object,
                required: true
            },
            index: {
                type: Number
            }
        },
        data: function data() {
            return {
                readyToDrag: false
            };
        },
        methods: {

            /*
             * @description - Remove a todo if it's empty, and stop editing if it's not
             * @prop hasValue:Boolean, whether the todo has a value
             */
            checkTodo: function checkTodo(hasValue, value) {
                var _this = this;

                var todo = this.value;

                if (hasValue) {
                    todo.isEditing = false;
                    todo.text = value;
                    this.$emit('input', todo);

                    Vue.nextTick(function () {
                        _this.$emit('save-todos');
                    });
                } else {
                    this.removeTodo(this.index);
                }
            },

            /*
             * @description - Make sure the todo can be edited.
             * @return Void
             */
            editTodo: function editTodo() {
                console.log("Todo.editTodo");
                var todo = this.value;

                todo.isEditing = true;

                this.previousCompleteStatus = todo.isCompleted;
                this.previousValue = todo.text;

                todo.isCompleted = false;

                this.$emit('input', todo);
            },

            /*
             * @description - Remove this todo by emitting an event up to the project
             * @prop todoIndex:Number - the index of the todo to be removed.
             * @return Void
             */
            removeTodo: function removeTodo(todoIndex) {
                console.log("Todo.removeTodo");
                this.$emit("remove-todo", todoIndex);
            },

            checkTodoCompleteStatus: function checkTodoCompleteStatus(event) {

                var todo = this.value;
                this.previousCompleteStatus = todo.isCompleted;

                this.$emit('save-todos');
            },

            stopEditingTodo: function stopEditingTodo() {
                var _this2 = this;

                console.log("Todo.stopEditingTodo");

                var todo = this.value;

                if (todo.text !== "") {
                    todo.isEditing = false;

                    // When you edit a todo the complete status gets set to false.
                    // This checks if the text of the todo didn't change
                    // and sets the completedStatus back to what it was
                    if (todo.text === this.previousValue) {
                        todo.isCompleted = this.previousCompleteStatus;
                    }

                    this.$emit('input', todo);

                    Vue.nextTick(function () {
                        _this2.$emit('save-todos');
                    });
                } else {
                    this.removeTodo(this.index);
                }
            }
        }
    });

    Vue.component('editable', {
        template: "#vue_tmpl_editable",
        props: {
            value: {
                type: String,
                required: true
            },
            editFlag: {
                type: Boolean,
                required: true
            },
            maxlength: {
                type: Number,
                required: false,
                default: 60
            }
        },
        mounted: function mounted() {
            console.log("editable.mounted");
            if (this.editFlag) {
                UTILS.autoSizeAndFocus(this.$el);
                autosize.update(this.$el);
            }
        },
        updated: function updated() {
            if (this.editFlag) {
                UTILS.autoSizeAndFocus(this.$el);
                autosize.update(this.$el);
            }
        },
        methods: {
            nonEditableClickHandler: function nonEditableClickHandler(event) {
                this.$emit('non-editable-click');
            },
            editableKeyUpHandler: function editableKeyUpHandler(event) {
                console.log("editableKeyUpHandler");
                console.log("What's event?", event);

                if (event.keyCode === 13) {
                    // enter
                    console.log("Pressed enter?");

                    if (this.$el.value && this.$el.value.trim() !== "") {
                        this.$emit('editable-key-up', true);
                    } else {
                        this.$emit('editable-key-up', false);
                    }
                }

                this.$emit('input', this.$el.value.trim());
            }
        }
    });

    Vue.component('note', {
        template: "#vue_tmpl_note",
        props: {
            value: {
                type: Object,
                required: true
            },
            placeholder: {
                type: String,
                required: true
            }
        },
        computed: {
            splicedNotes: function splicedNotes() {
                var note = this.value;
                return note.text.split("\n\n");
            }
        },
        data: function data() {
            return {
                numTimesPressedEnter: 0,
                pressedBackSpaceOnLastChar: false
            };
        },
        mounted: function mounted() {
            var note = this.value;

            if (note.isEditing) {
                UTILS.autoSizeAndFocus(this.$el);
            }
        },
        updated: function updated() {
            var note = this.value;

            if (note.isEditing) {
                UTILS.autoSizeAndFocus(this.$el);
            }
        },
        methods: {

            /*
             * @description - Checks if the text of the note is completely blank
             * @return Boolean
             */
            isBlank: function isBlank() {
                console.log('note.isBlank');
                var note = this.value;
                console.log("Whats's note?", note);
                return note.text === "";
            },

            /*
             * @description - Sets the note to editable
             * @return Void
             */
            editNote: function editNote(event) {
                var note = this.value;
                note.isEditing = true;

                this.$emit('input', note);
            },

            /*
             * @descrpition - Switches the note back to the uneditable state
             * @return Void
             */
            stopEditing: function stopEditing(event) {
                var note = this.value;
                note.isEditing = false;

                this.$emit('input', note);
            },

            updateNote: function updateNote(event) {
                console.log("note.updateNote");

                var note = this.value;
                note.text = event.target.value.trim();

                console.log("event.target.value.trim()", event.target.value.trim());
                console.log("event", event);
                console.log("event.target.value", event.target.value);

                if (event.keyCode === 8) {
                    // Backspace
                    console.log("Pressed backspace");
                    if (note.text.length === 1) {
                        console.log("And the length of the note is only one.");
                        note.text = "";
                        this.$emit('input', note);
                        return;
                    }
                }

                if (event.keyCode === 13) {
                    this.numTimesPressedEnter += 1;
                } else {
                    this.numTimesPressedEnter = 0;
                }

                // Stop editing after pressing enter 3 times without there being any other key presses.
                if (this.numTimesPressedEnter >= 3) {
                    console.log("Pressed enter three times.");
                    note.isEditing = false;
                    note.text = event.target.value.split("\n\n\n")[0].trim();
                    this.numTimesPressedEnter = 0; // Reset it for next time

                    this.$emit('save-note', note);
                }

                console.log("What's note?", note);
                console.log("note.text", note.text);
                console.log("About to emit an input event");
                this.$emit('input', note);
            },

            stopEditingNote: function stopEditingNote() {

                console.log("Note.stopEditingNote");
                var note = this.value;

                console.log("note.text", note.text);
                if (note.text !== "") {
                    note.isEditing = false;
                    note.text = note.text.split("\n\n\n")[0].trim();
                    this.numTimesPressedEnter = 0; // Reset it for next time

                    this.$emit('save-note', note);
                }
            }
        }
    });

    var Communicator = new Vue(); // A vue instance to communicate via events through Menu and Project.

    var Menu = new Vue({
        el: "#vue_menu",
        data: {
            isExpanded: false,
            projects: []
        },
        created: function created() {
            var _this3 = this;

            console.log("DATABASE.getProjects()");

            DATABASE.getProjects(function (projects) {
                console.log("What's this?", _this3);
                console.log("What's projects?", projects);
                _this3.projects = projects;
            });

            console.log("Calling listen projects");
            /* DATABASE.listenProjects(projects => {
                console.log("What's projects?", projects);
                this.projects = projects;
            }); */
        },
        methods: {
            expandMenu: function expandMenu() {
                this.isExpanded = !this.isExpanded;
            },
            isNotLast: function isNotLast(index) {
                // Checks if the current index is in the last position of the array.
                var result = this.projects.length - 1 === index;
                return !result;
            },
            loadProject: function loadProject(index) {
                var _this4 = this;

                DATABASE.getSingleProject(this.projects[index].key, function (project) {
                    Communicator.$emit('get-project', project);
                    _this4.expandMenu();
                });
            }
        }
    });

    var Project = new Vue({
        el: "#vue_project",
        data: {
            project: BLANK_PROJECT,
            showProjectStats: true,
            editingProjectTitle: true
        },
        created: function created() {
            var _this5 = this;

            var self = this;

            // A couple of things should happen if the project is completely blank. Probably a new one.
            if (this.isProjectEmpty()) {
                console.log("Project is completely empty.");

                this.showProjectStats = false; // Don't show the project stats just yet.
                this.editingProjectTitle = true; // Immeditely make the project title editable and focus on it.

                this.$forceUpdate();
            }

            /* firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    DATABASE.getDefaultProject(project => {
                        if (project) {
                            this.project = project;
                            this.editingProjectTitle = false;
                            this.showProjectStats = true;
                            this.$forceUpdate();
                        }
                    });
                }
            }); */

            this.$on('remove-empty-intentions', this.removeEmptyIntentions);

            Communicator.$on('get-project', function (project) {
                console.log("Communicator.$on(get-project)");
                console.log("What's the project?", project);
                console.log("What's this.editingProjetTitle?", _this5.editingProjectTitle);
                _this5.project = project;
                console.log("What's this.editingProjetTitle (after setting this.project)?", _this5.editingProjectTitle);
                console.log("this", _this5);

                _this5.editingProjectTitle = false;

                console.log("Project.created");
                console.log("this.project", _this5.project);
            });
        },
        methods: {

            /*
             * @description - Adds a todo to the intention
             * @prop intentionIndex:Number - the intention to add it to
             */
            addTodo: function addTodo(intentionIndex) {

                var todos = this.project.intentions[intentionIndex].todos;

                // Turn off editable note if they click the addTodo button.
                this.project.intentions[intentionIndex].note.isEditing = false;

                // There should only ever be one blank todo at the end to prevent adding multiple blanks
                // so if the todo at the end of an intention is blank, just go ahead and delete it if you try
                // and add a new one.
                if (todos.length >= 1) {
                    if (todos[todos.length - 1].text === "") {
                        this.removeTodo(intentionIndex, todos.length - 1);
                    }
                }

                // Go ahead and add another one.
                this.project.intentions[intentionIndex].todos.push({
                    text: "",
                    isCompleted: false,
                    isEditing: true
                });
            },

            /*
             * @description - Remove a specific todo from a specific intention
             * @prop intentionIndex:Number - the index of the intention
             * @prop todoIndex:Number - the index of the todo
             * @return Void
             */
            removeTodo: function removeTodo(intentionIndex, todoIndex) {
                console.log("Calling Project.removeTodo");
                this.project.intentions[intentionIndex].todos.splice(todoIndex, 1);
                this.$emit('remove-empty-intentions');
            },

            saveTodos: function saveTodos(intentionIndex) {
                console.log("Project.saveTodos");
                console.log("What's the intentionIndex?", intentionIndex);
                console.log("this.project.key", this.project.key);
                console.log("todos", this.project.intentions[intentionIndex].todos);

                DATABASE.replaceTodos(this.project.key, intentionIndex, this.project.intentions[intentionIndex].todos, function () {});
            },

            /*
             * @description - Re orders the todos for an intention by swapping out two elements. Run after dragging and dropping
             * @param intentionIndex:Number - The index of the intention
             * @param oldElementIndex:Number - the index of the todo to switch
             * @param newElementIndex:Number - the index of the todo to switch
             */
            reorderTodos: function reorderTodos(intentionIndex, oldElementIndex, newElementIndex) {
                console.log("Project.reorderTodos");
                this.project.intentions[intentionIndex].todos = UTILS.swapArrayElements(this.project.intentions[intentionIndex].todos, oldElementIndex, newElementIndex);
                this.saveTodos(intentionIndex);
            },

            /*
             * @description - Adds a new intention to the project
             * @prop intentionIndex:Number - Adds the new intention after the intention index that was passed in
             * @return Void
             */
            addIntention: function addIntention(intentionIndex) {
                console.log("Project.addIntention");

                if (this.isIntentionLast(intentionIndex)) {
                    this.project.intentions.push({
                        note: {
                            text: "",
                            isEditing: true
                        },
                        todos: []
                    });
                } else {
                    this.project.intentions.splice(intentionIndex + 1, 0, {
                        note: {
                            text: "",
                            isEditing: true
                        },
                        todos: []
                    });
                }
            },

            /*
             * @description - Remove a specific intention from the project
             * @prop intentionIndex:Number - the index of the intention
             * @return Void
             */
            removeIntention: function removeIntention(intentionIndex) {
                console.log("Project.removeIntention");
                this.project.intentions.splice(intentionIndex, 1);
            },

            /*
             * @description - The placeholder of a note changes based on whether the project is empty or not, this method gets the right one.
             * @return Void
             */
            calculateNotePlaceHolderMessage: function calculateNotePlaceHolderMessage() {
                if (this.isProjectEmpty()) {
                    return "Define the approach to the project by writing some notes";
                } else {
                    return "Add another note";
                }
            },

            saveIntentionNote: function saveIntentionNote(intentionIndex, note) {
                console.log("Project.saveIntentionNote");
                console.log("What's intentionIndex?", intentionIndex);
                console.log("What's note?", note);

                DATABASE.updateIntentionNote(this.project.key, intentionIndex, this.project.intentions[intentionIndex].note.text);
            },

            /*
             * @description - Calculates whether a note for an intention is empty or not
             * @prop intentionIndex:Number - the index of the intention to check
             * @return Boolean
             */
            isIntentionNoteEmpty: function isIntentionNoteEmpty(intentionIndex) {
                console.log("Project.isIntentionNoteEmpty");
                return this.project.intentions[intentionIndex].note.text === "";
            },
            /*
             * @description - Calculates whether the passed intention index is the last one in the project
             * @prop intentionIndex:Number - The index of the intention to check
             * @return Boolean
             */
            isIntentionLast: function isIntentionLast(intentionIndex) {
                if (intentionIndex + 1 === this.project.intentions.length) {
                    return true;
                } else {
                    return false;
                }
            },

            /*
             * @description - Checks if the intention is completely empty (No note and no todos at all)
             * @prop intentionIndex:Number - the intention to check
             * @return Boolean
             */
            isIntentionEmpty: function isIntentionEmpty(intentionIndex) {
                return this.isIntentionNoteEmpty(intentionIndex) && this.project.intentions[intentionIndex].todos.length === 0;
            },

            /*
             * @description - Checks if the project is completely empty (Only one single completely blank intention)
             * @return Boolean
             */
            isProjectEmpty: function isProjectEmpty() {
                // New projects will always start off with at least a single and empty intention
                return this.isIntentionLast(0) && this.isIntentionEmpty(0) && this.isIntentionNoteEmpty(0);
            },

            /*
             * @description - Checks if an intention has at least one todo.
             * @prop intentionIndex:Number - The index of the intention
             * @return Boolean
             */
            intentionHasTodos: function intentionHasTodos(intentionIndex) {
                console.log("Project.intentionHasTodos");
                return this.project.intentions[intentionIndex].todos && this.project.intentions[intentionIndex].todos.length >= 1;
            },

            /*
             * @description - Checks if there is at least one todo in the intention and that it's not blank
             * @prop intentionIndex:Number - the index of the intention
             * @return Boolean
             */
            hasAtLeastOneTodo: function hasAtLeastOneTodo(intentionIndex) {

                var todos = this.project.intentions[intentionIndex].todos;

                if (todos.length === 1) {
                    // The text shouldn't be blank if there's only one.
                    return todos && todos.length === 1 && todos[0].text !== "";
                }

                if (todos.length === 0) {
                    return false;
                }

                if (todos.length > 1) {
                    return true;
                }
            },

            /*
             * @description - Checks the project for empty intentions and removes them all
             * @return Void
             */
            removeEmptyIntentions: function removeEmptyIntentions() {

                if (this.project.intentions.length >= 2) {
                    for (var i = 0; i < this.project.intentions.length; i += 1) {
                        if (this.project.intentions[i].note.text === "" && this.project.intentions[i].todos.length === 0) {
                            this.removeIntention(i);
                        }
                    }
                }
            },

            checkProjectTitle: function checkProjectTitle(hasValue) {
                var _this6 = this;

                console.log("Project.checkProjectTitle");
                if (hasValue) {
                    this.editingProjectTitle = false;

                    console.log("What's project key?", this.project.key);
                    console.log("What's the new title?", this.project.title);
                    console.log("About to update the title on the server");

                    if (!this.project.key) {
                        // There's no key for this project, so let's treat it as a new one.
                        DATABASE.createProject(this.project.title, function (projectReference) {
                            if (projectReference) {
                                // Go ahead and set up the project key reference
                                _this6.project.key = projectReference.key;
                                // Now let's actually save the project
                                DATABASE.updateProjectTitle(_this6.project.key, _this6.project.title);
                            }
                        });
                    } else {
                        // Go ahead and update the project's title
                        DATABASE.updateProjectTitle(this.project.key, this.project.title);
                    }

                    // If the project is empty, I want to focus on the next (empty) note immeditely.
                    if (this.isProjectEmpty()) {
                        console.log("Is the project empty?");
                        console.log("What's this.$refs?", this.$refs);
                        // Immeditely focus on the first note if the project is empty.
                        this.project.intentions[0].note.isEditing = true;
                    }
                }
            },

            editProjectTitle: function editProjectTitle() {
                console.log("Project.editProjectTitle");
                this.editingProjectTitle = true;
            },

            /*
             * Stops editing the project title if it has some value
             * @return Void
             */
            stopEditingProjectTitle: function stopEditingProjectTitle() {
                console.log("Project.stopEditingProjectTitle");
                if (this.project.title !== "") {
                    this.editingProjectTitle = false;
                }
            }
        }
    });
})();
//# sourceMappingURL=app.js.map
