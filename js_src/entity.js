// a base class that defines all entities in the game
import {DisplaySymbol} from './display_symbol.js';
import {uniqueId} from './util.js';
import {DATASTORE} from './datastore.js';


export class Entity extends DisplaySymbol{

  constructor(entityData){
    super(entityData);
    this.attr = {};
    this.attr.name = entityData.name;
    this.attr.x = 0;
    this.attr.y = 0;
    this.attr.mapId = 0;
    this.attr.id = uniqueId(`entity${this.attr.name ? '-'+this.attr.name : ''}`);
  }

  getName(){
    return this.attr.name;
  }
  setName(newName){
    this.attr.name = newName;
  }
  getX(){
    return this.attr.x;
  }
  setX(newX){
    this.attr.x = newX;
  }
  getY(){
    return this.attr.y;
  }
  setY(newY){
    this.attr.y = newY;
  }
  getId(){
    return this.attr.id;
  }
  setId(newId){
    this.attr.id = newId;
  }
  getMapId(){
    return this.attr.mapId;
  }
  setMapId(newId){
    this.attr.mapId = newId;
  }
  getMap(){
    return DATASTORE.MAPS[this.attr.mapId];
  }

  moveBy(dx, dy){
    let newX = this.state.x*1 + dx*1;
    let newY = this.state.y*1 + dy*1;

    if(this.getMap().isPositionOpen(newX, newY)){
      this.attr.x = newX;
      this.attr.y = newY;
      this.getMap().updateEntityPosition(this, this.attr.x, this.attr.y);
      return true;
    }
    return false;

  }

  toJSON(){
    return JSON.stringify(this.attr);
  }
  restoreFromState(data){
    this.attr = data;
  }


}
