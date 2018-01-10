import {TILES} from './tile.js';
import {init2DArray, uniqueId} from './util.js';
import ROT from 'rot-js';
import {DATASTORE} from './datastore.js';

export class Map{
  constructor(xdim, ydim){
    this.xdim = xdim || 1;
    this.ydim = ydim || 1;
    this.tileGrid = TILE_GRID_GENERATOR['basic caves'](this.xdim, this.ydim);
    this.id = uniqueId();

    console.dir(this);
  }

  getId(){
    return this.id;
  }
  setId(newId){
    this.id = newId;
  }

  render(display, camera_x, camera_y){
    let cx = 0;
    let cy = 0;
    let xstart = camera_x - Math.trunc(display.getOptions().width / 2);
    let xend = xstart + display.getOptions().width;
    let ystart = camera_y - Math.trunc(display.getOptions().height / 2);
    let yend = ystart + display.getOptions().height;
    for(let xi = xstart; xi < xend; xi++){
      cy = 0;
      for(let yi = ystart; yi < yend; yi++){
        this.getTile(xi, yi).render(display, cx, cy);
        cy++;
      }
      cx++;
    }
  }

  getTile(mapx, mapy){
    if(mapx < 0 || mapx > this.xdim - 1 || mapy < 0 || mapy > this.ydim - 1){
      return TILES.NULLTILE;
    }
    else{
      return this.tileGrid[mapx][mapy];
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

export function MapMaker(mapWidth, mapHeight){
  let m = new Map(mapWidth, mapHeight);
  DATASTORE.MAPS[m.getId()] = m;
  return m;
}
