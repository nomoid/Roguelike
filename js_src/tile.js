import {DisplaySymbol} from './display_symbol.js';

export class Tile extends DisplaySymbol{
  constructor(name, chr, fg, bg){
    super(chr, fg, bg);
    this.name = name;
  }
}

let TILES = {
  NULLTILE = new Tile('nulltile', ' '),
  WALL = new Wall('wall', '#'),
  FLOOR = new Floor('floor', '.')
}
