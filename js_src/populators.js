import {TILES} from './tile.js';
import {init2DArray, uniqueId} from './util.js';
import ROT from 'rot-js';
import {DATASTORE} from './datastore.js';
import {EntityFactory} from './entities.js';
import {generateEquipment} from './equipment.js';
import {generateItem} from './items.js';

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
            map.attr.mobAmounts[mobName] = 0;
          }
          let mob = EntityFactory.create(mobName, true);
          if(mobName == 'chest'){
            mob.seedLoot(LootTables[tile.seedData.lootTable]);
          }
          map.addEntityAt(mob, xi, yi);
          map.tileGrid[xi][yi] = TILES.FLOOR;
        }
      }
    }

    for(let i = 0; i < 2; i++){
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

let LootTables = {
  'basic': {
    itemCount: 8,
    lootSet: {
      sword: {
        item: 'randomWeapon',
        chance: 1
      },
      food: {
        item: 'randomFood',
        chance: 3
      }
    }
  }
}

let ItemTables = {
  'randomWeapon': [
    {
      item: 'shortsword_1',
      type: 'equipment',
      chance: 1
    },
    {
      item: 'longsword_1',
      type: 'equipment',
      chance: 1
    },
    {
      item: 'battle_axe_1',
      type: 'equipment',
      chance: 1
    },
    {
      item: 'dagger_1',
      type: 'equipment',
      chance: 1
    },
    {
      item: 'legendary_sword_1',
      type: 'equipment',
      chance: 100
    },
  ],
  'randomFood': [
    {
      item: 'JDog\'s Ramen',
      type: 'item',
      chance: 3
    },
    {
      item: 'JDog\'s Spicy Ramen',
      type: 'item',
      chance: 2
    },
    {
      item: 'Swiftness Candy',
      type: 'item',
      chance: 1
    }
  ]
}

export function generateLoot(lootName){
  let lootSet = ItemTables[lootName];
  let possibleLoot = Array();
  for(let loot in lootSet){
    let n = lootSet[loot].chance;
    for(let i = 0; i < n; i++){
      possibleLoot.push(lootSet[loot]);
    }
  }
  let index = Math.floor(ROT.RNG.getUniform()*possibleLoot.length);
  //console.dir(structs);
  //console.log(index);
  let name = possibleLoot[index].item;
  let lootType = possibleLoot[index].type;
  let item;
  if(lootType == 'item'){
    item = generateItem(name);
  }
  if(lootType == 'equipment'){
    item = generateEquipment(name);
  }
  return item;
}
