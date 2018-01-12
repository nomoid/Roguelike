import {DisplaySymbol} from './display_symbol.js';

class Tile extends DisplaySymbol{
  constructor(data){
    super(data);
    this.name = data.name;
  }
}

export let TILES = {
  NULLTILE: new Tile({name:'nulltile', chr:'-'}),
  WALL: new Tile({name:'wall', chr:'#'}),
  FLOOR: new Tile({name:'floor', chr:'.'})
}
