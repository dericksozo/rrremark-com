"use strict";

firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
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

    setInterval(function () {
        if (didScroll) {
            hasScrolled();
            didScroll = false;
        }
    }, 250);

    function hasScrolled() {
        var st = document.body.scrollTop;

        // Make sure they scroll more than delta
        if (Math.abs(lastScrollTop - st) <= delta) {
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
})();

var UTILS = {
    isUndefined: function isUndefined(something) {
        return typeof something === "undefined";
    },
    autoSizeAndFocus: function autoSizeAndFocus(element) {
        autosize(element);
        Vue.nextTick(function () {
            return element.focus();
        });
    },
    swapArrayElements: function swapArrayElements(array, indexA, indexB) {
        var newArray = array;
        var temp = newArray[indexA];
        newArray[indexA] = newArray[indexB];
        newArray[indexB] = temp;
        return newArray;
    }
};

var INDIVIDUAL_PROJECT = {
    title: "Another Test Project Title",
    unCompletedTodos: 8,
    completedTodos: 12,
    totalTime: 16,
    intentions: [{
        note: {
            text: "Here’s some text that I’ve concerning what I think about a todo and also probably how to go ahead and complete it. Here’s a bit more text just to make it dramatic.\n\nNow I’m skipping places and this is probably where I’ll stop.",
            isEditing: false
        },
        todos: [{
            text: "A todo you need to complete and haven't completed yet.",
            isCompleted: false
        }, {
            text: "A todo you've already completed.",
            isCompleted: true
        }]
    }]
};

var BLANK_PROJECT = {
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

var PROJECT_LIST = [{
    title: "A big project name",
    unCompletedTodos: 5,
    completedTodos: 10,
    totalTime: 95
}, {
    title: "Content Creator Delete Site and Transfer Assets",
    unCompletedTodos: 5,
    completedTodos: 10,
    totalTime: 95
}];
//# sourceMappingURL=setup.js.map
