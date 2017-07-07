firebase.auth().onAuthStateChanged(user => {
    if ( ! user) {
        window.location = "login.html";
    }
});

(function () {

    // Hide Header on on scroll down
    var didScroll;
    var lastScrollTop = 0;
    var delta = 5;
    var navbarHeight = document.querySelector(".js-menu").offsetHeight;

    window.addEventListener('scroll', function (event) {
        didScroll = true;
    });

    setInterval(function() {
        if (didScroll) {
            hasScrolled();
            didScroll = false;
        }
    }, 250);

    function hasScrolled() {

        var bodyWidth = document.body.clientWidth;

        var st = document.body.scrollTop;

        // Make sure they scroll more than delta
        if(Math.abs(lastScrollTop - st) <= delta) {
            return;
        }

        // If they scrolled down and are past the navbar, add class .nav-up.
        // This is necessary so you never see what is "behind" the navbar.

        if (st > lastScrollTop && st > navbarHeight) {
            // Scroll Down
            document.querySelector(".js-menu").classList.add("Menu--hidden");
        } else {
            // Scroll Up
            document.querySelector(".js-menu").classList.remove("Menu--hidden");
            // if(st + window.innerHeight < document.height) {
            //     document.querySelector(".js-menu").classList.remove("Menu--hidden");
            // }
        }

        lastScrollTop = st;
    }

}());

const UTILS = {
    isUndefined(something) {
        return typeof something === "undefined";
    },
    autoSizeAndFocus(element) {
        autosize(element);
        Vue.nextTick(() => element.focus());
    },
    swapArrayElements(array, indexA, indexB) {
        let newArray = array;
        const temp = newArray[indexA];
        newArray[indexA] = newArray[indexB];
        newArray[indexB] = temp;
        return newArray;
    },

    /*
     * @description: Checks whether an element is currently visible and in the current view of the screen
     * @ return Boolean
     */
    elementIsInView(element) {

        // Will probably have to be updated since I'm not doing a very thorough check

        if (window.pageYOffset < element.offsetTop) {
            return true;
        } else {
            return false;
        }
    },

    debounce(func, wait, immediate) {
    	var timeout;
    	return function() {
    		var context = this, args = arguments;
    		var later = function() {
    			timeout = null;
    			if (!immediate) func.apply(context, args);
    		};
    		var callNow = immediate && !timeout;
    		clearTimeout(timeout);
    		timeout = setTimeout(later, wait);
    		if (callNow) func.apply(context, args);
    	};
    },

    isAtTopOfPage() {
        return window.pageYOffset === 0;
    },

    /*
     * @description - Returns the minutes and seconds in 00:00 format for a countdown obj.
     * @param timer:Object - The countdown timer Object
     * @return String - A string in the format of 00:00
     */
    getMinutesAndSeconds(timer) {
        const displayMinutes = timer.minutes >= 10 ? timer.minutes : "0" + timer.minutes;
        const displaySeconds = timer.seconds >= 10 ? timer.seconds : "0" + timer.seconds;

        return displayMinutes + ":" + displaySeconds;
    },

    /*
     * @description - Gets a result that looks like 05m25s from a timer.
     * @param timer:Object - The countdown timer Object
     * @return String - the string in the forrmat of 05m25s */
    getFocusedTime(timer) {

        let result = "";

        const displayMinutes = timer.minutes >= 10 ? timer.minutes : "0" + timer.minutes;
        const displaySeconds = timer.seconds >= 10 ? timer.seconds : "0" + timer.seconds;

        if (timer.minutes >= 1) {
            result += displayMinutes + "m";
        }

        result += displaySeconds + "s";

        return result;
    }
};

const INDIVIDUAL_PROJECT = {
    title: "Another Test Project Title",
    unCompletedTodos: 8,
    completedTodos: 12,
    totalTime: 16,
    intentions: [{
        note: {
            text: "Here’s some text that I’ve concerning what I think about a todo and also probably how to go ahead and complete it. Here’s a bit more text just to make it dramatic.\n\nNow I’m skipping places and this is probably where I’ll stop.",
            isEditing: false
        },
        todos: [
            {
                text: "A todo you need to complete and haven't completed yet.",
                isCompleted: false
            },
            {
                text: "A todo you've already completed.",
                isCompleted: true
            }
        ]
    }]
};

const BLANK_PROJECT = {
    title: "",
    unCompletedTodos: 0,
    completedTodos: 0,
    totalTime: 0,
    intentions: [{
        note: {
            text: "",
            isEditing: false
        },
        todos: []
    }]
};

const PROJECT_LIST = [
    {
        title: "A big project name",
        unCompletedTodos: 5,
        completedTodos: 10,
        totalTime: 95
    },
    {
        title: "Content Creator Delete Site and Transfer Assets",
        unCompletedTodos: 5,
        completedTodos: 10,
        totalTime: 95
    }
];

const TIMER_NOTES = {
    "04-05": [
        {
            endTime: "2017-04-06T16:19:59.224Z",
            focusedTime:"00:05",
            intentionIndex: 0,
            intentionName: "There's a few things that I need to do in order to",
            noteContent: "It ended up being a CSS issue. I fixed it though by changing the z-index.",
            startTime: "2017-04-06T16:19:34.076Z"
        },
        {
            endTime: "2017-04-06T16:19:59.224Z",
            focusedTime:"00:05",
            intentionIndex: 0,
            intentionName: "There's a few things that I need to do in order to",
            noteContent: "It ended up being a CSS issue. I fixed it though by changing the z-index.",
            startTime: "2017-04-06T16:19:34.076Z"
        }
    ],
    "04-06": [
        {
            endTime: "2017-04-06T16:19:59.224Z",
            focusedTime:"00:05",
            intentionIndex: 0,
            intentionName: "Something else something else",
            noteContent: "It ended up being a CSS issue. I fixed it though by changing the z-index.",
            startTime: "2017-04-06T16:19:34.076Z"
        },
        {
            endTime: "2017-04-06T16:19:59.224Z",
            focusedTime:"00:05",
            intentionIndex: 0,
            intentionName: "Yippity Yoo",
            noteContent: "It ended up being a CSS issue. I fixed it though by changing the z-index.",
            startTime: "2017-04-06T16:19:34.076Z"
        }
    ],
    "04-07": [
        {
            endTime: "2017-04-06T16:19:59.224Z",
            focusedTime:"00:05",
            intentionIndex: 0,
            intentionName: "Another Thing for Testing",
            noteContent: "It ended up being a CSS issue. I fixed it though by changing the z-index.",
            startTime: "2017-04-06T16:19:34.076Z"
        },
        {
            endTime: "2017-04-06T16:19:59.224Z",
            focusedTime:"00:05",
            intentionIndex: 0,
            intentionName: "Another Thing for Testing",
            noteContent: "It ended up being a CSS issue. I fixed it though by changing the z-index.",
            startTime: "2017-04-06T16:19:34.076Z"
        }
    ]
};