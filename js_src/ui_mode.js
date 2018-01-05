
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
    console.log("rendering "+this.constructor.name);
    display.drawText(2, 2, "rendering "+this.constructor.name)
  }

}

export class StartupMode extends UIMode{
  constructor(){
    super();
  }
}
