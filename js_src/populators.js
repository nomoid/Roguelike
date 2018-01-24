import {TILES} from './tile.js';
import {init2DArray, uniqueId} from './util.js';
import ROT from 'rot-js';
import {DATASTORE} from './datastore.js';
import {EntityFactory} from './entities.js';

export let TILE_GRID_POPULATOR = {
  'basic_caves' : function(map){
    let origRngState = ROT.RNG.getState();
    ROT.RNG.setSeed(map.attr.mapSeed + 1);

    let chris = EntityFactory.create('chris', true);
    map.addEntityAtRandomPosition(chris);
    for(let i = 0; i < map.attr.xdim * map.attr.ydim / 4; i++){
      let p = ROT.RNG.getUniform();
      console.log(p);
      if(p < 0.25){
        break;
      }
      let jdog = EntityFactory.create('jdog', true);
      map.addEntityAtRandomPosition(jdog);
    }

    ROT.RNG.setState(origRngState);
  },

  'basic_floor' : function(map){
    let origRngState = ROT.RNG.getState();
    ROT.RNG.setSeed(map.attr.mapSeed + 1);


    //populate through seeds!
    for(let xi = 0; xi < map.attr.xdim; xi++){
      for(let yi = 0; yi < map.attr.ydim; yi++){
        let tile = map.tileGrid[xi][yi];
        if(tile.isA('mob_seed')){
          let mobName = tile.seedData.mobName;
          if(!map.attr.mobAmounts[mobName]){
            //map.attr.mobAmounts[mobName] = 0;
          }
          let mob = EntityFactory.create(mobName, true);
          map.addEntityAt(mob, xi, yi);
          map.tileGrid[xi][yi] = TILES.FLOOR;
        }
      }
    }

    for(let i = 0; i < map.attr.xdim * map.attr.ydim / 4; i++){
      let p = ROT.RNG.getUniform();
      console.log(p);
      if(p < 0.25){
        break;
      }
      let jdog = EntityFactory.create('jdog', true);
      map.addEntityAtRandomPosition(jdog);
    }



    ROT.RNG.setState(origRngState);
  }
}
