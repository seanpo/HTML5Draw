/************** Default Variables ****************
*  Author: Sean Po
*  Only change these flags. Unless you really want to change the other stuff.
*/
var DEFAULT_ACTION_COLOR = "rgba(0,0,0,1)"; // black
var DEFAULT_ACTION_SIZE = 3; // 3px
var DEFAULT_ACTION_OPACITY = 1; // fully opaque

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
  this.length = 0;
  
  // This function gets the specific action item in the given index
  this.get = function (key, index) {
    if (["x","y"].indexOf(key) !== -1){
      return _this.history["click"][key][index];
    } else { 
      return _this.history[key][index];
    }
  }

  this.history = this.createHistory();

  this.setHistory = function (history){
    _this.history = history;
  }

  this.clearHistory = function () {
    this.history = createHistory();
  };

  this.toJSON = function () { 
    return JSON.stringify(_this.history);
  }

  this.color = DEFAULT_ACTION_COLOR; 
  this.prevColor = DEFAULT_ACTION_COLOR;
  this.size = DEFAULT_ACTION_SIZE;
  this.drag = false;
  this.paintBucket = false;

  this.setColor = function ( color ) {
    _this.prevColor = _this.color;
    _this.color = color;
  };

  this.setSize = function ( size ) {
    _this.size = size;
  };

  this.setDrag = function () {
    _this.drag = true;
  };

  this.unsetDrag = function () {
    _this.drag = false;
  };

  this.togglePaintBucket = function () {
    _this.paintBucket = _this.paintBucket;
  }

  this.isEmpty = function () {
    // If this' x array is of length 0, then you know history is empty;
    return _this.history["click"]["x"].length == 0;
  }

  this.length = function () {
    return _this.history["click"]["x"].length;
  }

  this.update = function(click){
    var _history = _this.history;
    _history['click']['x'].push(click['x']);
    _history['click']['y'].push(click['y']);

    // This if statement is to get rid of the issue where when someone undo, the first dot still remains.
    _history['paintBucket'].push(_this.paintBucket);
    if (_this.drag && _this.length != 0) {
      _history['drag'][_this.length] = true;
    }

    _history['drag'].push(_this.drag);
    _history['size'].push(_this.size);
    _history['color'].push(_this.color);
  }

  // This function recieves a set similar to that of history and updates the current History with it 
  this.updateSet = function ( set ){
      var _history = _this.history;
      var pushX = set['click']['x'];
      var pushY = set['click']['y'];

      for (index in pushX){
        _history['click']['x'].push(pushX[index]);
        _history['click']['y'].push(pushY[index]);
      }

      _history['drag'].concat(set['drag']);
      _history['size'].concat(set['size']);
      _history['color'].concat(set['color']);
  };
  
}

/*********************************************/

HTML5Draw = function (dom) {
  var _this = this;

  this.domID = dom;

  this.$canvas = $('#' + dom );
  this.canvas = document.getElementById(dom);

  // Set up context, and set styles:
  this.context = this.canvas.getContext("2d");
  this.context.lineJoin = "miter";
  this.context.canvas.height = this.$canvas.height();
  this.context.canvas.width = this.$canvas.width();

  this.setLineJoin = function (type){
    _this.context.lineJoin = type;
  };

  // This is the consolidated Action List that is recieved from server
  this.actionList = [];
  // This is the information caught in the Stanza
  this.stanza = new DrawAction();

  this.drawStanza = function (stanza){
    var length = stanza.length();
     
    for(var i = 0; i < length; i++){       
      // If the step is to apply the paintbucket, then the location, and drawing is uneccesary
      var x = stanza.get("x", i);
      var y = stanza.get("y", i);
      var color = stanza.get("color", i);

      if (stanza.get("paintBucket", i)){
        _paintBucket(x, y, color);
      } else {
        _this.context.beginPath();
        if(stanza.get("drag", i) && i != 0){
           _this.context.moveTo(stanza.get("x", i - 1), stanza.get("y", i - 1));
        } else {
           _this.context.moveTo(x - 1, y);
        }
        _this.context.lineTo(x, y);
        _this.context.closePath();
        _this.context.strokeStyle = color;
        _this.context.lineWidth = stanza.get("size", i);
        _this.context.stroke();
      }
    }
  };

  this.redraw = function () {
    for ( index in _this.actionList ) {
      var stanza = _this.actionList[index]; 
      _this.drawStanza(stanza);
    }
  };

  this.draw = function () {
    _this.drawStanza(_this.stanza);    
  };

  this.clearCanvas = function () {
    _this.actionList = [];
    _this.redraw();
  };
  
  /********************* Canvas Tools ***************************************/
  this.toPNG = function (){
    return Canvas2Image.saveAsPNG(_this.canvas)
  };

  /********************* Utility Functions ***********************************/
  // converts an event object to 
  this._createAction = function (e){
    var $this = _this.$canvas;
    return { x : e.pageX - $this.offset().left, 
             y : e.pageY - $this.offset().top};
  };

  /********************* Actions *********************************************/
  this.$canvas.mousedown( function (e) {
    _this.stanza.update( _this._createAction(e) );
    _this.stanza.setDrag();

    _this.draw()

    _this.$canvas.trigger("updateCanvas");
  });

  $(document).mouseup( function () {
    _this.stanza.unsetDrag();
    _this.actionList.push(_this.stanza);

    _this.redraw();

    _this.$canvas.trigger("stanzaComplete", [_this.stanza]);
    // A mouseup signifies a new stanza
    _this.stanza = new DrawAction();
  });

  this.$canvas.mousemove( function (e) {
    if ( _this.stanza.drag && !_this.stanza.paintBucket ){
      _this.stanza.update( _this._createAction(e) );

      _this.draw();

      _this.$canvas.trigger("updateCanvas");
    }
  });

  // This is pretty fucked up code. 
  /*
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
  */
}
