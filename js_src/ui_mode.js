import * as U from './util.js';
import {Message} from './message.js';

class UIMode{
  constructor(game){
    console.log("created "+this.constructor.name);
    this.game = game;
  }

  enter(){
    console.log("entering "+this.constructor.name);
  }
  exit(){
    console.log("exiting "+this.constructor.name);
  }
  handleInput(eventType, evt){
    console.log("handing input for "+this.constructor.name);
    console.log(`event type is ${eventType}`);
    console.dir(evt);
    return false;
  }
  renderMain(display){
    display.drawText(2, 2, "rendering "+this.constructor.name);
  }
  renderAvatar(display){
    display.drawText(2, 2, "this is avatar");
  }

}

export class StartupMode extends UIMode{
  constructor(game){
    super(game);
  }

  enter(){

  }

  renderMain(display){
    display.drawText(2, 1, "Welcome to... (user must provide own drumroll)")
    U.drawTextWithSpaces(display, 2, 2, "  _____ _      _    _          _ _____                                 ");
    U.drawTextWithSpaces(display, 2, 3, " |  __ (_)    | |  | |        | |  __ \\                                ");
    U.drawTextWithSpaces(display, 2, 4, " | |__) |  ___| | _| | ___  __| | |__) |__  _ __   ___ ___  _ __ _ __  ");
    U.drawTextWithSpaces(display, 2, 5, " |  ___/ |/ __| |/ / |/ _ \\/ _` |  ___/ _ \\| '_ \\ / __/ _ \\| '__| '_ \\ ");
    U.drawTextWithSpaces(display, 2, 6, " | |   | | (__|   <| |  __/ (_| | |  | (_) | |_) | (_| (_) | |  | | | |");
    U.drawTextWithSpaces(display, 2, 7, " |_|   |_|\\___|_|\\_\\_|\\___|\\__,_|_|   \\___/| .__/ \\___\\___/|_|  |_| |_|");
    U.drawTextWithSpaces(display, 2, 8, "                                           | |                         ");
    U.drawTextWithSpaces(display, 2, 9, "                                           |_|                         ");
    display.drawText(2, 15, "Press any key to continue...")
  }

  handleInput(eventType, evt){
    console.dir(evt);
    if(eventType == "keyup"){
      this.game.switchMode('persistence');
      return true;
    }
    return false;
  }
}

export class PlayMode extends UIMode{
  constructor(game){
    super(game);
  }

  renderMain(display){
    display.drawText(2, 2, "Playing the game");
    display.drawText(2, 3, "w to win, l to lose");
  }

  handleInput(eventType, evt){
    if(eventType == "keyup"){
      if(evt.key == "w"){
        this.game.switchMode('win');
        return true;
      }
      else if(evt.key == "l"){
        this.game.switchMode('lose');
        return true;
      }
      else if(evt.key == "m"){
        this.game.switchMode('messages');
        return true;
      }
    }
    return false;
  }
}

export class WinMode extends UIMode{
  constructor(game){
    super(game);
  }

  enter(){
    console.log("You win");
    Message.send("You win!")
  }

  renderMain(display){
    display.drawText(2, 2, "You have won the game of PickledPopcorn")
    display.drawText(2, 15, "Press any key to restart...")
  }

  handleInput(eventType, evt){
    if(eventType == "keyup"){
      this.game.switchMode('startup');
      return true;
    }
    return false;
  }
}

export class LoseMode extends UIMode{
  constructor(game){
    super(game);
  }

  enter(){
    console.log("You lose");
    Message.send("You lose!");
  }

  renderMain(display){
    display.drawText(2, 2, "You lose!");
    display.drawText(2, 15, "Press any key to restart...")
  }

  handleInput(eventType, evt){
    if(eventType == "keyup"){
      this.game.switchMode('startup');
      return true;
    }
    return false;
  }
}

export class MessagesMode extends UIMode{
  constructor(game){
    super(game);
  }

  enter(){
    console.log("Entering Messages mode");
    this.messageIndex = Message.getMessages().length-1;
    this.lines = 20;
  }

  renderMain(display){
    let messageQueue = Message.getMessages();
    let bottom = 23;
    display.drawText(2, 0, "Viewing message history. Arrow Keys to navigate")
    display.drawText(2, 1, "Message " + (this.messageIndex+1) + "/" + messageQueue.length);
    for(let i=0; i < this.lines; i++){
      if(i > this.messageIndex){
        break;
      }
      display.drawText(2, bottom-i, messageQueue[this.messageIndex-i]);
    }
  }

  handleInput(eventType, evt){
    if(eventType == "keyup"){
      if(evt.key == "Escape" || evt.key == "m"){
        this.game.switchMode('play');
        return true;
      }
    }
    if(eventType == "keydown"){
      if(evt.key == "ArrowUp"){
        if(this.messageIndex >= this.lines){
          this.messageIndex--;
          return true;
        }
      }
      if(evt.key == "ArrowDown"){
        if(this.messageIndex < Message.getMessages().length-1){
          this.messageIndex++;
          return true;
        }
      }
    }
    return false;
  }

}


export class PersistenceMode extends UIMode{
  constructor(game){
    super(game);
  }

  enter(){
    console.log("Entering Persistence mode");
    if (this.loadGameList().length > 0){
      this.game.hasSaved = true;
    }
  }

  renderMain(display){
    display.drawText(2, 0, 'Persistence Mode');
    if(!this.loading){
      display.drawText(2, 3, '[n] - New game');
      let loadColor = null;
      if(this.game.hasSaved){
        loadColor = this.game.settings.activeTextColor;
      }
      else{
        loadColor = this.game.settings.disabledTextColor;
      }
      console.log(loadColor);
      display.drawText(2, 4, U.applyColor('[l] - Load game', loadColor));
      let saveColor = null;
      if(this.game.isPlaying){
        saveColor = this.game.settings.activeTextColor;
      }
      else{
        saveColor = this.game.settings.disabledTextColor;
      }
      display.drawText(2, 5, U.applyColor('[s] - Save game', saveColor));
    }
    else{
      display.drawText(2, 3, '[b/l] - Back');
    }
  }

  loadGameList(){
    if(!this.localStorageAvailable()){
      return Array();
    }
    let saveListPath = this.game._PERSISTANCE_NAMESPACE + '_' + this.game._SAVE_LIST_NAMESPACE;
    let saveListString = window.localStorage.getItem(saveListPath);
    if(!saveListString){
      return Array();
    }
    return JSON.parse(saveListString);
  }

  //Code from https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
  //Retrieved 2018-01-08
  localStorageAvailable() {
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

  handleInput(eventType, evt){
    if(eventType == "keyup"){
      if(!this.loading){
        if(evt.key == "n"){
          this.game.switchMode('play');
          return true;
        }
        if(evt.key == "l"){
          if(this.game.hasSaved){
            this.loading = true;
            return true;
          }
        }
        if(evt.key == "s"){
          if(this.game.isPlaying){
            this.save();
            this.game.switchMode('play');
            return true;
          }
        }
      }
      else{
        if(evt.key == "b" || evt.key == "l"){
          this.loading = false;
          return true;
        }
      }
    }
    return false;
  }

  save(){
    Message.send("Saving...");
  }

}
