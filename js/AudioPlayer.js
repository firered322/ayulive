var audioCtx;
var audioBuffer;
var recorder;

const CHANNELS      = 1;
const SAMPLERATE    = 8000;

const FRAMECOUNT    = SAMPLERATE * 11.0;

var AudioContext = window.AudioContext || window.webkitAudioContext;

var mediaStreamInSource;
var mediaStreamOutSource;

var audioContext;

var mediaRecorder;

var audioBuffer = [];

var wantsToRecord = false;

var count = 0;

var _audioInCallBack  = null;

var captureNode = null;

var playBackNode = null;

var playBackBuffer = null;

var playBackBufferAssigned = false;

const RECORDER_OPTIONS = {
    mimeType : "audio/webm"
}

function successCallbackOut(stream){
    // gotStreamOut(stream);
}

var onRecDataIn = function(e){
    e.data.arrayBuffer().then(response=>{
        if(wantsToRecord){
            keepRecord(new Int8Array(response));
        }

        var temp;

        if (response.byteLength % 2 != 0){      
            temp = new Int16Array(response.slice(1,response.byteLength));             
        } else {
            temp = new Int16Array(response);
        }                            
    })
}

function setCallBackToAudioIn(audioInCallBack){
    _audioInCallBack = audioInCallBack;
}

function plotLive(data){
    data.forEach(function(amp){
        plot(amp, 0.1);
    })
}

function saveWAV(){

}

function keepRecord(data){
    data.forEach(function(sample){
        audioBuffer.push(sample);
    });
}

function initRecorder(stream){
    mediaRecorder = new MediaRecorder(stream, RECORDER_OPTIONS);         
}

function startRecorder(){
    mediaRecorder.ondataavailable = onRecDataIn;    
    mediaRecorder.start();
    count ++;
    console.log("Count " + count);

    function request(){        
        mediaRecorder.requestData();
    }

    setInterval(request, 500);
}

function stopRecorder(){
    mediaRecorder.stop();
}

function successCallbackIn(stream){
    gotStreamIn(stream);    
}

function pause(){
    mediaStreamInSource.disconnect();
}

function gotStreamIn(stream){      
    mediaStreamInSource = audioContext.createMediaStreamSource(stream);

    mediaStreamInSource.connect(captureNode);
    captureNode.connect(audioContext.destination);
    
    // setInterval(pause, 3000);
}

function gotStreamOut(stream){
    
}

function errorCallback(error){
    console.log(error);
}

function initAudio(){   

    audioContext = new AudioContext({
        sampleRate: SAMPLERATE,
        sampleSize: 16,
        channelCount: 1
    });

    audioBuffer = audioContext.createBuffer(CHANNELS, FRAMECOUNT, SAMPLERATE);

    setupCaptureNode();
    setupPlayBackNode();

    navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {                
            for(var i = 0; i < devices.length; i++){
                if(devices[i].label.search("USB") != -1){
                    console.log(devices[i].kind + " " + devices[i].label);
                    initWithDevice(devices[i].deviceId);             
                    break;
                }                    
            }            
        })
        .catch(function(err) {
            console.log(err.name + ": " + err.message);
        });        
}

function setupPlayBackNode(){
    playBackNode = audioContext.createBufferSource();
}

function _onAudioProcess(audioEvent){
    playBackBuffer = audioEvent.inputBuffer;

    if(! playBackBufferAssigned){
        playBackNode.buffer = playBackBuffer;
        playBackNode.connect(audioContext.destination);        
        playBackNode.start();
        playBackBufferAssigned = true;
    }            

    if(_audioInCallBack != null){
        // Buffer here
        _audioInCallBack(convertoFloat32ToInt16(playBackBuffer.getChannelData(0)));
    }
}

function setupCaptureNode(){
    captureNode = audioContext.createScriptProcessor(0, 1, 1);
    captureNode.onaudioprocess = _onAudioProcess;
}

function convertoFloat32ToInt16(buffer) {
    var l = buffer.length;  //Buffer
    var buf = new Int16Array(l/3);
  
    while (l--) {
        s = Math.max(-1, Math.min(1, buffer[l]));
        buf[l] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        //buf[l] = buffer[l]*0xFFFF; //old   //convert to 16 bit
    }    

    return buf.buffer;
}

function initWithDevice(_deviceId){    

    var constraintsIn = {
        deviceId: { exact: _deviceId },
        audio: true,        
        volume: 1.0,
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1
    }

    var mediaIn  = navigator.getUserMedia(constraintsIn, successCallbackIn, errorCallback);
}