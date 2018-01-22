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
  NULLTILE: new Tile({name:'nulltile', chr:'-', transparent: false, passable: false}),

  STAIRS_DOWN: new Tile({name:'stairs_down', chr:'>', transparent: true, passable: true}),
  STAIRS_UP: new Tile({name: 'stairs_up', chr:'<', transparent: true, passable: true}),

  WALL: new Tile({name:'wall', chr:'#', transparent: false, passable: false}),
  OUTER_WALL: new Tile({name:'outer_wall', chr:'#', fg: '#a61', transparent: false, passable: false}),
  FLOOR: new Tile({name:'floor', chr:'.', transparent: true, passable: true}),
  GLASS: new Tile({name: 'GLASS', chr:'.', transparent: true, passable: false})
}
