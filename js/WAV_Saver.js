var WAV_Buffer = [];
var saving = false;

function startNewWave(){
    saving = false;
    WAV_Buffer = [];    
}

function addSamples(samples){
    if(! saving){        
        samples.forEach(sample => {
            WAV_Buffer.push(sample);
        });
    }    
}

function getHeader(audioLen){
    var datalen = audioLen += 36;
    var waveHeader = [];

    const samplerate = 8000;

    const byterate = 16 + samplerate + 1 / 16;

    waveHeader[0]="R";
    waveHeader[1]="I";
    waveHeader[2]="F";
    waveHeader[3]="F";
    waveHeader[4]= datalen & 0xFF;
    waveHeader[5]= ((datalen >> 8) & 0xFF);
    waveHeader[6]= ((datalen >> 16) & 0xFF);
    waveHeader[7]= ((datalen >> 24) & 0xFF);
    waveHeader[8]="W"
    waveHeader[9]="A"
    waveHeader[10]="V"
    waveHeader[11]="E"
    waveHeader[12]="f"
    waveHeader[13]="m"
    waveHeader[14]="t"
    waveHeader[15]=" "
    waveHeader[16]=16
    waveHeader[17]=0
    waveHeader[18]=0
    waveHeader[19]=0
    waveHeader[20]=1
    waveHeader[21]=0
    waveHeader[22]=1 // mono channel
    waveHeader[23]=0
    waveHeader[24]= samplerate & 0xFF;
    waveHeader[25]= ((samplerate >> 8) & 0xFF) 
    waveHeader[26]= ((samplerate >> 16) & 0xFF)
    waveHeader[27]= ((samplerate >> 24) & 0xFF)
    waveHeader[28]= byterate &0xFF;
    waveHeader[29]= ((byterate >> 8) & 0xFF)
    waveHeader[30]= ((byterate >> 16) & 0xFF)
    waveHeader[31]= ((byterate >> 24) & 0xFF)
    waveHeader[32]= 4;
    waveHeader[33]= 0
    waveHeader[34]= 16 // BPP
    waveHeader[35]= 0
    waveHeader[36]="d"
    waveHeader[37]="a"
    waveHeader[38]="t"
    waveHeader[39]="a"
    waveHeader[40] = audioLen & 0xFF
    waveHeader[41] = ((audioLen >> 8) & 0xFF);
    waveHeader[42] = ((audioLen >> 16) & 0xFF);
    waveHeader[43] = ((audioLen >> 24) & 0xFF);

    return waveHeader;
}


function save_wav(){
    saving = true;
    WAV_Buffer.unshift(...getHeader(WAV_Buffer.length)) 
}
