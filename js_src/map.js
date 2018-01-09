import {TILES} from './tile.js';
import {init2DArray} from './util.js';
import ROT from 'rot-js';

export class Map{
  constructor(xdim, ydim){
    this.xdim = xdim || 1;
    this.ydim = ydim || 1;
    this.tileGrid = TILE_GRID_GENERATOR['basic caves'](this.xdim, this.ydim);
  }

  render(display, camera_x, camera_y){
    let cx = 0;
    let cy = 0;
    for(let xi = 0; xi < this.xdim; xi++){
      cy = 0;
      for(let yi = 0; yi < this.ydim; yi++){
        this.tileGrid[xi][yi].render(display, cx, cy);
        cy++;
      }
      cx++;
    }
  }
}

let TILE_GRID_GENERATOR = {
  'basic caves': function(xdim, ydim){
    let tg = init2DArray(xdim, ydim, TILES.NULLTILE);
    let gen = new ROT.Map.Cellular(xdim, ydim, {connected: true});
    gen.randomize(0.625);
    for(let i = 0; i < 3; i++){
      gen.create();
    }
    gen.connect(
      function(x, y, isFloor){
        let floorCondition = isFloor && x != 0 && y != 0 && x != xdim - 1 && y != ydim - 1;
        let tile = null;
        if(floorCondition){
          tile = TILES.FLOOR;
        }
        else{
          tile = TILES.WALL;
        }
        tg[x][y] = tile;
      },
    1);
    return tg;
  }
}
