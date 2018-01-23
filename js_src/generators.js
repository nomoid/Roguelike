import {TILES} from './tile.js';
import {init2DArray, uniqueId, mapExitFromSeed} from './util.js';
import ROT from 'rot-js';
import {DATASTORE} from './datastore.js';
import {EntityFactory} from './entities.js';
import * as STRUCT from './structures.js';

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
    let floor = data.floor;
    console.log(data.floor);
    let entrancePos, entranceX, entranceY;
    if(data.entrancePos){
      entrancePos = data.entrancePos.split(',');
      entranceX = entrancePos[0]*1;
      entranceY = entrancePos[1]*1;
    }

    let exitPos = mapExitFromSeed(data).split(',');
    let exitX = exitPos[0]*1;
    let exitY = exitPos[1]*1;

    // let structs = [];//constains positions in string form
    // let structFreq = 0.2;

    let borderDepth = 3;
    let wideBorderDepth = 3;
    let quadrantWidth = Math.floor(xdim/2)-wideBorderDepth;
    let quadrantHeight = Math.floor(ydim/2)-wideBorderDepth;

    let origRngState = ROT.RNG.getState();//*** IMPORTANT
    ROT.RNG.setSeed(mapSeed);

    let tg = init2DArray(xdim, ydim, TILES.NULLTILE);


    for(let xi = 0; xi < xdim; xi++){//first loop
      for(let yi = 0; yi < ydim; yi++){
        let tile = null;
        if(data.entrancePos && xi == entranceX && yi == entranceY){
          //place the entrance
          tile = TILES.STAIRS_UP;

        }
        else if(xi==0 || xi==xdim-1 || yi==0 || yi==ydim-1){//outer wall
          tile = TILES.OUTER_WALL;
        }
        //outer wall noise
        else if(xi < borderDepth || xi > xdim - (borderDepth+1) || yi < borderDepth || yi > ydim - (borderDepth+1)){
          let d = Math.min(Math.abs(borderDepth - xi),Math.abs(xi-(xdim-1-borderDepth)),Math.abs(borderDepth - yi),Math.abs(yi-(ydim-1-borderDepth)));
          if(ROT.RNG.getUniform()*(borderDepth*3/4)<d){
            tile = TILES.OUTER_WALL;
          }
          else{
            tile = TILES.FLOOR;
          }
        }
        // //structure seeds
        // else if(ROT.RNG.getUniform() < structFreq){
        //   structs.push(`${xi},${yi}`);
        //   tile = TILES.FLOOR;
        // }

        //default is floor
        else{
          tile = TILES.FLOOR;
        }

        tg[xi][yi] = tile;
      }
    }

    tg[exitX][exitY] = TILES.STAIRS_DOWN;

    //place some structures in each quadrant
    //quadrants: (i think)
    //  0   1
    //  2   3
    for(let q = 0; q < 4; q++){
      let TLX, TLY;
      switch (q) {
        case 0:
          TLX = wideBorderDepth;
          TLY = wideBorderDepth;
          break;
        case 1:
          TLX = wideBorderDepth + quadrantWidth;
          TLY = wideBorderDepth;
          break;
        case 2:
          TLX = wideBorderDepth;
          TLY = wideBorderDepth + quadrantHeight;
          break;
        case 3:
          TLX = wideBorderDepth + quadrantWidth;
          TLY = wideBorderDepth + quadrantHeight;
          break;
        default:
          TLX = wideBorderDepth;
          TLY = wideBorderDepth;
      }
      for(let i = 0; i < 5; i++){
        let randomX = Math.floor(ROT.RNG.getUniform()*(quadrantWidth)+TLX);
        let randomY = Math.floor(ROT.RNG.getUniform()*(quadrantHeight)+TLY);
        let rotation = Math.floor(ROT.RNG.getUniform()*4)-1;
        STRUCT.mergeGrids(tg, STRUCT.parseCharsToTiles(STRUCT.getRandomStructure(STRUCT.BASIC_FLOOR)), randomX, randomY, rotation);
      }
    }

    //place stairs structures last (TODO: check availablility for structures.)
    //Once TODO is done, stairs generate first.
    let stairs = STRUCT.parseCharsToTiles(STRUCT.BASIC_FLOOR.STAIRS.grid);
    let rotation = Math.floor(ROT.RNG.getUniform()*4)-1;
    STRUCT.mergeGrids(tg, stairs, exitX, exitY, rotation);
    if(data.entrancePos){
      let rotation = Math.floor(ROT.RNG.getUniform()*4)-1;
      STRUCT.mergeGrids(tg, stairs, entranceX, entranceY, rotation);
    }




    ROT.RNG.setState(origRngState);//*** ALSO IMPORTANT

    return {map: tg, exitPos: `${exitX},${exitY}`};
    //return {map: tg};
  }
}
