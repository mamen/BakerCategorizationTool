
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

    // loads the posts from a given .csv-file
    function loadFromCSV(fileName, separator, callback) {

        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", fileName, false);

        rawFile.onreadystatechange = function () {
            if(rawFile.readyState === 4) {
                if(rawFile.status === 200 || rawFile.status == 0) {
                    var line = rawFile.responseText.split(/(\r\n|\n|\r)/gm);

                    // start from 1, because we ignore the csv-header
                    for (var i = 1; i < line.length; i++) {
                        if (line[i].length > 1 && line[i] !== "\r\n") {
                            var elementArray = line[i].split(separator);

                            var postID = parseInt(elementArray[0].replace("\"",""));
                            var postTitle = elementArray[1];
                            var postBody = elementArray[2].substring(0, elementArray[2].length -1).replace(/(<p>|<\/p>)/g,"\r\n<br />").replace(/&#xA;/g, "\n");

                            // console.log(postBody);

                            var post = {id: postID, title: postTitle, body: postBody};
                            posts.push(post);
                        }
                    }
                }
            }
        }

        rawFile.send(null);
        callback();
    }

    function showCategorizationBox(clientX, clientY) {
        catBox.style.display = "block";
        catBox.style.position = "absolute";
        catBox.style.width = 250;
        catBox.style.height = 250;

        var x = 10 + clientX;
        var y = 10 + clientY;

        if(x > 10) {
            if(x + 250 > window.innerWidth) {
                x = window.innerWidth - 260;
            }else {
                x = 10 + clientX;
            }
        } else {
            x = 10;
        }

        if(y > 10) {
            if(y + 250 > window.innerHeight) {
                y = window.innerHeight - 260;
            } else {
                y = 10 + clientY;
            }
        } else {
            y = 10;
        }

        catBox.style.left = x + 'px';
        catBox.style.top = y + 'px';
    }

    function hideCategorizationBox() {
        // hide the box again
        catBox.style.display = "none";
        resetForm();

        window.getSelection().empty();
        // enable mouse-click again
        document.getElementById("content").onmousedown = window.event;
    }

    function storePageInBuffer() {
        // console.log("store post " + currentPost);
        pageBuffer[currentPost] = document.getElementById("content").innerHTML;
        localStorage.setItem("pageBuffer", JSON.stringify(pageBuffer));
        localStorage.setItem("selections", JSON.stringify(selections));
    }

    function loadPageFromBuffer() {
        return pageBuffer[currentPost];
    }

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

    // wraps the selected text with the chosen category-color
    function wrapSelectedText(className) {
        var selection = window.getSelection().getRangeAt(0);
        var selectedText = selection.extractContents();
        var span = document.createElement("font");
        span.className = className;
        span.id = numSelections;
        span.appendChild(selectedText);
        selection.insertNode(span);


        span.onclick = function() { deleteCategorizationHandler(span) };

        //console.log(document.getElementById("content").innerHTML);
    }

    function deleteCategorizationHandler(element) {

        if (confirm('Click OK if you really want to delete this categorization.')) {
            // delete it from the saved categorizations

            // console.log("deleted: " + JSON.stringify(selections[currentPost][element.id]));

            selections[currentPost][element.id] = null;

            // console.log(JSON.stringify(selections[currentPost]));



            var parent = element.parentNode;

            while (element.firstChild) parent.insertBefore(element.firstChild, element);

            // remove the empty element
            parent.removeChild(element);

        }
    }

    // store the selection in an .csv-file and download it
    document.getElementById('downloadData').onclick = function () {
        //downloadCSV({filename: "test.csv"});

        // console.log(JSON.stringify(selections));

        var csvOutput = "data:text/csv;charset=utf-8,";

        console.log(JSON.stringify(selections));

        for(var i = 0; i < selections.length; i++) {
          console.log("i: " + i);
          if(undefined !== selections[i]) {
              for(var j = 0; j < selections[i].length; j++) {
                  console.log("j: " + j);
                  for (var p in selections[i][j]) {
                      if(selections[i][j].hasOwnProperty(p) ) {
                          console.log(selections[i][j]);

                          csvOutput += selections[i][j][p].id + ";\"" +  selections[i][j][p].category + "\";\"" +  selections[i][j][p].text.replace(/(?:\r\n|\r|\n)/g, " ") + "\"\n";
                      }
                  }
              }
          }
        }


        var encodedUri = encodeURI(csvOutput);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "result.csv");
        document.body.appendChild(link); // Required for FF

        link.click(); // This will download the data file named "my_data.csv".

    };

    // load previous post
    document.getElementById('prev').onclick = function () {

        storePageInBuffer();

        // load new post
        currentPost--;

        if(currentPost < 0) {
            currentPost = posts.length-1;
        }

        currentPostId = posts[currentPost].id;

        if(undefined === selections[currentPost]) {
            numSelections = 0;
        } else {
            numSelections = selections[currentPost].length;
        }

        var html;

        if(typeof pageBuffer[currentPost] !== "undefined") {
            html = loadPageFromBuffer();
        } else {
            html = "<h2>" + posts[currentPost].title + "</h2>" + posts[currentPost].body;
        }

        document.getElementById("content").innerHTML = html;

        document.querySelectorAll("[class^=cat]").forEach(function(e){
            e.onclick = function() { deleteCategorizationHandler(e) };
        });

        catBox.style.display = "none";

        document.getElementById("currentPostNum").innerHTML = currentPost+1;
        document.getElementById("totalPostNum").innerHTML = posts.length;
        document.getElementById("currentPostId").innerHTML = currentPostId;

    };

    // load next post
    document.getElementById('next').onclick = function () {

        storePageInBuffer();

        // load new post
        currentPost++;

        if(currentPost >= posts.length) {
            currentPost = 0;
        }

        currentPostId = posts[currentPost].id;

        if(undefined === selections[currentPost]) {
            numSelections = 0;
        } else {
            numSelections = selections[currentPost].length;
        }

        var html;

        if(typeof pageBuffer[currentPost] !== "undefined") {
            html = loadPageFromBuffer();
        } else {
            html = "<h2>" + posts[currentPost].title + "</h2>" + posts[currentPost].body;
        }

        document.getElementById("content").innerHTML = html;

        document.querySelectorAll("[class^=cat]").forEach(function(e){
            e.onclick = function() { deleteCategorizationHandler(e) };
        });

        catBox.style.display = "none";

        document.getElementById("currentPostNum").innerHTML = currentPost+1;
        document.getElementById("totalPostNum").innerHTML = posts.length;
        document.getElementById("currentPostId").innerHTML = currentPostId;


    };

    // cancel the selection
    document.getElementById('cancel').onclick = function () {
        hideCategorizationBox();
    };

    // save the selection to the selections-array
    document.getElementById('categorySelect').addEventListener('change', function(evt) {

        // console.log("test");

        if(document.getElementById("categorySelect").querySelector("input:checked") !== null) {

            // console.log("something was selected");

            // get the selected category (0, 1, 2, 3, 4, ...)
            var selection = document.getElementById("categorySelect").querySelector("input:checked").value;

            wrapSelectedText("cat"+selection);

            // selectedText.replace(";", "");

            //var selectionTest = {key: 0, postId: currentPostId, category: selection, text: selectedText, start: startIdx, end: endIdx};

            // if no selection has yet been made for the current post
            if(undefined === selections[currentPost]) {
              selections[currentPost] = [];
            }

            if(undefined === selections[currentPost][numSelections]) {
              selections[currentPost][numSelections] = [];
            }

            console.log("added: " + selectedText);

            selections[currentPost][numSelections].push({ id: currentPostId, category:selection, start: startIdx, end: endIdx, text: selectedText });
            numSelections++;

            console.log(JSON.stringify(selections[currentPost]));

            hideCategorizationBox();

            // console.log(document.getElementById("content").innerHTML)

        }

    });

    // check for new selection
    document.addEventListener("mouseup", function(event) {

        var target = event.target || event.srcElement;

        // console.log(target.id);

        if(target.id !== "catBox") {
            var selection = getSelectedText().trim();


            if(null === window.getSelection().anchorNode) {
                console.log("selection failed: anchorNode was null");
                return;
            }

            // var node = window.getSelection().anchorNode.parentNode;
            //
            // var selectionIsInContent = false;
            //
            // while(node.localName !== "body") {
            //
            //     if(node.id) {
            //         if(node.id == "content") {
            //             selectionIsInContent = true;
            //             break;
            //         }
            //     }
            //
            //     node = node.parentNode;
            // }
            //
            // if(selectionIsInContent) {

            // console.log("selection was in body");

            if(selection.length > 0 && catBox.style.display !== "block") {

                selectedText = selection;

                // only, if a new selection was made
                // if(document.getElementById("content").textContent.indexOf(selection) !== startIdx &&
                //     startIdx + selection.length !== endIdx) {


                // console.log("selection was a new one");

                startIdx = document.getElementById("content").textContent.indexOf(selection);
                endIdx = startIdx + selection.length;

                showCategorizationBox(event.clientX, event.clientY);

                // disable the click event, so that the selection can't get lost
                document.getElementById("content").onmousedown = function(e){
                    e = e || window.event;
                    e.preventDefault();
                }

            }
            // }
            // } else {
            //     console.log("selection was NOT in body");
            // }
        }



    }, false);

    loadFromCSV("./posts.csv", "\";\"", function() {

        var html = "";

        if (typeof(Storage) !== "undefined") {

            // console.log(localStorage.pageBuffer);

            // localStorage.clear();

            if(typeof localStorage.pageBuffer !== "undefined") {
                console.log("loaded pages from local storage");
                // console.log(JSON.parse(localStorage.pageBuffer).length);

                for(var i = 0; i < JSON.parse(localStorage.pageBuffer).length; i++) {
                    if(null !== JSON.parse(localStorage.pageBuffer)[i] && JSON.parse(localStorage.pageBuffer)[i] !== undefined) {
                        pageBuffer[i] = JSON.parse(localStorage.pageBuffer)[i];
                    }
                }

                html = pageBuffer[0];

            } else {
                html = "<h2>" + posts[currentPost].title + "</h2>" + posts[currentPost].body;
            }

            if(typeof localStorage.selections !== "undefined") {

                // console.log("loaded from local storage:");

                for(var i = 0; i < JSON.parse(localStorage.selections).length; i++) {

                  if(undefined === selections[i]) {
                      selections[i] = [];
                  }

                  if(undefined !== JSON.parse(localStorage.selections)[i] && null !== JSON.parse(localStorage.selections)[i]) {
                      for(var j = 0; j < JSON.parse(localStorage.selections)[i].length; j++) {
                          selections[i][j] = JSON.parse(localStorage.selections)[i][j];
                      }
                  }
                }
                if(undefined === JSON.parse(localStorage.selections)[currentPost]) {
                    numSelections = 0;
                } else {
                    numSelections = JSON.parse(localStorage.selections)[currentPost].length;
                }
            }


            currentPostId = posts[currentPost].id;

            currentPost = 0;

            // storePageInBuffer();

            document.getElementById("currentPostNum").innerHTML = currentPost+1;
            document.getElementById("totalPostNum").innerHTML = posts.length;
            document.getElementById("currentPostId").innerHTML = currentPostId;

        } else {
            // Sorry! No Web Storage support..
            html = "<p>Your browser does not support web storage!</p>";
        }

        document.getElementById("content").innerHTML = html;

        // set new onclick-listeners for the categorizations
        var c = document.querySelectorAll('font[class^="cat"]');

        for(var i = 0; i < c.length; i++) {
            c[i].onclick = function() { deleteCategorizationHandler(this) };
        }


    });

    document.onkeydown = function checkKey(e) {

        e = e || window.event;

        if (e.keyCode == '37') {
            // left arrow
            document.getElementById('prev').click();
        }
        else if (e.keyCode == '39') {
            // right arrow
            document.getElementById('next').click();
        } if(e.keyCode == '27') {
            hideCategorizationBox();
        }

    }

    document.onkeyup = function resetProgress(e) {
        // this would test for whichever key is 40 and the ctrl key at the same time
        if (e.ctrlKey && e.keyCode == 82) {
            if (confirm('Click OK if you really want to delete all categorizations.')) {
              localStorage.clear();
              location.reload();
            }
        }
    }
