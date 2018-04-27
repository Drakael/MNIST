// when html loaded, launch init/binding functions
$(document).ready(function(){
    init();
});
//init/binding launching
function init(){
    //create canvas
    canvasDiv = document.getElementById('canvasDiv');
    canvas = document.createElement('canvas');
    canvas.setAttribute('width', canvasWidth);
    canvas.setAttribute('height', canvasHeight);
    canvas.setAttribute('id', 'canvas');
    canvasDiv.appendChild(canvas);
    context = canvas.getContext("2d");
    //draw when you click
    $('#canvas').mousedown(function(e){
      canvasDiv = $('#canvasDiv')
      var mouseX = e.pageX - canvasDiv.offset().left;
      var mouseY = e.pageY - canvasDiv.offset().top - 20;
      paint = true;
      addClick(mouseX, mouseY, false);
      redraw();
    });
    //draw when you move clicking
    $('#canvas').mousemove(function(e){
      if(paint){
        canvasDiv = $('#canvasDiv')
        var mouseX = e.pageX - canvasDiv.offset().left;
        var mouseY = e.pageY - canvasDiv.offset().top - 20;
        addClick(mouseX, mouseY, true);
        redraw();
      }
    });
    //stop drawing when you stop clicking
    $('#canvas').mouseup(function(e){
      paint = false;
    });
    //stop drawing when you get out the canvas
    $('#canvas').mouseleave(function(e){
      paint = false;
    });
    //clear canvas
    $('#clear').mousedown(function(e){
      context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
      context.fillStyle = colorWhite;
      context.fillRect(0,0,canvasWidth,canvasHeight);
      reset();
      e.stopPropagation();
      return false;
    });
    //submit drawn picture
    $('#submit_canvas').mousedown(function(e){
        if(clickX.length>0){
            var img = canvas.toDataURL("image/png");
            //$('#canvasDiv').append('<img src="'+img+'"/>');
            $.post($SCRIPT_ROOT + '/ajax_submit', {
                img: img
            }, function(data) {
                $("#guess").text(data.result);
            }, 'json');
        }
    });
    // making cursor waiting on form submit
    $('#submit_pic').click(function(){
        $('body').css('cursor','wait');
        $('#canvas').css('cursor','wait');
    });
};

//init useful variables
var canvasWidth = 300;
var canvasHeight = 300;

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

var colorPurple = "#cb3594";
var colorGreen = "#659b41";
var colorYellow = "#ffcf33";
var colorBrown = "#986928";
var colorBlack = "#000000";
var colorWhite = "#ffffff";

var curColor = colorBlack;
var clickColor = new Array();
var canvas = undefined
var context = undefined
var canvasDiv = undefined

function addClick(x, y, dragging){
  //fill useful arrays
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
  clickColor.push(curColor);
};

function reset(){
  //init useful arrays
  clickX = new Array();
  clickY = new Array();
  clickDrag = new Array();
  clickColor = new Array();
};

function redraw(){
  // clear canvas
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  // fill with white color
  context.fillStyle = colorWhite;
  context.fillRect(0,0,canvasWidth,canvasHeight);
  
  // init line properties
  context.strokeStyle = curColor;
  context.lineJoin = "round";
  context.lineWidth = 15;
  context.lineCap = "round";
            
  // iterate through points recorded
  for(var i=0; i < clickX.length; i++) {        
    context.beginPath();
    if(clickDrag[i] && i){
        // if dragged line
        context.moveTo(clickX[i-1], clickY[i-1]);
    }else{
        //if single dot
        context.moveTo(clickX[i]-1, clickY[i]);
    }
    context.lineTo(clickX[i], clickY[i]);
    //context.closePath();
    //context.strokeStyle = clickColor[i];
    context.stroke();
  }
};