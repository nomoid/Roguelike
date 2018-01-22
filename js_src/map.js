import {TILES, TILESTORE} from './tile.js';
import {init2DArray, uniqueId} from './util.js';
import ROT from 'rot-js';
import {DATASTORE} from './datastore.js';
import {EntityFactory} from './entities.js';

export class Map{
  constructor(attr){

    this.attr = {};
    this.attr.xdim = attr.xdim || 1;
    this.attr.ydim = attr.ydim || 1;
    this.attr.mapType = attr.mapType || 'basic_caves';
    this.attr.mapSeed = attr.mapSeed || 0;
    this.attr.id = attr.id || uniqueId('map-'+this.attr.mapType);
    this.attr.entityIdToMapPos = attr.entityIdToMapPos || {};
    this.attr.mapPosToEntityId = attr.mapPosToEntityId || {};
    this.attr.itemEntityIdToMapPos = attr.itemEntityIdToMapPos || {};
    this.attr.mapPosToItemEntityId = attr.mapPosToItemEntityId || {};
    this.attr.mobAmounts = attr.mobAmounts || {};
    this.attr.hasPopulated = attr.hasPopulated || false;
  }

  setupMap(){
    if(!this.tileGrid){
      this.tileGrid =
      TILE_GRID_GENERATOR[this.attr.mapType](this.attr.xdim, this.attr.ydim, this.attr.mapSeed);
    }
    if(!this.attr.hasPopulated){
      this.attr.hasPopulated = true;
      TILE_GRID_POPULATOR[this.attr.mapType](this);
    }
  }

  getId(){
    return this.attr.id;
  }
  setId(newId){
    this.attr.id = newId;
  }

  getXDim(){
    return this.attr.xdim;
  }
  setXDim(newxdim){
    this.attr.xdim = newxdim;
  }

  getYDim(){
    return this.attr.ydim;
  }
  setYDim(newydim){
    this.attr.ydim = newydim;
  }

  getMapType(){
    return this.attr.mapType;
  }
  setMapType(newtype){
    this.attr.mapType = newtype;
  }

  getMapSeed(){
    return this.attr.mapSeed;
  }
  setMapSeed(mapSeed){
    this.attr.mapSeed = mapSeed;
  }

  getMobAmounts(name){
    if(name){
      return this.attr.mobAmounts[name];
    }
  }

  removeItemEntity(ent){
    let oldPos = this.attr.itemEntityIdToMapPos[ent.getId()];
    delete this.attr.mapPosToItemEntityId[oldPos];
    delete this.attr.itemEntityIdToMapPos[ent.getId()];
    console.log("removing..."+ent.getName());
  }

  updateItemEntityPosition(ent, newMapX, newMapY){
    let oldPos = this.attr.itemEntityIdToMapPos[ent.getId()];
    delete this.attr.mapPosToItemEntityId[oldPos];
    this.attr.mapPosToItemEntityId[`${newMapX},${newMapY}`] = ent.getId();
    this.attr.itemEntityIdToMapPos[ent.getId()] = `${newMapX},${newMapY}`;
  }

  addItemEntityAt(ent, mapx, mapy){
    let pos = `${mapx},${mapy}`;
    this.attr.mapPosToItemEntityId[pos] = ent.getId();
    this.attr.itemEntityIdToMapPos[ent.getId()] = pos;
    ent.setMapId(this.getId());
    ent.setX(mapx);
    ent.setY(mapy);
  }

  addItemAt(itemObj, mapx, mapy){
    let pos = `${mapx},${mapy}`;
    let itemEntityId = this.attr.mapPosToItemEntityId[pos];
    if(itemEntityId){
      let itemEntity = DATASTORE.ENTITIES[itemEntityId];
      if(typeof itemEntity.addItem === 'function'){
        itemEntity.addItem(itemObj);
        return true;
      }
    }
    else{
      let itemPile = EntityFactory.create('item_pile', true);
      itemPile.addItem(itemObj);
      this.addItemEntityAt(itemPile, mapx, mapy);
      return true;
    }
    return false;
  }

  //Takes in an index
  removeItemAt(itemIndex, mapx, mapy){
    let pos = `${mapx},${mapy}`;
    let itemEntityId = this.attr.mapPosToItemEntityId[pos];
    if(itemEntityId){
      let itemEntity = DATASTORE.ENTITIES[itemEntityId];
      if(typeof itemEntity.removeItem === 'function'){
        let item = itemEntity.removeItem(itemIndex);
        let itemsRemaining = this.getItemsAt(mapx, mapy);
        if(itemsRemaining){
          if(itemsRemaining.length == 0){
            let pos = `${mapx},${mapy}`;
            this.removeItemEntity(itemEntity);
          }
        }
        return item;
      }
    }
    return null;
  }

  clearItemsAt(mapx, mapy){
    let pos = `${mapx},${mapy}`;
    let itemEntityId = this.attr.mapPosToItemEntityId[pos];
    if(itemEntityId){
      let itemEntity = DATASTORE.ENTITIES[itemEntityId];
      if(typeof itemEntity.clearItems === 'function'){
        itemEntity.clearItems();
        return true;
      }
    }
    return false;
  }

  getItemsAt(mapx, mapy){
    let pos = `${mapx},${mapy}`;
    let itemEntityId = this.attr.mapPosToItemEntityId[pos];
    if(itemEntityId){
      let itemEntity = DATASTORE.ENTITIES[itemEntityId];
      if(typeof itemEntity.getItems === 'function'){
        return itemEntity.getItems();
      }
    }
    return null;
  }


  removeEntity(ent){
    let oldPos = this.attr.entityIdToMapPos[ent.getId()];
    delete this.attr.mapPosToEntityId[oldPos];
    delete this.attr.entityIdToMapPos[ent.getId()];
    console.log("removing..."+ent.getName());
    if(this.attr.mobAmounts[ent.getName()]){
      this.attr.mobAmounts[ent.getName()]--;
      console.log("shoulda been remove");
    }
  }

  updateEntityPosition(ent, newMapX, newMapY){
    let oldPos = this.attr.entityIdToMapPos[ent.getId()];
    delete this.attr.mapPosToEntityId[oldPos];
    this.attr.mapPosToEntityId[`${newMapX},${newMapY}`] = ent.getId();
    this.attr.entityIdToMapPos[ent.getId()] = `${newMapX},${newMapY}`;
  }

  addEntityAt(ent, mapx, mapy){
    let pos = `${mapx},${mapy}`;
    this.attr.mapPosToEntityId[pos] = ent.getId();
    this.attr.entityIdToMapPos[ent.getId()] = pos;
    ent.setMapId(this.getId());
    ent.setX(mapx);
    ent.setY(mapy);
    if(this.attr.mobAmounts[ent.getName()]>=0){
      this.attr.mobAmounts[ent.getName()]++;
    }
  }
  addEntityAtRandomPosition(ent){
    let openPos = this.getRandomOpenPosition();
    let p = openPos.split(',');
    this.addEntityAt(ent,p[0]*1,p[1]*1);
  }
  getRandomOpenPosition(){
    let x = Math.trunc(ROT.RNG.getUniform()*this.attr.xdim);
    let y = Math.trunc(ROT.RNG.getUniform()*this.attr.ydim);
    //check for openness
    if(!this.isPositionOpen(x, y)){
      return this.getRandomOpenPosition();
    }
    return `${x},${y}`;
  }

  isPositionOpen(mapx, mapy){
    //this is going to be more complicated in the future
    if(!this.getTile(mapx, mapy).isPassable()){
      return false;
    }
    let pos = `${mapx},${mapy}`;
    if(this.attr.mapPosToEntityId[pos]){
      return false;
    }
    return true;
  }
  getTargetPositionInfo(mapx, mapy){
    let entityId = this.attr.mapPosToEntityId[`${mapx},${mapy}`];
    let itemEntityId = this.attr.mapPosToItemEntityId[`${mapx},${mapy}`];
    let info = {
      tile: this.getTile(mapx, mapy),
    };
    if(entityId){
      info.entity = DATASTORE.ENTITIES[entityId];
    }
    if(itemEntityId){
      info.item = DATASTORE.ENTITIES[itemEntityId];
    }
    return info;
  }

  doesLightPass(mapx, mapy){
    if(!this.getTile(mapx, mapy).isTransparent()){
      return false;
    }
    return true;
  }

  render(display, camera_x, camera_y, visibility_checker){
    //console.log('rendering map');
    //console.dir(this);
    let cx = 0;
    let cy = 0;
    let xstart = camera_x - Math.trunc(display.getOptions().width / 2);
    let xend = xstart + display.getOptions().width;
    let ystart = camera_y - Math.trunc(display.getOptions().height / 2);
    let yend = ystart + display.getOptions().height;
    for(let xi = xstart; xi < xend; xi++){
      cy = 0;
      for(let yi = ystart; yi < yend; yi++){
        if(!visibility_checker.check(xi,yi)){
          let memTile = TILESTORE.getTile(visibility_checker.memoryTile(xi, yi));
          if(memTile){
            memTile.renderGray(display, cx, cy);
          }
          cy++;
          continue;
        }
        let pos = `${xi},${yi}`;
        if(this.attr.mapPosToEntityId[pos]){
          DATASTORE.ENTITIES[this.attr.mapPosToEntityId[pos]].render(display,cx,cy);
        }
        else if(this.attr.mapPosToItemEntityId[pos]){
          DATASTORE.ENTITIES[this.attr.mapPosToItemEntityId[pos]].render(display,cx,cy);
        }
        else{
          this.getTile(xi, yi).render(display, cx, cy);
        }

        cy++;
      }
      cx++;
    }
  }

  toJSON(){
    return JSON.stringify(this.attr);
  }

  getTile(mapx, mapy){
    if(mapx < 0 || mapx > this.attr.xdim - 1 || mapy < 0 || mapy > this.attr.ydim - 1){
      return TILES.NULLTILE;
    }
    else{
      return this.tileGrid[mapx][mapy];
    }
  }


}

let TILE_GRID_GENERATOR = {
  'basic_caves': function(xdim, ydim, mapSeed){

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

    return tg;
  }
}

let TILE_GRID_POPULATOR = {
  'basic_caves' : function(map){
    map.attr.mobAmounts['chris'] = 0;
    map.attr.mobAmounts['jdog'] = 0;
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
  }
}

export function MapMaker(mapData){

  let m = new Map(mapData);
  DATASTORE.MAPS[m.getId()] = m;
  return m;
}
