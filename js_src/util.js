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
