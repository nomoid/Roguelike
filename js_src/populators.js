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
      let dog = EntityFactory.create('hound', true);
      map.addEntityAtRandomPosition(dog);
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
      item: 'shortsword',
      type: 'equipment',
      chance: 100
    },
    {
      item: 'longsword',
      type: 'equipment',
      chance: 60
    },
    {
      item: 'handaxe',
      type: 'equipment',
      chance: 100
    },
    {
      item: 'axe',
      type: 'equipment',
      chance: 80
    },
    {
      item: 'battle_axe',
      type: 'equipment',
      chance: 40
    },
    {
      item: 'legendary_sword',
      type: 'equipment',
      chance: 1
    },
    {
      item: 'legendary_dagger',
      type: 'equipment',
      chance: 1
    },
    {
      item: 'legendary_axe',
      type: 'equipment',
      chance: 1
    }
  ],
  'randomArmor': [
    {
      item: 'wooden_shield',
      type: 'equipment',
      chance: 60
    },
    {
      item: 'iron_shield',
      type: 'equipment',
      chance: 30
    },
    {
      item: 'legendary_shield',
      type: 'equipment',
      chance: 1
    },
    {
      item: 'armor_leather',
      type: 'equipment',
      chance: 60
    },
    {
      item: 'armor_steel',
      type: 'equipment',
      chance: 30
    },
    {
      item: 'armor_legendary',
      type: 'equipment',
      chance: 1
    },
    {
      item: 'helmet_leather',
      type: 'equipment',
      chance: 60
    },
    {
      item: 'helmet_steel',
      type: 'equipment',
      chance: 30
    },
    {
      item: 'helmet_legendary',
      type: 'equipment',
      chance: 1
    },
    {
      item: 'boots_leather',
      type: 'equipment',
      chance: 60
    },
    {
      item: 'boots_steel',
      type: 'equipment',
      chance: 30
    },
    {
      item: 'boots_legendary',
      type: 'equipment',
      chance: 1
    },
    {
      item: 'gauntlets_leather',
      type: 'equipment',
      chance: 60
    },
    {
      item: 'gauntlets_steel',
      type: 'equipment',
      chance: 30
    },
    {
      item: 'gauntlets_legendary',
      type: 'equipment',
      chance: 1
    },
    {
      item: 'pants_leather',
      type: 'equipment',
      chance: 60
    },
    {
      item: 'pants_steel',
      type: 'equipment',
      chance: 30
    },
    {
      item: 'pants_legendary',
      type: 'equipment',
      chance: 1
    },
    {
      item: 'cursed_boots',
      type: 'equipment',
      chance: 10
    }
  ],
  'randomFood': [
    {
      item: 'Apple',
      type: 'item',
      chance: 3
    },
    {
      item: 'Bread',
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
