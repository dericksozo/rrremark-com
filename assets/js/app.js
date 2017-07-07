(function () {

    //console.log("Autosize defined?", autosize);

    // Directives

    let ClickOutsideDirective = {

        HANDLER: '_vue_click_outside_handler',

        bind(el, binding) {

            ClickOutsideDirective.unbind(el);

            //console.log("Calling the bind method for v-click-outside");

            // make a event handler for click event

            //console.log("el", el);
            //console.log("binding", binding);

            let initialMacrotaskEnded = false;

            setTimeout(function() {
                initialMacrotaskEnded = true;
            }, 0);

            el[ClickOutsideDirective.HANDLER] = (e) => {

                // Is the target child of the component?
                const itsChildren = el.contains(e.target);

                // When there is no delay, usually not followed by v-if, v-show, v-cloak directive
                //console.log("CLICK AND ABOUT TO CALL BINDING EXPRESSION");

                if (initialMacrotaskEnded && e.target != el && !itsChildren) {
                    //console.log("About to call the binding value expression func.");
                    binding.value(e);
                }

            };

            // Attach Event Listener to body
            document.documentElement.addEventListener('click', el[ClickOutsideDirective.HANDLER], false);
        },

        unbind(el) {
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
        mounted: function () {

            //console.log("todos.mounted");
            //console.log("What's this?", this);

            const self = this;
            let oldElementIndex, // The index of the todo before dragging begins.
                newElementIndex; // The index of the todo after dragging ends.

            dragula([this.$el], {
                revertOnSpill: true,
                moves: function (el, container, handle) {
                    return handle.classList.contains("Todo-drag");
                }
            })
            .on('over', function (el, container) {
                container.classList.add("Todos--dragging");
                el.style.opacity = 1;

                oldElementIndex = Array.prototype.indexOf.call(container.children, el);

            }).on('out', function (el, container) {
                container.className = container.className.replace("Todos--dragging", "");
                el.style.opacity = null;

                newElementIndex = Array.prototype.indexOf.call(container.children, el);

                //console.log("dragula out event.");
                //console.log("What's self.todos?", self.todos);
                //console.log("What's self.intentionIndex?", self.intentionIndex);
                //console.log("What's oldElementIndex?", oldElementIndex);
                //console.log("What's newElementIndex?", newElementIndex);

                // The index of the todo actually changed and is in a new position
                if (oldElementIndex !== newElementIndex) {
                    self.$emit("reorder-todos", self.intentionIndex, oldElementIndex, newElementIndex);
                }

            });
        },
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
        data: function () {
            return {
                readyToDrag: false
            };
        },
        methods: {

            /*
             * @description - Remove a todo if it's empty, and stop editing if it's not
             * @prop hasValue:Boolean, whether the todo has a value
             */
            checkTodo: function (hasValue, value) {

                let todo = this.value;

                if (hasValue) {
                    todo.isEditing = false;
                    todo.text = value;
                    this.$emit('input', todo);

                    Vue.nextTick(() => {
                        this.$emit('save-todos');
                    });

                } else {
                    this.removeTodo(this.index);
                }
            },

            /*
             * @description - Make sure the todo can be edited.
             * @return Void
             */
            editTodo: function () {
                //console.log("Todo.editTodo");
                let todo = this.value;

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
            removeTodo: function (todoIndex) {
                //console.log("Todo.removeTodo");
                this.$emit("remove-todo", todoIndex);
            },

            checkTodoCompleteStatus: function (event) {

                let todo = this.value;
                this.previousCompleteStatus = todo.isCompleted;

                this.$emit('save-todos');
            },

            stopEditingTodo: function () {
                //console.log("Todo.stopEditingTodo");

                let todo = this.value;

                if (todo.text !== "") {
                    todo.isEditing = false;

                    // When you edit a todo the complete status gets set to false.
                    // This checks if the text of the todo didn't change
                    // and sets the completedStatus back to what it was
                    if (todo.text === this.previousValue) {
                        todo.isCompleted = this.previousCompleteStatus;
                    }

                    this.$emit('input', todo);

                    Vue.nextTick(() => {
                        this.$emit('save-todos');
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
        mounted: function () {
            //console.log("editable.mounted");
            //console.log("What's this.value?", this.value);
            if (this.editFlag) {
                UTILS.autoSizeAndFocus(this.$el);
                autosize.update(this.$el);
            }
        },
        updated: function () {
            if (this.editFlag) {
                UTILS.autoSizeAndFocus(this.$el);
                autosize.update(this.$el);
            }
        },
        methods: {
            nonEditableClickHandler: function (event) {
                this.$emit('non-editable-click');
            },
            editableKeyUpHandler: function (event) {
                //console.log("editableKeyUpHandler");
                //console.log("What's event?", event);

                if (event.keyCode === 13) { // enter
                    //console.log("Pressed enter?");

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
            },
            intentionIndex: {
                type: Number,
                required: false
            }
        },
        computed: {
            splicedNotes: function () {
                let note = this.value;
                return note.text.split("\n\n");
            }
        },
        data: function () {
            return {
                numTimesPressedEnter: 0,
                pressedBackSpaceOnLastChar: false
            };
        },
        mounted: function () {
            console.log("note.mounted");
            let note = this.value;

            if (note.isEditing) {
                UTILS.autoSizeAndFocus(this.$el.querySelector("textarea"));
            }
        },
        updated: function () {
            console.log("note.updated");
            let note = this.value;

            if (note.isEditing) {
                UTILS.autoSizeAndFocus(this.$el.querySelector("textarea"));
            }
        },
        methods: {

            /*
             * @description - Checks if the text of the note is completely blank
             * @return Boolean
             */
            isBlank: function () {
                console.log('note.isBlank');
                let note = this.value;
                //console.log("Whats's note?", note);
                return note.text === "";
            },

            /*
             * @description - Sets the note to editable
             * @return Void
             */
            editNote: function (event) {
                console.log("note.editNote");
                let note = this.value;
                note.isEditing = true;

                this.$emit('input', note);
            },

            /*
             * @descrpition - Switches the note back to the uneditable state
             * @return Void
             */
            stopEditing: function (event) {
                console.log("note.stopEditing");
                let note = this.value;
                note.isEditing = false;

                this.$emit('input', note);
            },


            updateNote: function (event) {
                console.log("note.updateNote");

                let note = this.value;
                note.text = event.target.value.trim();

                //console.log("event.target.value.trim()", event.target.value.trim());
                //console.log("event", event);
                //console.log("event.target.value", event.target.value);

                if (event.keyCode === 8) { // Backspace
                    //console.log("Pressed backspace");
                    if (note.text.length === 1) {
                        //console.log("And the length of the note is only one.");
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
                    //console.log("Pressed enter three times.");
                    note.isEditing = false;
                    note.text = event.target.value.split("\n\n\n")[0].trim();
                    this.numTimesPressedEnter = 0; // Reset it for next time

                    this.$emit('save-note', note);
                }

                //console.log("What's note?", note);
                //console.log("note.text", note.text);
                //console.log("About to emit an input event");
                this.$emit('input', note);
            },

            stopEditingNote: function () {

                console.log("Note.stopEditingNote");
                let note = this.value;

                //console.log("note.text", note.text);
                if (note.text !== "") {
                    note.isEditing = false;
                    note.text = note.text.split("\n\n\n")[0].trim();
                    this.numTimesPressedEnter = 0; // Reset it for next time

                    this.$emit('save-note', note);
                }
            },

            showNotesCalendar: function () {
                console.log("Clicked the notes icon. Ready to show the calendar.");
                this.$emit('show-calendar');
            }
        }
    });

    Vue.component('timernoteentries', {
        template: "#vue_tmpl_timernoteentries",
        props: {
            day: {
                type: String,
                required: true
            }
        },
        mounted: function () {
            console.log("What's this.day?", this.day);
        }
    });

    Vue.component('timernoteentry', {
        template: "#vue_tmpl_timernoteentry",
        props: {
            timerNote: {
                type: Object,
                required: true
            }
        },
        data: function () {
            return {
                startTime: this.timerNote.startTime,
                endTime: this.timerNote.endTime
            };
        },
        created: function () {

            console.log("current startTime", this.startTime);
            console.log("current endTime", this.endTime);

            this.startTime = moment(this.startTime).format("hh:mm A");
            this.endTime = moment(this.endTime).format("hh:mm A");

            console.log("new startTime", this.startTime);
            console.log("new endTime", this.endTime);
        },
        methods: {

        }
    });

    let Communicator = new Vue(); // A vue instance to communicate via events between different Vue Instances.

    let Menu = new Vue({
        el: "#vue_menu",
        data: {
            isExpanded: false,
            projects: [],
            currentProjectTitle: ""
        },
        created: function () {

            //console.log("DATABASE.getProjects()");

            DATABASE.getProjects(projects => {
                //console.log("What's this?", this);
                //console.log("What's projects?", projects);
                this.projects = projects;

                this.$forceUpdate(); // Forcing the update so that the placeholders can go away.
            });

            /* Mostly for whether to show the project title or not in the menu */
            document.addEventListener('scroll', UTILS.debounce(() => {
                this.$forceUpdate();
            }, 100));

        },
        methods: {
            expandMenu: function () {
                this.isExpanded = !this.isExpanded;
                document.body.classList.toggle("u-overflowHidden"); // To stop the parent from scrolling.
            },
            isNotLast: function (index) { // Checks if the current index is in the last position of the array.
                const result = (this.projects.length - 1) === index;
                return ! result;
            },
            loadProject: function (index) {

                DATABASE.getSingleProject(this.projects[index].key, project => {
                    Communicator.$emit('get-project', project);
                    this.expandMenu();
                    this.currentProjectTitle = project.title
                });
            },

            /*
             * @description: Just a utility function that checks whether the projects is an empty array or not
             * @return Boolean
             */
            projectsEmpty: function () {
                //console.log("Calling the projectsEmpty function");
                //console.log("this.projects", this.projects);
                return this.projects.length === 0;
            },

            /*
             * @description: A function that checks if the main project title isn't visible on the page
                            if so, then go ahead and show the title in hte menu.

             * @return Boolean
             */
            showProjectTitleStatsInMenu: function () {
                if (! UTILS.elementIsInView(document.getElementById("project_title"))) {
                    return true;
                } else {
                    return false;
                }
            },

            /*
             * @description: A function that checks if the user hasn't scrolled yet and is at the top of the page
             * @return Boolean
             */
            isAtTopOfPage: function () {
                return UTILS.isAtTopOfPage();
            },

            /*
             * @description: Sets the project to empty when the user clicks this button to get ready for savinga nother.
             */
            createNewProject: function () {
                //console.log("Menu.createNewProject");
                Communicator.$emit('get-project', BLANK_PROJECT);
                this.expandMenu();
            }
        }
    });

    /* Takes care of all the NotesCalendar related functionality like reading what you focused on and things like that. */
    let NotesCalendar = new Vue({
        el: "#vue_notescalendar",
        data: function () {
            return {
                showingNotesCalendar: false,
                timerNotesThisWeek: false,
                activeDay: "00-00",
                currentMonth: "",
                currentYear: "",
                daysOfWeek: []
            };
        },
        created: function () {

            Communicator.$on('show-notescalendar', project => {

                console.log("Showing the notes calendar");
                console.log("What's the project that was passed in?", project);

                // Generate the calendar
                const now = moment();

                // Grab the current month, and generate the days of the week.
                this.currentYear = now.format("YYYY");
                this.currentMonth = now.format("MMMM");
                this.currentMonthNumber = now.format("MM");
                this.activeDay = now.format("MM-DD");

                // Render the current week from Sunday to Saturday on the calendar
                for (let i = 0; i < 7; i += 1) {

                    let dayObj = {
                        number: moment().startOf('week').add(i, 'day').format('DD'),
                        name: moment().startOf('week').add(i, 'day').format('ddd')
                    };

                    if (moment(now).isSame(moment().startOf('week').add(i, 'day'), 'day')) {
                        dayObj.active = true;
                    } else {
                        dayObj.active = false;
                    }

                    this.daysOfWeek.push(dayObj);
                }

                // Grab all of the notes data for this project.
                /* DATABASE.getProjectTimerNotes(project.key, timerNotes => {
                    this.timerNotesThisWeek = this.getTimerNotesForThisWeek(timerNotes);
                    console.log("this.timerNotesThisWeek", this.timerNotesThisWeek);
                    this.$forceUpdate();
                }); */

                this.timerNotesThisWeek = TIMER_NOTES;

                // Finally show the calendar.
                this.showingNotesCalendar = true;
                this.$forceUpdate();
            });

        },

        methods: {
            hideNotesCalendar: function () {
                this.showingNotesCalendar = false;
            },

            /*
             * @description - Sets the current active day to show the timer notes for that day.
             */
            setActiveDay: function (selectedDayNumber) {
                if (typeof this.timerNotesThisWeek[this.currentMonthNumber + "-" + selectedDayNumber] !== "undefined" && this.timerNotesThisWeek[this.currentMonthNumber + "-" + selectedDayNumber].length >= 1) {
                    this.activeDay = this.currentMonthNumber + "-" + selectedDayNumber;
                }
            },
            isDayActive: function (selectedDayNumber) {
                return this.activeDay === this.currentMonthNumber + "-" + selectedDayNumber;
            },
            dayHasTimerNotes: function (selectedDayNumber) {
                if (typeof this.timerNotesThisWeek[this.currentMonthNumber + "-" + selectedDayNumber] !== "undefined" && this.timerNotesThisWeek[this.currentMonthNumber + "-" + selectedDayNumber].length >= 1) {
                    return true;
                } else {
                    return false;
                }
            },
            getTimerNotesForThisWeek: function (timerNotesSnapshot) {
                //console.log("NotesCalendar.getTimerNotesForThisWeek");
                let timerNotesObj = {};

                // Looping through all of the timerNotes to organize them by date only for the current week.
                for (let timerNoteKey in timerNotesSnapshot) {

                    const timerNote = timerNotesSnapshot[timerNoteKey],
                          timerNoteStartTime = moment(timerNotesSnapshot[timerNoteKey].startTime);

                    // console.log("timerNoteStartTime (moment)", timerNoteStartTime);
                    // console.log("timerNoteStartTime.isBetween(moment().startOf('week'), moment().endOf('week'))", timerNoteStartTime.isBetween(moment().startOf('week'), moment().endOf('week')));

                    if (timerNoteStartTime.isBetween(moment().startOf('week'), moment().endOf('week'))) {

                        // console.log("Yes, the date is in between the start of the week and the end of the week.");
                        // console.log("timerNoteStartTime.toString()", timerNoteStartTime.toString());

                        let timerNoteStartTimeFormatted = timerNoteStartTime.format("MM-DD");

                        if ( ! timerNotesObj[timerNoteStartTimeFormatted]) {
                            timerNotesObj[timerNoteStartTimeFormatted] = [];
                        }

                        timerNotesObj[timerNoteStartTimeFormatted].push(timerNote);

                    }

                }

                // console.log("timerNotesObj", timerNotesObj);

                return timerNotesObj;
            }
        }
    });

    /*
     * Takes care of all timer related tasks.
     */
     let Timer = new Vue({
         el: "#vue_timer",
         data: function () {
             return {
                 timerProject: undefined,
                 timerIntention: undefined,
                 timerIntentionIndex: undefined,
                 timerIntentionNote: "",
                 timerActive: false,
                 showingNote: false,
                 amountTimeFocused: "00:00",
                 timerNote: {
                     text: "",
                     isEditing: true
                 }
             };
         },
         created: function () {
             //console.log("Created the timer.");

             Communicator.$on('start-timer', (project, intention, intentionIndex) => {

                 console.log("On start timer");
                 console.log("What's intention?", intention);
                 console.log("What's the project?", project);
                 //console.log('intention.note.text.substring(0, 50)', intention.note.text.substring(0, 50));

                 this.timerProject = project;
                 this.timerIntention = intention;
                 this.timerIntentionIndex = intentionIndex;

                 this.timerIntentionNote = intention.note.text.substring(0, 50);
                 this.startTime = new Date();
                 this.timerActive = true;
                 //console.log("this.startTime", this.startTime);

                 this.$forceUpdate();

             });

             console.log("this (Timer)", this);

         },
         methods: {

             // Some method to stop the timer, grab the amount of minutes that have passed,
             // And then show the area to take notes in.
             showNote: function (timeSpanObj) {
                 this.timerActive = false;
                 this.showingNote = true;

                 this.amountTimeFocusedFormatted = UTILS.getFocusedTime(timeSpanObj);
                 this.amountTimeFocused = UTILS.getMinutesAndSeconds(timeSpanObj);

                 this.$forceUpdate();
             },

             timingOrInputting: function () {
                 return this.timerActive || this.showingNote;
             },

             saveIntentionTimer: function () {

                 this.endTime = new Date();

                 console.log("About to save the intention timer");
                 console.log("What's this.timerIntention?", this.timerIntention);

                 console.log("this.timerProject", this.timerProject);
                 console.log("this.timerIntention", this.timerIntention);

                 // addIntentionTimer(projectKey, intentionIndex, timerNote, focusedTime, startTime, endTime, callback) {

                 DATABASE.addIntentionTimer(this.timerProject.key, this.timerIntentionIndex, this.timerIntentionNote, {
                     note: this.timerNote.text,
                     focusedTime: this.amountTimeFocusedFormatted,
                     startTime: this.startTime,
                     endTime: this.endTime
                 }, e => {
                     console.log("Just called the DATABASE.addIntentionTimer function");
                     console.log("What's e?", e);

                     // Hide the timer after saving it to the database.
                     this.timerActive = false;
                     this.showingNote = false;
                 });

             }
         }
     });

     Vue.component('countuptimer', {
         template: "#vue_tmpl_countuptimer",
         props: {
             startTime: {
                 type: Date,
                 required: true
             }
         },
         data: function () {

             return {
                 timespan: "00:00",
                 stopAnimationFrame: false,
                 timeSpanObj: undefined,
                 timespan: undefined
             };

         },
         methods: {
             updateTimer: function () {

                 this.timeSpanObj = countdown(this.startTime);
                 this.timespan = UTILS.getMinutesAndSeconds(this.timeSpanObj);

                 if ( ! this.stopAnimationFrame) {
                     window.requestAnimationFrame(() => {
                         this.updateTimer();
                     });
                 }

                 this.$forceUpdate(); // Is this necessary?

             },
             stopTimer: function () {
                 this.stopAnimationFrame = true;
                 this.$emit('stop-timer', this.timeSpanObj);
             }
         },
         created: function () {
             //console.log("Created the countup timer.");
             //console.log("What's this?", this);
             window.requestAnimationFrame(() => {
                 this.updateTimer();
             });
         }
     });

    let Project = new Vue({
        el: "#vue_project",
        data: {
            project: BLANK_PROJECT,
            showProjectStats: true,
            editingProjectTitle: true
        },
        created: function () {

            const self = this;

            // A couple of things should happen if the project is completely blank. Probably a new one.
            if (this.isProjectEmpty()) {
                //console.log("Project is completely empty.");

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

            Communicator.$on('get-project', project => {
                //console.log("Communicator.$on(get-project)");
                //console.log("What's the project?", project);
                //console.log("What's this.editingProjetTitle?", this.editingProjectTitle);
                this.project = project;
                //console.log("What's this.editingProjetTitle (after setting this.project)?", this.editingProjectTitle);
                //console.log("this", this);

                // Stop editing the title only if it's not blank.
                if (this.project.title !== "") {
                    this.editingProjectTitle = false;
                } else {
                    this.editingProjectTitle = true;
                }

                //console.log("Project.created");
                //console.log("this.project", this.project);

            });

        },
        methods: {

            /*
             * @description - Adds a todo to the intention
             * @prop intentionIndex:Number - the intention to add it to
             */
            addTodo: function (intentionIndex) {

                const todos = this.project.intentions[intentionIndex].todos;

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
            removeTodo: function (intentionIndex, todoIndex) {
                //console.log("Calling Project.removeTodo");
                this.project.intentions[intentionIndex].todos.splice(todoIndex, 1);
                this.saveTodos(intentionIndex);
                this.$emit('remove-empty-intentions');
            },

            saveTodos: function (intentionIndex) {
                //console.log("Project.saveTodos");
                //console.log("What's the intentionIndex?", intentionIndex);
                //console.log("this.project.key", this.project.key);
                //console.log("todos", this.project.intentions[intentionIndex].todos);

                DATABASE.replaceTodos(this.project.key, intentionIndex, this.project.intentions[intentionIndex].todos, function () { });
            },

            /*
             * @description - Re orders the todos for an intention by swapping out two elements. Run after dragging and dropping
             * @param intentionIndex:Number - The index of the intention
             * @param oldElementIndex:Number - the index of the todo to switch
             * @param newElementIndex:Number - the index of the todo to switch
             */
            reorderTodos: function (intentionIndex, oldElementIndex, newElementIndex) {
                //console.log("Project.reorderTodos");
                this.project.intentions[intentionIndex].todos = UTILS.swapArrayElements(this.project.intentions[intentionIndex].todos, oldElementIndex, newElementIndex);
                this.saveTodos(intentionIndex);
            },

            /*
             * @description - Adds a new intention to the project
             * @prop intentionIndex:Number - Adds the new intention after the intention index that was passed in
             * @return Void
             */
            addIntention: function (intentionIndex) {
                //console.log("Project.addIntention");

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
            removeIntention: function (intentionIndex) {
                //console.log("Project.removeIntention");
                this.project.intentions.splice(intentionIndex, 1);
            },

            /*
             * @description - The placeholder of a note changes based on whether the project is empty or not, this method gets the right one.
             * @return Void
             */
            calculateNotePlaceHolderMessage: function () {
                if (this.isProjectEmpty()) {
                    return "Define the approach to the project by writing some notes";
                } else {
                    return "Add another note"
                }
            },

            saveIntentionNote: function (intentionIndex, note) {
                //console.log("Project.saveIntentionNote");
                //console.log("What's intentionIndex?", intentionIndex);
                //console.log("What's note?", note);

                DATABASE.updateIntentionNote(this.project.key, intentionIndex, this.project.intentions[intentionIndex].note.text);
            },

            /*
             * @description - Calculates whether a note for an intention is empty or not
             * @prop intentionIndex:Number - the index of the intention to check
             * @return Boolean
             */
            isIntentionNoteEmpty: function (intentionIndex) {
                //console.log("Project.isIntentionNoteEmpty");
                return this.project.intentions[intentionIndex].note.text === "";
            },
            /*
             * @description - Calculates whether the passed intention index is the last one in the project
             * @prop intentionIndex:Number - The index of the intention to check
             * @return Boolean
             */
            isIntentionLast: function (intentionIndex) {
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
            isIntentionEmpty: function (intentionIndex) {
                return this.isIntentionNoteEmpty(intentionIndex) && this.project.intentions[intentionIndex].todos.length === 0;
            },

            /*
             * @description - Checks if the project is completely empty (Only one single completely blank intention)
             * @return Boolean
             */
            isProjectEmpty: function () {
                // New projects will always start off with at least a single and empty intention
                return this.isIntentionLast(0) && this.isIntentionEmpty(0) && this.isIntentionNoteEmpty(0);
            },

            /*
             * @description - Checks if an intention has at least one todo.
             * @prop intentionIndex:Number - The index of the intention
             * @return Boolean
             */
            intentionHasTodos: function (intentionIndex) {
                //console.log("Project.intentionHasTodos");
                return this.project.intentions[intentionIndex].todos && this.project.intentions[intentionIndex].todos.length >= 1;
            },

            /*
             * @description - Checks if there is at least one todo in the intention and that it's not blank
             * @prop intentionIndex:Number - the index of the intention
             * @return Boolean
             */
            hasAtLeastOneTodo: function (intentionIndex) {

                const todos = this.project.intentions[intentionIndex].todos;

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
            removeEmptyIntentions: function () {

                if (this.project.intentions.length >= 2) {
                    for (let i = 0; i < this.project.intentions.length; i += 1) {
                        if (this.project.intentions[i].note.text === "" && this.project.intentions[i].todos.length === 0) {
                            this.removeIntention(i);
                        }
                    }
                }
            },

            checkProjectTitle: function (hasValue) {
                //console.log("Project.checkProjectTitle");
                if (hasValue) {
                    this.editingProjectTitle = false;

                    //console.log("What's project key?", this.project.key);
                    //console.log("What's the new title?", this.project.title);
                    //console.log("About to update the title on the server");

                    if ( ! this.project.key) { // There's no key for this project, so let's treat it as a new one.
                        DATABASE.createProject(this.project.title, projectReference => {
                            if (projectReference) {
                                // Go ahead and set up the project key reference
                                this.project.key = projectReference.key;
                                // Now let's actually save the project
                                DATABASE.updateProjectTitle(this.project.key, this.project.title);
                            }
                        });
                    } else { // Go ahead and update the project's title
                        DATABASE.updateProjectTitle(this.project.key, this.project.title);
                    }


                    // If the project is empty, I want to focus on the next (empty) note immeditely.
                    if (this.isProjectEmpty()) {
                        //console.log("Is the project empty?");
                        //console.log("What's this.$refs?", this.$refs);
                        // Immeditely focus on the first note if the project is empty.
                        this.project.intentions[0].note.isEditing = true;
                    }

                }
            },

            editProjectTitle: function () {
                //console.log("Project.editProjectTitle");
                this.editingProjectTitle = true;
            },

            /*
             * Stops editing the project title if it has some value
             * @return Void
             */
            stopEditingProjectTitle: function () {
                //console.log("Project.stopEditingProjectTitle");
                if (this.project.title !== "") {
                    this.editingProjectTitle = false;
                }
            },

            /*
             * Start a timer for a specific intention
             * @param intentionIndex:Number - The intention to start the timer for
             * @return Void */
            startTimer: function (intentionIndex) {
                //console.log("Project.startTimer");

                let intention = this.project.intentions[intentionIndex];

                Communicator.$emit('start-timer', this.project, intention, intentionIndex);

            },

            /*
             * Shows the note calendar for this entire project
             * @return Void */
            showNotesCalendar: function () {
                Communicator.$emit('show-notescalendar', this.project);
            }
        }
    });

}());