import * as U from './util.js';

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
  render(display){
    display.drawText(2, 2, "rendering "+this.constructor.name)
  }

}

export class StartupMode extends UIMode{
  constructor(game){
    super(game);
  }

  render(display){
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
    if(eventType == "keyup"){
      this.game.switchMode('play');
      return true;
    }
    return false;
  }
}

export class PlayMode extends UIMode{
  constructor(game){
    super(game);
  }

  render(display){
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
  }

  render(display){
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
  }

  render(display){
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
