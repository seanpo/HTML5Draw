/************** Default Variables ****************
*  Author: Sean Po
*  Only change these flags. Unless you really want to change the other stuff.
*/
var DEFAULT_ACTION_COLOR = "rgba(0,0,0,1)"; // black
var DEFAULT_ACTION_SIZE = 3; // 3px
var DEFAULT_ACTION_OPACITY = 1; // fully opaque

var SERVER_URL = "localhost";

var DRAWACTION_SYNC_INTERVAL = 200; // interval in which the client syncs with server in milliseconds

/************** Helper classes***************/
// This DrawAction object keeps a history of the actions that have been made;
DrawAction = function () {
  var _this = this;
  this.createHistory = function(){
     // This is to detect a paintbucket click.
     return {"paintBucket":[],
        // This is to detect where the user has clicked.
        "click": {
                   "x":[],
                   "y":[]  
                 },
        // Boolean to check if the user is dragging.
        "drag":[],
        // A number that determines the size of each stroke in pixels.
        "size":[],
        // color will be rgba
        "color":[]
     };  
  }

  this.history = createHistory();

  this.toJSON() = function (){
    return JSON.stringify(_this.history);
  }
  
  this.clearHistory = function () {
    this.history = createHistory();
  }

  this.curColor = DEFAULT_ACTION_COLOR; 
  this.prevColor = DEFAULT_ACTION_COLOR;
  this.size = DEFAULT_ACTION_SIZE;

  this.isEmpty = function () {
    // If this' x array is of length 0, then you know history is empty;
    return _this.history["click"]["x"].length == 0;
  }

  this.update = function(click, paintBucket, drag, size, color){
    var _history = _this.history;
    _history['click']['x'].push(click['x']);
    _history['click']['y'].push(click['y']);

    _history['paintBucket'].push(paintBucket);
    _history['drag'].push(drag);
    _history['size'].push(size);
    _history['color'].push(color);
  }
}

// This object keeps track of the current user, and user information
DrawClient = function (name) {
  var _this = this;
  this.name = name; 
  this.picture = "";
  this.id = -1;

  // This function expects an integer id; 
  this.setID = function (id) {
    _this.id = id; 
  }

  // This function expects a URL that links to the user's picture
  this.setPicture = function (url) {
    _this.picture = url 
  }

  this.init = function ( id, url ) {
    _this.setID(id);
    _this.setPicture(url);
  }
}

/*********************************************/

HTML5Draw = function () {
  this.clientList = [];
  this.client = new DrawClient();

  // This is the consolidated Action List that is recieved from server
  this. mainAction = new DrawAction();
  // Set how often the server and client syncs in milliseconds.
  this.syncInterval = DRAWACTION_SYNC_INTERVAL;


  this.updateUserList = function () {
    $.ajax({
      type: 'POST',
      url: SERVER_URL,
      // This is the user data that you send to server
      data:data,
      // this is the user data that the server sends back
      success: function ( data ) {
        var data = $.parseJSON( data );
        if (data) {
          if (data['id']){
            _this.setID(data['id']);
          }
          if (data['url']){
            _this.setPicture(data['url']);
          }
        }
      }
    });
  }

  this.sync = function ( ){
    // Send ajax request with information inside the List object. 
    $ajax
    };
    setInterval( sync, syncInterval);
    this.clientList

  }
}
