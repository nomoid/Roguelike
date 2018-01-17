import {DisplaySymbol} from './display_symbol.js';

class Tile extends DisplaySymbol{
  constructor(data){
    super(data);
    this.name = data.name;
    this.transparent = data.transparent || false;
    this.passable = data.passable || false;
  }

  isA(name){
    return this.name == name;
  }

  isPassable(){
    return this.passable;
  }

  isTransparent(){
    return this.transparent;
  }
}

export let TILES = {
  NULLTILE: new Tile({name:'nulltile', chr:'-', transparent: false, passable: false}),
  WALL: new Tile({name:'wall', chr:'#', transparent: false, passable: false}),
  FLOOR: new Tile({name:'floor', chr:'.', transparent: true, passable: true})
}
