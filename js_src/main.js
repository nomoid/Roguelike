import 'babel-polyfill';
import ROT from 'rot-js';
import {Game} from './game.js';

window.onload = function(){
  console.log("starting WSRL - window loaded")
  // Check if rot.js can work in the browser
  if(!ROT.isSupported()){
    alert("The rot.js library isn't supported by your browser.");
    return;
  }

  Game.init();

  // Add the containers to our HTML page
  document.getElementById('wsavatar').appendChild(Game.getDisplay('avatar').getContainer());
  document.getElementById('wsmain').appendChild(Game.getDisplay('main').getContainer());
  document.getElementById('wsmessage').appendChild(Game.getDisplay('message').getContainer());

  Game.render();
}
