/************** Default Variables ****************
*  Author: Sean Po
*  Only change these flags. Unless you really want to change the other stuff.
*/
var DEFAULT_ACTION_COLOR = "rgba(0,0,0,1)"; // black
var DEFAULT_ACTION_SIZE = 3; // 3px
var DEFAULT_ACTION_OPACITY = 1; // fully opaque

var SERVER_URL = "localhost";

var DRAWACTION_SYNC_INTERVAL = 200; // interval in which the client syncs with server in milliseconds
var CLIENTINFO_SYNC_INTERVAL = 1000; // interval in which the client information is synced with server in milliseconds

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
  };
  
  this.get = function (key, index) {
    if (["x","y"].indexOf(key) !== -1){
      return _this.history["click"][key][index];
    } else { 
      return _this.history[key][index];
    }
  }

  this.history = createHistory();

  this.toJSON() = function (){
    return JSON.stringify(_this.history);
  };
  
  this.clearHistory = function () {
    this.history = createHistory();
  };

  this.currColor = DEFAULT_ACTION_COLOR; 
  this.prevColor = DEFAULT_ACTION_COLOR;
  this.size = DEFAULT_ACTION_SIZE;

  this.isEmpty = function () {
    // If this' x array is of length 0, then you know history is empty;
    return _this.history["click"]["x"].length == 0;
  }

  this.length = function () {
    return _this.history["click"]["x"].length;
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

  this.toJSON = function () {
    return JSON.stringify({"name":_this.name,
                           "picture":_this.picture,
                           "id":_this.id
                          });
  }
}

/*********************************************/

HTML5Draw = function (dom) {
  var _this = this;
  this.domID = dom;
  this.canvas = document.getElementById(dom);
  // Set up context, and set styles:
  this.context = canvas.getContext("2d");
  this.context.lineJoin = "round";

  this.setLineJoin = function (type){
    _this.context.lineJoin = type;
  };

  this.clientList = [];
  this.client = new DrawClient();

  // This is the consolidated Action List that is recieved from server
  this. mainAction = new DrawAction();
  // Set how often the server and client syncs in milliseconds.
  this.syncInterval = DRAWACTION_SYNC_INTERVAL;
  this.setSyncInterval = function (interval) {
    _this.syncInterval = interval;
  };

 // Set how often the server and client syncs users in milliseconds.
  this.cSyncInterval = CLIENTINFO_SYNC_INTERVAL;
  this.setCSyncInterval = function (interval) {
    _this.cSyncInterval = interval;
  };

  this.updateUserList = function () {
    $.ajax({
      type: 'POST',
      url: SERVER_URL,
      // This is the user data that you send to server
      data: _this.client.toJSON(),
      // this is the user data that the server sends back
      success: function ( clientList ) {
        // Make sure no duplicate entries are there
        _this.clientList = [];
        for (index in clientList){
          _this.clientList.push(clientList[index]);
        }
      }
    });
  };

  this.redraw = function (){
    var mainAction = _this.mainAction;
    var length = mainAction.length();
     
    for(var i = length - 1; i < length; i++){       
      // If the step is to apply the paintbucket, then the location, and drawing is uneccesary
      var x = mainAction.get("x", i);
      var y = mainAction.get("y", i);
      var color = mainAction.get("color", i);
      if (mainAction.get("paintBucket", i){
        _paintBucket(x, y, color);
      } else {
        _this.context.beginPath();
        if(mainAction.get("drag", i) && i != 0){
           _this.context.moveTo(mainAction.get("x", i - 1), mainAction.get("y", i - 1));
        } else {
           _this.context.moveTo(x - 1, y);
        }
        _this.context.lineTo(x, y);
        _this.context.closePath();
        _this.context.strokeStyle = color[i];
        _this.context.lineWidth = mainAction.get("size", i);
        _this.context.stroke();
      }
    }
  }

  this.clearCanvas = function () {
    _this.mainAction.clearHistory()'
    _this.redraw();
  }

  this.sync = function ( ){
    // Send ajax request with information inside the List object. 
    $ajax
   };
    setInterval( sync, syncInterval);
    this.clientList

  }

  // This is pretty fucked up code. 
  function paint_bucket(startX, startY, curClickColor){
    var pixelStack = [[startX, startY]];
    curClickColor = rgbaStringToObject(curClickColor);
    var colorLayer = context.getImageData(0,0,canvas_width,canvas_height);	  
    var startColor = context.getImageData(startX,startY,1,1).data;
    var startR = startColor[0];
    var startG = startColor[1];
    var startB = startColor[2];
    var startA = startColor[3];
    
    var newPos, x, y, pixelPos, reachLeft, reachRight;

    
    while(pixelStack.length)
    {
      newPos = pixelStack.pop();
      
      x = newPos[0];
      y = newPos[1];
      
      pixelPos = (y*canvas_width + x) * 4;
      while(y-- >= 0 && matchStartColor(pixelPos, colorLayer,startR,startG,startB,startA))
      {
      pixelPos -= canvas_width * 4;
      }
      pixelPos += canvas_width * 4;
      ++y;
      reachLeft = false;
      reachRight = false;
      while(y++ < canvas_height-1 && matchStartColor(pixelPos,colorLayer,startR,startG,startB,startA))
      {
      colorPixel(pixelPos, colorLayer, curClickColor);

      if(x > 0)
      {
        if(matchStartColor(pixelPos - 4,colorLayer,startR,startG,startB,startA))
        {
        if(!reachLeft){
          pixelStack.push([x - 1, y]);
          reachLeft = true;
        }
        }
        else if(reachLeft)
        {
        reachLeft = false;
        }
      }
      
      if(x < canvas_width-1)
}
