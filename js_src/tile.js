import {DisplaySymbol} from './display_symbol.js';

export class Tile extends DisplaySymbol{
  constructor(character, fg, bg, name){
    super(character, fg, bg);
    this.name = name;
  }
}
