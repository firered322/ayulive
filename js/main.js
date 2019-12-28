props = {
    "canvasId" : "drawCanvas",
    "clearColor" : "#777777",

    "strokeColor" : "#00FF00",

    MAXX            : 100,
    MINX            : 0,
    MAXY            : 50000,
    MINY            : -50000,
    MAX_DATA_POINTS : 2000
}

const SPEED = 100; // point per frame at 60 FPS rate

init(props);

clear();

var plotted = false;

startNewWave();

setCallBackToAudioIn(function(data){
    
    addSamples(new Int16Array(data));
    
    // TODO: Craete a function to save wav audio
    var filtered = filterData(new Int16Array(data));    
    filtered.forEach(function(amp){
        addAmp(amp, 0.5);
    })
});

initAudio();

function save(){    
    save_wav();
}

setTimeout(save, 3000);

// openFile("../files/2019_11_26_15_15_18.wav");
