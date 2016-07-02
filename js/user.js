var name,
    _word,
    _userArray,
    _isDrawer = false;
var printUserImg = '<div class="user-slot col-sm-3"><img src="%data%"><h4 class="text-center">%name%</h4></div>'

function initBoard(){
    $("#submit-name").click(function(){
        name = $("#username-input").val().trim();
        if(name){
            socket.emit("enter game", name);
            $("#username-form-div").slideUp();
            $("#ready-unready").removeClass("hide");
        }
    });
    $("#send-ready").click(function(){
        $("#send-ready").attr("disabled", "disabled");
        $("#send-unready").removeAttr("disabled");
        console.log("emit user ready");
        socket.emit("user ready");
    });
    $("#send-unready").click(function(){
        $("#send-unready").attr("disabled", "disabled");
        $("#send-ready").removeAttr("disabled");
        socket.emit("user unready");
    });
    $(window).keydown(function(event){
        if (event.which === 13) {
            if (name) {
                sendGuess();
            }
        }
    });
    $("#change-word").click(function(){
        socket.emit("request new word");
        socket.emit("clear canvas");
    });
}

function reset(){
    clearCanvas();
    name = "";
    _word = "";
    _userArray =[];
    _isDrawer = false;
    clearChat();
}

function clearChat(){
    $('#messages').empty();
}
function sendGuess(){
    var _guess = $("#guess-input").val().trim();
    socket.emit("guess message", _guess);
    $("#guess-input").val("");
    if(_guess){
        if(_guess === _word){
            $("#judge").text("Guess is correct!");
        }else{
            $("#judge").text("Guess is wrong.");
        }
    }
}

function startgame(drawerId){
    if(_userArray[drawerId].name === name){
        _isDrawer = true;
        $(".drawer-only").removeClass("hide");
        $("#word").text(_word);
    }else{
        _isDrawer = false;
    }
    init();
    $("#ready-unready").addClass("hide");
    $("#title").slideUp();
    $("#game").removeClass("hide");
}

//update user list
socket.on("user list", function(userArray){
    $("#user-list").empty();
    for(var i=0, length = userArray.length; i< length; i++){
        if(userArray[i]){
            if(userArray[i].name === name){
                $("#user-list").append(printUserImg.replace("%data%", "./images/user-red.svg").replace("%name%", userArray[i].name));
            }else{
                $("#user-list").append(printUserImg.replace("%data%", "./images/user-blue.svg").replace("%name%", userArray[i].name));
            }
            if(userArray[i].isReady){$(".user-slot img:last").addClass("ready");}
            
        }else{
            $("#user-list").append(printUserImg.replace("%data%", "./images/empty.svg").replace("%name%", ""));
        }
    }
    _userArray = userArray;
});

socket.on("game start", function(msg){
    _word = msg.word;
    startgame(msg.drawerId);
});

socket.on("back to waiting room", function(){
    $("#send-unready").attr("disabled", "disabled");
    $("#send-ready").removeAttr("disabled");
    $("#game").addClass("hide");
    $("#title").slideDown();
    $("#username-form-div").slideDown();
    reset();
});

socket.on("get new word", function(newWord){
    _word = newWord;
    if(_isDrawer){
        $("#word").text(_word);
    }
});

socket.on("next round", function(){
    //tobe implemented
});

socket.on("guess message", function(msg){
    $('#messages').append($('<li>').text(msg.user + ": " + msg.guess));
    $("#messages")[0].scrollTop = $("#messages")[0].scrollHeight;
});

initBoard();