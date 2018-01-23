import * as U from './util.js'

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

export let BASIC_FLOOR = {
  STAIRS: [
    ['#', '#', '#', '#', '#'],
    ['#', '.', '.', '.', '#'],
    ['#', '.', '-', '.', '#'],
    ['#', '.', '.', '.', '#'],
    ['#', '#', '.', '#', '#']
  ],

  TEST: [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['a', 'b', 'c']
  ]
}
