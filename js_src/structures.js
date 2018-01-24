import * as U from './util.js';
import ROT from 'rot-js';
import {Tile, TILES} from './tile.js';

export function rotate(grid, dir){
  //dir: -1 is ccw, 0 is none, 1 is cw

  if(dir==0){
    return grid;
  }

  let rows = grid.length;
  let columns = grid[0].length;

  let newGrid = U.init2DArray(columns, rows, '-');
  for(let xi = 0; xi < columns; xi++){
    for(let yi = 0; yi < rows; yi++){
      if(dir > 0){
        newGrid[xi][rows-yi-1] = grid[yi][xi];
      }
      else{
        newGrid[columns-xi-1][yi] = grid[yi][xi];
      }
    }
  }

  if(dir==2){
    newGrid = rotate(newGrid, 1);
  }

  return newGrid;

}

export function parseCharsToTiles(grid){
  //parses a grid of chars and converts it to a grid of tiles
  let ydim = grid.length;
  let xdim = grid[0].length;

  let tileGrid = U.init2DArray(ydim, xdim, TILES.NULLTILE);

  for(let row = 0; row < ydim; row++){
    for(let col = 0; col < xdim; col++){
      tileGrid[ydim-row-1][col] = charsToTiles[grid[row][col]];
    }
  }

  return tileGrid;
}

export function tryPlaceStructure(canvas, structure, canvasX, canvasY, dir){

  if(dir){
    structure = rotate(structure, dir);
  }

  //places *middle* of structure at cX, cY in canvas grid
  //calculate midpoint of structure
  let structureWidth = structure[0].length;
  let structureHeight = structure.length;
  //Mids may mess up on rotation
  let midX = Math.floor(structureWidth/2);
  let midY = Math.floor(structureHeight/2);

  //from this, calculate top left corner pos in canvas
  let canvasTLY = canvasY - midX;
  let canvasTLX = canvasX - midY;

  //loop through struct width
  for(let xi = -1; xi < structureWidth+1; xi++){
    for(let yi = -1; yi < structureHeight+1; yi++){
      if(!(canvas[yi+canvasTLX][xi+canvasTLY].isA('floor'))){
        console.log('failed to place a thing');
        return false;
      }
    }
  }

  mergeGrids(canvas, structure, canvasX, canvasY);
}

export function mergeGrids(canvas, structure, canvasX, canvasY){
  //places *middle* of structure at cX, cY in canvas grid
  //calculate midpoint of structure
  let structureWidth = structure[0].length;
  let structureHeight = structure.length;
  //Mids may mess up on rotation
  let midX = Math.floor(structureWidth/2);
  let midY = Math.floor(structureHeight/2);

  //from this, calculate top left corner pos in canvas
  let canvasTLY = canvasY - midX;
  let canvasTLX = canvasX - midY;

  //now loop in struct and place the tiles
  //null tiles in the struct are ignored, meant to be 'transparency' in the struct
  for(let xi = 0; xi < structureWidth; xi++){
    for(let yi = 0; yi < structureHeight; yi++){
      if(structure[yi][xi] === TILES.NULLTILE){
        continue;
      }
      else{
        //console.log(`stair: ${yi+canvasTLY},${xi+canvasTLX}`);
        canvas[yi+canvasTLX][xi+canvasTLY] = structure[yi][xi];
      }
    }
  }

}

export function getRandomStructure(structureSet){//probably a bad implementation
  let structs = Array();
  for(let struct in structureSet){
    let n = structureSet[struct].chance;
    for(let i = 0; i < n; i++){
      structs.push(structureSet[struct]);
    }
  }
  let index = Math.floor(ROT.RNG.getUniform()*structs.length);
  //console.dir(structs);
  //console.log(index);
  return structs[index].grid;
}

let charsToTiles = {
  '#': TILES.WALL,
  '.': TILES.FLOOR,
  '|': TILES.GLASS,
  '-': TILES.NULLTILE,
  'C': new Tile({name: 'mob_seed', chr: '?', seedData: {mobName: 'chris'}}),
  'd': new Tile({name: 'mob_seed', chr: '?', seedData: {mobName: 'jdog'}})
  //0-9 can be loot chests - different
  //a-z mob seeds
}

export let BASIC_FLOOR = {
  STAIRS: {
    grid: [
      ['#', '#', '#', '#', '#'],
      ['#', '.', '.', '.', '#'],
      ['#', '.', '-', '.', '#'],
      ['#', '.', '.', '.', '#'],
      ['#', '#', '.', '#', '#']
    ],
    chance: 0
  },

  TEST1:{
    grid: [
      ['-','#','-'],
      ['#','#','-'],
      ['-','#','-'],
      ['-','#','-'],
      ['#','#','#']
    ],
    chance: 1
  },

  TEST2:{
    grid: [
      ['-','#','-'],
      ['#','-','#'],
      ['-','-','#'],
      ['-','#','-'],
      ['#','#','#']
    ],
    chance: 2
  },

  TEST3:{
    grid: [
      ['#','#','#'],
      ['-','-','#'],
      ['-','#','#'],
      ['-','-','#'],
      ['#','#','#']
    ],
    chance: 3
  },

}
