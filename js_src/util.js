import {DATASTORE} from './datastore.js';
import ROT from 'rot-js';

export function utilAlert(){
  document.write("this is a util function<br/>");
}

export function printTest(){
  console.log("Some important piece of information that needs to be logged");
}

export function drawTextWithSpaces(display, x, y, text){
  if(text.charAt(0) == ' '){
    for(let i = 1; i < text.length; i++){
      if(text.charAt(i) == ' '){
        x++;
      }
      else{
        break;
      }
    }
  }
  display.drawText(x, y, text);
}

export function applyColor(text, color){
  return '%c{' + color + '}' + text + '%c{}';
}

export function removeByValue(array, element){
  const index = array.indexOf(element);

  if(index !== -1){
    array.splice(index, 1);
  }
}

export function init2DArray(xdim, ydim, initialValue){
  let a = Array();
  for(let x = 0; x < xdim; x++){
    a[x] = Array();
    for(let y = 0; y < ydim; y++){
      a[x][y] = initialValue;
    }
  }
  return a;
}

let randCharSource = '1234567890abcdefghijklmnopqrstuvwxyz'.split('');
export function uniqueId(tag){
  let origRngState = ROT.RNG.getState();
  if(RNG_STATE.NONE){
    ROT.RNG.setState(RNG_STATE.NONE);
  }
  let id = '';
  for (let i=0; i<4; i++){
    id += randCharSource.random();
  }
  id = `${tag ? tag+'-' : ''}${DATASTORE.ID_SEQ}-${id}`;
  DATASTORE.ID_SEQ++;
  RNG_STATE.NONE = ROT.RNG.getState();
  ROT.RNG.setState(origRngState);
  return id;
}

let mapSeedModulo = 2147483647; //2**31 - 1, prime number
let RNG_STATE = {};

export function getMapSeedModulo(){
  return mapSeedModulo;
}

export function mapSeedFromFloor(mapRNGData, floor){
  let initSeed = mapRNGData.initSeed;
  let offset = mapRNGData.offset;
  return (initSeed + (floor * offset)) % mapSeedModulo;
}

export function mapExitFromSeed(data){
  //odd floors have exit on top, even have exit on bottom
  let xdim = data.xdim;
  let ydim = data.ydim;
  let mapSeed = data.mapSeed;
  let floor = data.floor;

  let border = 6;
  let partitionWidth = ydim/3;
  let exitX, exitY;

  let origRngState = ROT.RNG.getState();
  ROT.RNG.setSeed(mapSeed+2);

  if(floor%2==0){
    console.log(floor);
    exitY = Math.floor(ROT.RNG.getUniform()*partitionWidth+(ydim-border-partitionWidth));
  }
  else{
    console.log(floor );
    exitY = Math.floor(ROT.RNG.getUniform()*partitionWidth+(border));
  }
  exitX = Math.floor(ROT.RNG.getUniform()*(xdim-border*2));

  ROT.RNG.setState(origRngState);
  console.log(`${exitX},${exitY}`);
  return `${exitX},${exitY}`;

}

export function getRandomSeed(){
  return Math.trunc(ROT.RNG.getUniform() * mapSeedModulo);
}

export function getRandomNoStateSeed(){
  return Math.trunc(Math.random() * mapSeedModulo);
}

export function setupNoState(){
  ROT.RNG.setSeed(Math.trunc(getRandomNoStateSeed() * mapSeedModulo));
  RNG_STATE.NONE = ROT.RNG.getState();
}

export function getNoStateUniform(){
  let origRngState = ROT.RNG.getState();
  if(RNG_STATE.NONE){
    ROT.RNG.setState(RNG_STATE.NONE);
  }
  let uniform = ROT.RNG.getUniform();
  RNG_STATE.NONE = ROT.RNG.getState();
  ROT.RNG.setState(origRngState);
  return uniform;
}

//Code from https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
//Retrieved 2018-01-08
export function localStorageAvailable() {
  try {
      var x = '__storage_test__';
      window.localStorage.setItem(x, x);
      window.localStorage.removeItem(x);
      return true;
  }
  catch(e) {
      Message.send('Browser cannot save or load!');
      return false;
  }
}
