import {DisplaySymbol} from './display_symbol.js';

export class Tile extends DisplaySymbol{
  constructor(chr, fg, bg, name){
    super(chr, fg, bg);
    this.name = name;
  }
}
