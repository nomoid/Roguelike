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
export function uniqueId(){
  let id = '';
  for (let i=0; i<8; i++){
    id += randCharSource.random();
  }
  return id;
}
