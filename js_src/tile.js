import {DisplaySymbol} from './display_symbol.js';

export class Tile extends DisplaySymbol{
  constructor(data){
    super(data);
    this.name = data.name || '';
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

export let TILESTORE = {
  getTile: function(chr){
    if(!this.tiles[chr]){
      this.tiles[chr] = new Tile({'chr': chr});
    }
    return this.tiles[chr];
  },

  tiles: {}

}

export let TILES = {
  NULLTILE: new Tile({name:'NULLTILE', chr:'-', transparent: false, passable: false}),
  WALL: new Tile({name:'WALL', chr:'#', transparent: false, passable: false}),
  FLOOR: new Tile({name:'FLOOR', chr:'.', transparent: true, passable: true}),
  GLASS: new Tile({name: 'GLASS', chr:'.', transparent: true, passable: false})
}
