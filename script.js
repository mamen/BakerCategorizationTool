$(function(){

    var startIdx;       // the start-index of the selected text
    var endIdx;         // the end-index of the selected text
    var selectedText;
    var catBox = document.getElementById('catBox');

    var numSelections = 0;
    var selections = [];

    var currentPost = 0;
    var currentPostId;


    var posts = [];
    var pageBuffer = [];

    loadFromCSV("filtered_posts.csv", "\";\"", function(result) {
        //console.log(JSON.stringify(posts));

        var html = "<h2>" + posts[currentPost].title + "</h2>" + posts[currentPost].body;

        // console.log(posts[currentPost].body);

        document.getElementById("content").innerHTML = html;
        currentPostId = posts[currentPost].id;

    });


    function loadFromCSV(fileName, separator, callback) {
        $.get(fileName, function(fileContent){

            var result = [];
            var line = fileContent.split(/(\r\n|\n|\r)/gm);

            // start from 1, because we ignore the csv-header
            for (var i = 1; i < line.length; i++) {
                if (line[i].length > 1 && line[i] !== "\r\n") {
                    var elementArray = line[i].split(separator);

                    var postID = parseInt(elementArray[0].replace("\"",""));
                    var postTitle = elementArray[1];
                    var postBody = elementArray[2].substring(0, elementArray[2].length -1).replace(/&#xA;/g, "\n");

                    var post = {id: postID, title: postTitle, body: postBody};
                    posts.push(post);


                }
            }
            callback(result);
        });
    }

    // store the selection
    document.getElementById('saveData').onclick = function () {
        //downloadCSV({filename: "test.csv"});

        // console.log(JSON.stringify(selections));

        var csvOutput = "";

        for(var i = 0; i < selections.length; i++) {
            // console.log(JSON.stringify(selections[i]));

            for (var p in selections[i]) {
                if(selections[i].hasOwnProperty(p) ) {
                    csvOutput += selections[i][p].id + ";" +  selections[i][p].category + ";" +  selections[i][p].text + "\n";
                }
            }
        }


        console.log(csvOutput);



    };

    document.getElementById('prev').onclick = function () {

        pageBuffer[currentPost] = document.getElementById("content").innerHTML;

        // load new post
        currentPost--;

        if(currentPost < 0) {
            currentPost = posts.length-1;
        }

        currentPostId = posts[currentPost].id;

        var html;

        if(typeof pageBuffer[currentPost] !== "undefined") {
            html = pageBuffer[currentPost];
        } else {
            html = "<h2>" + posts[currentPost].title + "</h2>" + posts[currentPost].body;
        }

        document.getElementById("content").innerHTML = html;

        document.querySelectorAll("[class^=cat]").forEach(function(e){
            e.onclick = function() { deleteCategorizationHandler(e) };
        });

        catBox.style.display = "none";

    };

    document.getElementById('next').onclick = function () {


        pageBuffer[currentPost] = document.getElementById("content").innerHTML;

        // load new post
        currentPost++;

        if(currentPost >= posts.length) {
            currentPost = 0;
        }

        currentPostId = posts[currentPost].id;

        var html;

        if(typeof pageBuffer[currentPost] !== "undefined") {
            html = pageBuffer[currentPost];
        } else {
            html = "<h2>" + posts[currentPost].title + "</h2>" + posts[currentPost].body;
        }


        document.getElementById("content").innerHTML = html;

        document.querySelectorAll("[class^=cat]").forEach(function(e){
            e.onclick = function() { deleteCategorizationHandler(e) };
        });

        catBox.style.display = "none";



    };

    // cancel the selection
    document.getElementById('cancel').onclick = function () {

        resetForm();

        // hide the box again
        catBox.style.display = "none";

        // clear the selection
        window.getSelection().empty();

        // enable mouse-click again
        document.getElementById("content").onmousedown = window.event;
    };

    // store the selection
    document.getElementById('save').onclick = function () {

        // get the selected category (0, 1, 2, 3, 4, ...)
        var selection = catBox.querySelector("fieldset input[name = 'category']:checked").value;

        wrapSelectedText("cat"+selection);

        resetForm();

        selections[numSelections] = [];
        selections[numSelections].push({ id: currentPostId, category:selection, start: startIdx, end: endIdx, text: selectedText });
        numSelections++;

        //console.log(JSON.stringify(selections));

        // hide the box again
        catBox.style.display = "none";

        window.getSelection().empty();

        // enable mouse-click again
        document.getElementById("content").onmousedown = window.event;

        console.log(document.getElementById("content").innerHTML)
    };

    // check for new selection
    document.addEventListener("mouseup", function(event) {

        var selection = getSelectedText().trim();


        if(null == window.getSelection().anchorNode) {
            return;
        }

        var node = window.getSelection().anchorNode.parentNode;

        var selectionIsInContent = false;

        while(node.localName !== "body") {

            if(node.id) {
                if(node.id == "content") {
                    selectionIsInContent = true;
                    break;
                }
            }

            node = node.parentNode;
        }

        if(selectionIsInContent) {

            if(selection.length > 0) {

                selectedText = selection;

                // only, if a new selection was made
                if(document.getElementById("content").textContent.indexOf(selection) !== startIdx &&
                    startIdx + selection.length !== endIdx) {

                    startIdx = document.getElementById("content").textContent.indexOf(selection);
                    endIdx = startIdx + selection.length;

                    catBox.style.display = "block";
                    catBox.style.position = "absolute";
                    catBox.style.left = 10+event.clientX+'px';
                    catBox.style.top = 10+event.clientY+'px';

                    // disable the click event, so that the selection can't get lost
                    document.getElementById("content").onmousedown = function(e){
                        e = e || window.event;
                        e.preventDefault();
                    }

                }
            }
        }

    }, false);

    function resetForm() {
        // reset selection
        for(var child = catBox.querySelector("fieldset").firstChild; child!==null; child=child.nextSibling) {
            child.checked = false;
        }
    }

    function getSelectedText() {
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type !== "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    }

    function wrapSelectedText(className) {
        var selection = window.getSelection().getRangeAt(0);
        var selectedText = selection.extractContents();
        var span= document.createElement("p");
        span.className = className;
        span.id = numSelections;
        span.appendChild(selectedText);
        selection.insertNode(span);


        span.onclick = function() { deleteCategorizationHandler(span) };
    }

    function deleteCategorizationHandler(element) {
        if (confirm('Click OK if you really want to delete this categorization.')) {
            // delete it from the saved categorizations
            selections[element.id] = null;

            var parent = element.parentNode;

            while (element.firstChild) parent.insertBefore(element.firstChild, element);

            // remove the empty element
            parent.removeChild(element);

        }
    };

});