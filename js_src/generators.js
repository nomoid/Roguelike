import {TILES} from './tile.js';
import {init2DArray, uniqueId} from './util.js';
import ROT from 'rot-js';
import {DATASTORE} from './datastore.js';
import {EntityFactory} from './entities.js';

export let TILE_GRID_GENERATOR = {
  'basic_caves': function(data){
    let xdim = data.xdim;
    let ydim = data.ydim;
    let mapSeed = data.mapSeed;

    let origRngState = ROT.RNG.getState();
    ROT.RNG.setSeed(mapSeed);

    let tg = init2DArray(xdim, ydim, TILES.NULLTILE);
    let gen = new ROT.Map.Cellular(xdim, ydim, {connected: true});


    gen.randomize(0.625);//0.625
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

    ROT.RNG.setState(origRngState);

    return {map :tg};
  },

  'basic_floor': function(data){//requires large map dimensions to work properly

    let xdim = data.xdim;
    let ydim = data.ydim;
    let mapSeed = data.mapSeed;
    let entrancePos = data.entrancePos.split(',');
    let entranceX = entrancePos[0]*1;
    let entranceY = entrancePos[1]*1;

    let borderDepth = 3;

    let origRngState = ROT.RNG.getState();//*** IMPORTANT
    ROT.RNG.setSeed(mapSeed);

    let tg = init2DArray(xdim, ydim, TILES.NULLTILE);


    for(let xi = 0; xi < xdim; xi++){//generate outer walls
      for(let yi = 0; yi < ydim; yi++){
        let tile = null;
        if(xi==0 || xi==xdim-1 || yi==0 || yi==ydim-1){
          tile = TILES.WALL;
        }
        else if(xi < borderDepth || xi > xdim - (borderDepth+1) || yi < borderDepth || yi > ydim - (borderDepth+1)){
          let d = Math.min(Math.abs(borderDepth - xi),Math.abs(xi-(xdim-borderDepth)),Math.abs(borderDepth - yi),Math.abs(yi-(ydim-borderDepth)));
          if(ROT.RNG.getUniform()*(borderDepth*4/5)<d){
            tile = TILES.WALL;
          }
          else{
            tile = TILES.FLOOR;
          }
        }
        else{
          tile = TILES.FLOOR;
        }

        tg[xi][yi] = tile;
      }
    }

    ROT.RNG.setState(origRngState);//*** ALSO IMPORTANT

    //return {map: tg, exitPos: `${exitX},${exitY}`};
    return {map: tg};
  }
}
