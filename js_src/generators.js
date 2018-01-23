import {TILES} from './tile.js';
import {init2DArray, uniqueId, mapExitFromSeed} from './util.js';
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
    let exitY = exitPos[1]*1;//set exitq

    let structs = [];//constains positions in string form
    let structFreq = 0.2;

    let borderDepth = 3;

    let origRngState = ROT.RNG.getState();//*** IMPORTANT
    ROT.RNG.setSeed(mapSeed);

    let tg = init2DArray(xdim, ydim, TILES.NULLTILE);


    for(let xi = 0; xi < xdim; xi++){//first loop
      for(let yi = 0; yi < ydim; yi++){
        let tile = null;
        if(xi == exitX && yi == exitY){
          tile = TILES.STAIRS_DOWN;
        }
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
        //structure seeds
        else if(ROT.RNG.getUniform() < structFreq){
          structs.push(`${xi},${yi}`);
          tile = TILES.FLOOR;
        }

        //default is floor
        else{
          tile = TILES.FLOOR;
        }

        tg[xi][yi] = tile;
      }
    }

    //place exit apart from entrance
    //let exitX = Math.floor(ROT.RNG.getUniform()*(xdim-(borderDepth*2))+borderDepth);
    //let exitY = Math.floor(ROT.RNG.getUniform()*(ydim-(borderDepth*2))+borderDepth);
    tg[exitX][exitY] = TILES.STAIRS_DOWN;

    //stairs populating:

    //place a stairs room on entrance
    //place a stairs room on exit


    ROT.RNG.setState(origRngState);//*** ALSO IMPORTANT

    return {map: tg, exitPos: `${exitX},${exitY}`};
    //return {map: tg};
  }
}
