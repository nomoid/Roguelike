
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
    display.drawText(2, 2, "Welcome to PickledPopcorn")
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
