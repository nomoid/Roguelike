import * as U from './util.js';
import {TILES} from './tile.js';

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
      tileGrid[row][col] = charsToTiles[grid[row][col]];
    }
  }

  return tileGrid;
}

let charsToTiles = {
  '#': TILES.WALL,
  '.': TILES.FLOOR,
  '|': TILES.GLASS,
  '-': TILES.NULLTILE
  //0-9 can be loot chests - different
  //a-z mob seeds
}

export let BASIC_FLOOR = {
  STAIRS: [
    ['#', '#', '#', '#', '#'],
    ['#', '.', '.', '.', '#'],
    ['#', '.', '-', '.', '#'],
    ['#', '.', '.', '.', '#'],
    ['#', '#', '.', '#', '#']
  ],
}
