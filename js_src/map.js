import {TILES, TILESTORE} from './tile.js';
import {init2DArray, uniqueId} from './util.js';
import ROT from 'rot-js';
import {DATASTORE} from './datastore.js';
import {EntityFactory} from './entities.js';
import {TILE_GRID_GENERATOR} from './generators.js';
import {TILE_GRID_POPULATOR} from './populators.js';

export class Map{
  constructor(attr){

    this.attr = {};
    this.attr.xdim = attr.xdim || 1;
    this.attr.ydim = attr.ydim || 1;
    this.attr.mapType = attr.mapType || 'basic_caves';
    this.attr.mapSeed = attr.mapSeed || 0;
    this.attr.entrancePos = attr.entrancePos;
    this.attr.floor = attr.floor;
    this.attr.exitPos = '';
    this.attr.id = attr.id || uniqueId('map-'+this.attr.mapType);
    this.attr.entityIdToMapPos = attr.entityIdToMapPos || {};
    this.attr.mapPosToEntityId = attr.mapPosToEntityId || {};
    this.attr.itemEntityIdToMapPos = attr.itemEntityIdToMapPos || {};
    this.attr.mapPosToItemEntityId = attr.mapPosToItemEntityId || {};
    this.attr.mobAmounts = attr.mobAmounts || {};
    this.attr.hasPopulated = attr.hasPopulated || false;
    //For debug purposes
    this.attr.mapPosToPaint = {};
  }

  setupMap(){
    if(!this.tileGrid){
      let generated = TILE_GRID_GENERATOR[this.attr.mapType](this.attr);
      this.tileGrid = generated.map;

      if(generated.exitPos){
        this.attr.exitPos = generated.exitPos;
      }
      if(generated.entrancePos){
        this.attr.entrancePos = generated.entrancePos;
      }
    }
    if(!this.attr.hasPopulated){
      this.attr.hasPopulated = true;
      TILE_GRID_POPULATOR[this.attr.mapType](this);
    }
    else{
      this.clearMobSeeds();
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

  getEntrancePos(){
    return this.attr.entrancePos;
  }
  getExitPos(){
    return this.attr.exitPos;
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
    if(typeof this.attr.mobAmounts[ent.getName()]!=='undefined'){
      console.log(this.attr.mobAmounts[ent.getName()]);
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

  clearMobSeeds(){
    for(let xi = 0; xi < this.attr.xdim; xi++){
      for(let yi = 0; yi < this.attr.ydim; yi++){
        let tile = this.tileGrid[xi][yi];
        if(tile.isA('mob_seed')){
          this.tileGrid[xi][yi] = TILES.FLOOR;
        }
      }
    }
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

  isPositionOpenOrAvatar(mapx, mapy){
    let check = this.attr.mapPosToEntityId[`${mapx},${mapy}`];
    if(check){
      if(DATASTORE.ENTITIES[check].getName()==='avatar'){
        return true;
      }
    }
    return this.isPositionOpen(mapx, mapy);
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

  paintTile(mapx, mapy, color){
    this.attr.mapPosToPaint[`${mapx},${mapy}`] = color;
  }

  clearPaint(){
    this.attr.mapPosToPaint = {};
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
    let renderEverything = false;
    let visibilityCheckerList = [];
    if(renderEverything){
      for(let id in this.attr.entityIdToMapPos){
        let ent = DATASTORE.ENTITIES[id];
        if(typeof ent.generateVisibilityChecker === 'function' && ent.getName()!=='avatar'){
          visibilityCheckerList.push(ent.generateVisibilityChecker());
        }
      }
    }
    for(let xi = xstart; xi < xend; xi++){
      cy = 0;
      for(let yi = ystart; yi < yend; yi++){
        let paint = this.attr.mapPosToPaint[`${xi},${yi}`];
        let isVisible = visibility_checker.check(xi, yi);
        if(renderEverything && !isVisible){
          for(let c = 0; c < visibilityCheckerList.length; c++){
            //console.dir(visibilityCheckerList[c]);
            if(visibilityCheckerList[c].check(xi, yi)){
              isVisible = true;
              break;
            }
          }
        }
        if(!isVisible){
          let memTile = TILESTORE.getTile(visibility_checker.memoryTile(xi, yi));
          if(memTile){
            memTile.renderGray(display, cx, cy, paint);
          }
          cy++;
          continue;
        }
        let pos = `${xi},${yi}`;
        if(this.attr.mapPosToEntityId[pos]){
          DATASTORE.ENTITIES[this.attr.mapPosToEntityId[pos]].render(display,cx,cy,paint);
        }
        else if(this.attr.mapPosToItemEntityId[pos]){
          DATASTORE.ENTITIES[this.attr.mapPosToItemEntityId[pos]].render(display,cx,cy,paint);
        }
        else{
          this.getTile(xi, yi).render(display, cx, cy, paint);
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

export function MapMaker(mapData){

  let m = new Map(mapData);
  DATASTORE.MAPS[m.getId()] = m;
  return m;
}
