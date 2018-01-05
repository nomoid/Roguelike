import * as U from './util.js';

class UIMode{
  constructor(){
    console.log("created "+this.constructor.name);
  }

  enter(){
    console.log("entering "+this.constructor.name);
  }
  exit(){
    console.log("exiting "+this.constructor.name);
  }
  handleInput(){
    console.log("handling input for "+this.constructor.name);
  }
  render(display){
    display.drawText(2, 2, "rendering "+this.constructor.name)
  }

}

export class StartupMode extends UIMode{
  constructor(){
    super();
  }

  render(display){
    U.drawTextWithSpaces(display, 2, 2, "  _____ _      _    _          _ _____                                 ");
    U.drawTextWithSpaces(display, 2, 3, " |  __ (_)    | |  | |        | |  __ \\                                ");
    U.drawTextWithSpaces(display, 2, 4, " | |__) |  ___| | _| | ___  __| | |__) |__  _ __   ___ ___  _ __ _ __  ");
    U.drawTextWithSpaces(display, 2, 5, " |  ___/ |/ __| |/ / |/ _ \\/ _` |  ___/ _ \\| '_ \\ / __/ _ \\| '__| '_ \\ ");
    U.drawTextWithSpaces(display, 2, 6, " | |   | | (__|   <| |  __/ (_| | |  | (_) | |_) | (_| (_) | |  | | | |");
    U.drawTextWithSpaces(display, 2, 7, " |_|   |_|\\___|_|\\_\\_|\\___|\\__,_|_|   \\___/| .__/ \\___\\___/|_|  |_| |_|");
    U.drawTextWithSpaces(display, 2, 8, "                                           | |                         ");
    U.drawTextWithSpaces(display, 2, 9, "                                           |_|                         ");

  }
}

export class PlayMode extends UIMode{
  constructor(){
    super();
  }
}

export class WinMode extends UIMode{
  constructor(){
    super();
  }
}

export class LoseMode extends UIMode{
  constructor(){
    super();
  }

  enter(){
    console.log("You lose");
  }

  render(display){
    display.drawText(2, 2, "You lose!");
  }
}
