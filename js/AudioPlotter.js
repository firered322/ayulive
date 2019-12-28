const XINDX = 0;
const YINDX = 1;

const P0 = "p0";
const P1 = "p1";

const MAXX = "MAXX";
const MINX = "MINX";
const MAXY = "MAXY";
const MINY = "MINY";

const MAX_DATA_POINTS = "MAX_DATA_POINTS";

var ctx;
var content_width;
var content_height; 

var _props;

var lastX = 0;
var lastY = 0;

var consumedX = 0;

var dataPointsMax = 0;

var dataPoints = [];

var audioData = [];

var start = 0;
var end   = 1000;

var consumed = 0;

var recordingsList = document.getElementById('recordingsList')

function init(props){
    _props = props;

    var canvas = document.getElementById(_props["canvasId"]);
    ctx = canvas.getContext("2d");

    ctx.fillStyle = _props["clearColor"];

    content_width  = canvas.width; 
    content_height = canvas.height;
}

function clear(){
    
    ctx.fillRect(   0,
                    0,
                    content_width,
                    content_height);
}

function _map(_in, in_min, in_max, out_min, out_max){
    return (_in - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function plot(amp, diff){

    var data0 = {
        "p0" : [lastX, lastY],
        "p1" : [lastX + diff, amp]
    }
    
    lastX += diff;  
    lastY = amp;
    
    _drawLine(data0);
}

function addAmp(amp, diff){    

    clear();

    if(consumed > content_width){
        audioData.pop();                
        audioData.unshift([amp, diff]);        
    }else{
        audioData.push([amp, diff]);
    }

    var __last_X = 0;
    var __last_y = 0;

    audioData.forEach(function(_data){        
        var __amp   = _data[0];
        var __diff  = _data[1]
        
        var __data = {
            "p0" : [__last_X, __last_y],
            "p1" : [__last_X + __diff, __amp]
        }

        __last_X += __diff;
        __last_y = __amp;             

        _drawLine(__data);
    });
    
    // plot(amp, 0.1);
}

function startRender(){

}

function startPlot(data){            

  clear();

  data.forEach(function(amp){
      plot(amp, 1);
  });    

  start += SPEED;
  end   += SPEED;        
}

function openFile(filePath) {
  fetch(filePath)
  .then(response => response.arrayBuffer())  
  .then(buffer => {
      var _filterData = filterData(new Int16Array(buffer));        
      
      audioData = _filterData;
      startPlot(getRequiredArray(audioData, start, end));

      let myFunc = () => {            
          if(start > audioData.length){
              return;
          }

          startPlot(getRequiredArray(audioData, start, end));
      }

      setInterval(myFunc, 200);
  });
};

function _drawLine(data){
    ctx.strokeStyle = _props["strokeColor"];
    ctx.beginPath();

    var x0 = _map(  data[P0][XINDX], /** input x0 co-ord */
                    _props[MINX],
                    _props[MAXX],
                    0,
                    content_width);

    var y0 = _map(  data[P0][YINDX], /** input y0 co-ord */        
                    _props[MINY],
                    _props[MAXY],
                    content_height,
                    0);                   

    var x1 = _map(  data[P1][XINDX], /** input x1 co-ord */
                    _props[MINX],
                    _props[MAXX],
                    0,
                    content_width);

    var y1 = _map(  data[P1][YINDX], /** input y1 co-ord */                    
                    _props[MINY],
                    _props[MAXY],
                    content_height,
                    0);                    
    
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);

    ctx.stroke();
      
    consumed = x1;
}

function filterData(data){

    const STEP = 80;

    const filteredData = [];    

    for(var i = 0; i < data.length; i += STEP){      
        getMinMax(getRequiredArray(data ,i, i + STEP)).forEach(ele => {
            filteredData.push(ele);
        })
    }

    return filteredData;
  }

function getRequiredArray(data, start, end){
    ret = [];
    var size = end - start;

    for(var i = start; i <= end; i++){
        ret.push(data[i]);
    }

    return ret;
}

function byteToShort(dataIn){
    ret = [];

      for(var i = 0, j = 0; i < dataIn.length; i+=2, j++){
          ret.push(byteToInt(dataIn[i], dataIn[i + 1]));
      }

    return ret;
}

function byteToInt(one, two){
  var low  = one & 0xff;
  var high = two & 0xff;

  return ( high << 8 | low );
}

function getMinMax(amps){
  var MAX = -10000;
  var MIN =  0;

  var ret = [];

  amps.forEach(amp => {
    
      if(amp > MAX){
        MAX = amp;
      } 

      if(amp < MIN){
        MIN = amp;
      }

  });

  ret.push(MIN);
  ret.push(MAX);

  return ret;
}

// function createDownloadLink(blob,encoding) {
	
// 	var url = URL.createObjectURL(blob);
// 	var au = document.createElement('audio');
// 	var li = document.createElement('li');
// 	var link = document.createElement('a');

// 	au.controls = true;
// 	au.src = url;

// 	link.href = url;
// 	link.download = "audio" + '.'+encoding;
// 	link.innerHTML = link.download;


// 	li.appendChild(au);
// 	li.appendChild(link);

// 	recordingsList.appendChild(li);
// }

function generateDownloadLink(blob){
    var url = URL.createObjectURL(blob);
}

