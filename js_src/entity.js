// a base class that defines all entities in the game
import {MixableSymbol} from './mixable_symbol.js';
import {uniqueId} from './util.js';
import {DATASTORE} from './datastore.js';
import {SCHEDULER} from './timing.js';
import {deepCopy} from './util.js';

export class Entity extends MixableSymbol{

  constructor(entityData){
    super(entityData);
    if(!this.attr){
      this.attr = {};
    }
    this.attr.name = entityData.name;
    this.attr.x = 0;
    this.attr.y = 0;
    this.attr.mapId = 0;
    this.attr.id = uniqueId(`entity${this.attr.name ? '-'+this.attr.name : ''}`);
    this.attr.stats = deepCopy(entityData.stats || {});
    this.attr.level = entityData.level || 1;
  }

  getStats(){
    return this.attr.stats;
  }
  getStat(name){
    let stat = this.attr.stats[name];
    if(!stat){
      return 0;
    }
    else{
      return stat;
    }
  }
  setStat(name, value){
    this.attr.stats[name] = value;
  }
  //Player level is based on max floor reached
  getLevel(){
    return this.attr.level;
  }
  setLevel(level){
    this.attr.level = level;
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

  destroy(){
    SCHEDULER.remove(this);
    this.getMap().removeEntity(this);
    delete DATASTORE.ENTITIES[this.getId()];
  }

  // moveBy(dx, dy){
  //   //changed to mixin approach
  //
  // }

  toJSON(){
    return JSON.stringify(this.attr);
  }
  restoreFromState(data){
    this.attr = data;
  }


}
