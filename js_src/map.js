import {TILES} from './tile.js';
import {init2DArray, uniqueId} from './util.js';
import ROT from 'rot-js';
import {DATASTORE} from './datastore.js';

export class Map{
  constructor(xdim, ydim, mapType){

    this.attr = {};
    this.attr.xdim = xdim || 1;
    this.attr.ydim = ydim || 1;
    this.attr.mapType = mapType || 'basic_caves';
    this.attr.setupRngState = ROT.RNG.getState();
    this.attr.id = uniqueId('map-'+this.attr.mapType);
    this.attr.entityIdToMapPos = {};
    this.attr.mapPosToEntityId = {};

  }

  setupMap(){
    if(!this.tileGrid){
      this.tileGrid =
      TILE_GRID_GENERATOR[this.attr.mapType](this.attr.xdim, this.attr.ydim, this.attr.setupRngState);
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

  getSetupRngState(){
    return this.attr.setupRngState;
  }
  setSetupRngState(newstate){
    this.attr.setupRngState = newstate;
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
  }
  addEntityAtRandomPosition(ent){
    let openPos = this.getRandomOpenPosition();
    let p = openPos.split(',');
    this.addEntityAt(ent,p[0],p[1]);
  }
  getRandomOpenPosition(){
    let x = Math.trunc(ROT.RNG.getUniform()*this.attr.xdim);
    let y = Math.trunc(ROT.RNG.getUniform()*this.attr.ydim);
    //check for openness
    if(isPositionOpen(x, y)){
      return this.getRandomOpenPosition();
    }
    return `${x},${y}`;
  }

  isPositionOpen(mapx, mapy){
    //this is going to be more complicated in the future
    return this.tileGrid[mapx][mapy].isA('floor');
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
        let pos = `${xi},${yi}`;
        if(this.attr.mapPosToEntityId[pos]){
          DATASTORE.ENTITIES[this.attr.mapPosToEntityId[pos]].render(display,cx,cx);
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
  'basic_caves': function(xdim, ydim, rngState){
    let tg = init2DArray(xdim, ydim, TILES.NULLTILE);
    let gen = new ROT.Map.Cellular(xdim, ydim, {connected: true});

    let origRngState = ROT.RNG.getState();
    ROT.RNG.setState(rngState);

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

    ROT.RNG.setState(origRngState);

    return tg;
  }
}

export function MapMaker(mapData){

  let m = new Map(mapData.xdim, mapData.ydim,mapData.mapType);
  if(mapData.id){
    m.setId(mapData.id);
  }
  if(mapData.setupRngState){
    m.setSetupRngState(mapData.setupRngState);
  }
  DATASTORE.MAPS[m.getId()] = m;
  return m;
}
