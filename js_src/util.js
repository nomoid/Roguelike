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

export function applyBackground(text, color){
  return '%b{' + color + '}' + text + '%b{}';
}

export function removeByValue(array, element){
  const index = array.indexOf(element);

  if(index !== -1){
    array.splice(index, 1);
  }
}

export function distance2D(ax, ay, bx, by){
  return Math.sqrt(Math.pow(Math.abs(ax-bx), 2)+Math.pow(Math.abs(ay-by), 2));
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

  let border = 8;
  let partitionWidth = ydim/3;
  let exitX, exitY;

  let origRngState = ROT.RNG.getState();
  ROT.RNG.setSeed(mapSeed+2);

  if(floor%2==0){
    console.log(floor);
    exitY = Math.floor(ROT.RNG.getUniform()*partitionWidth+(ydim-border-partitionWidth));
  }
  else{
    console.log(floor);
    exitY = Math.floor(ROT.RNG.getUniform()*partitionWidth+(border));
  }
  exitX = Math.floor(ROT.RNG.getUniform()*(xdim-border*2)+border);

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

//Maybe implement a better version some other time
export function deepCopy(obj){
  return JSON.parse(JSON.stringify(obj));
}

//Code from https://stackoverflow.com/questions/30003353/can-es6-template-literals-be-substituted-at-runtime-or-reused
//Retrieved 2018-01-23
export function fillTemplate(templateString, templateVars){
    return new Function("return `"+templateString +"`;").call(templateVars);
}

//Code adapted from https://stackoverflow.com/questions/9083037/convert-a-number-into-a-roman-numeral-in-javascript
//Retrieved 2018-01-24
export function romanNumeral(num) {
  if(num === 0){
    return '0';
  }
  let lookup = [['M',1000],['CM',900],['D',500],['CD',400],['C',100],['XC',90],['L',50],['XL',40],['X',10],['IX',9],['V',5],['IV',4],['I',1]];
  let roman = '';
  for (let i = 0; i < lookup.length; i++) {
    while ( num >= lookup[i][1] ) {
      roman += lookup[i][0];
      num -= lookup[i][1];
    }
  }
  return roman;
}

export function roll(num, diceVal, pickNum, lowest){
  //pass in highest as false if you want to pick low
  pickNum = pickNum || num;
  if(pickNum > num){
    pickNum = num;
  }
  let total = 0;
  let dice = [];
  for (let i = 0; i < num; i++){
    let roll = Math.floor(ROT.RNG.getUniform()*diceVal)+1;
    dice.push(roll);
  }
  for(let p=0; p<pickNum; p++){
    let min, max, minIndex, maxIndex;
    if(lowest){
      min = diceVal+1;
      minIndex = 0;
    }
    else{
      max = 0;
      maxIndex = 0;
    }
    for(let n=0; n<dice.length; n++){
      if(lowest){
        if(dice[n]<min){
          min = dice[n]
          minIndex = n;
        }
      }
      else{
        if(dice[n]>max){
          max = dice[n];
          maxIndex = n;
        }
      }
    }
    if(lowest){
      total+=min;
      dice.splice(minIndex, 1);
    }
    else{
      total+=max;
      dice.splice(maxIndex, 1);
    }
  }

  return total;
}

export function successCalc(result, partition){
  for(let i = 0; i < partition.length; i++){
    if(result<partition[i]){
      return i;
    }
  }
  return partition.length;
}
//Code adapted from https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
//Retrieved 2018-01-25
export function shuffleArray(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(ROT.RNG.getUniform() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
