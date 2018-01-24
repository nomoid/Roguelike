//defines mixins that can be added to an entity

import ROT from 'rot-js';
import {Message} from './message.js';
import {Map} from './map.js';
import {TIME_ENGINE, SCHEDULER, setTimedUnlocker} from './timing.js';
import {DATASTORE} from './datastore.js';
import * as U from './util.js';

let _exampleMixin = {
  META: {
    mixinName: 'ExampleMixin',
    mixinGroupName: 'ExampleMixinGroup',
    stateNamespace: '_ExampleMixin',
    stateModel: {
      foo: 10
    },
    initialize: function(){
      // do any initialization
    }
  },
  METHODS: {
    method1: function(p){
      // can access other objects in this namespace
      this.attr._ExampleMixin.foo = p;
    }
  },
  LISTENERS: {
    evtLabel: function(evtData){

    }
  }
};

export let TimeTracker = {
  META: {
    mixinName: 'TimeTracker',
    mixinGroupName: 'TrackerGroup',
    stateNamespace: '_TimeTracker',
    stateModel: {
      timeTaken: 0
    },
    initialize: function(){
      // do any initialization
    }
  },
  METHODS: {
    getTime: function(){
      return this.attr._TimeTracker.timeTaken;
    },
    setTime: function(t){
      this.attr._TimeTracker.timeTaken = t;
    },
    addTime: function(t){
      this.attr._TimeTracker.timeTaken += t;
    }
  },
  LISTENERS: {
    // timeUsed(int): the amount of time to be added to the time tracker
    turnTaken: function(evtData){
      this.addTime(evtData.timeUsed);
    }
  }
};

export let WalkerCorporeal = {
  META: {
    mixinName: 'WalkerCorporeal',
    mixinGroupName: 'WalkerGroup',
    initialize: function(){
      // do any initialization
    }
  },
  METHODS: {
    tryWalk: function(dx, dy){
      if (typeof this.isActing === 'function' && !this.isActing()){
        return false;
      }
      let newX = this.attr.x + dx;
      let newY = this.attr.y + dy;

      //get info for location (tile/entity)
      let targetPositionInfo = this.getMap().getTargetPositionInfo(newX, newY);
      //if entity, bump it
      if(targetPositionInfo.entity){
        if(targetPositionInfo.entity != this){
          this.raiseMixinEvent('bumpEntity', {
            actor:this,
            target:targetPositionInfo.entity
          });
        }
        this.raiseMixinEvent('actionDone');
        return true;
      }
      //if tile, check for impassable
      else if(!targetPositionInfo.tile.isPassable()){
        this.raiseMixinEvent('walkBlocked',{reason: 'Path is blocked'});
        return false;
      }
      else{
        if(targetPositionInfo.item){
          this.raiseMixinEvent('walkedOnItem', {
            actor:this,
            item:targetPositionInfo.item
          });
        }
        this.attr.x = newX;
        this.attr.y = newY;
        this.getMap().updateEntityPosition(this, this.attr.x, this.attr.y);

        this.raiseMixinEvent('turnTaken', {timeUsed: 1});
        this.raiseMixinEvent('actionDone');
        return true;
      }
    }
  },
  LISTENERS: {
    walkAttempt: function(evtData){
      this.tryWalk(evtData.dx, evtData.dy);
    }
  }
};

export let PlayerMessage = {
  META: {
    mixinName: 'PlayerMessage',
    mixinGroupName: 'MessagerGroup',
    initialize: function(){
      // do any initialization
    }
  },
  LISTENERS: {
    // reason(str): the reason why the path is blocked
    walkBlocked: function(evtData){
      Message.send("Can't walk there! "+evtData.reason);
    },
    // hpLost(int): the amount of health lost
    // hpLeft(int): the amount of hp remaining for the caller
    lostHealth: function(evtData){
      Message.send(`Lost ${evtData.hpLost} hp! Only ${evtData.hpLeft} left...`);
    },
    attacks: function(evtData){
      Message.send(`You attack the ${evtData.target.getName()}!`);
    },
    damages: function(evtData){
      Message.send(`You deal ${evtData.damageAmount} damage to the ${evtData.target.getName()}!`);
    },
    kills: function(evtData){
      Message.send(`You kill the ${evtData.target.getName()}!`)
    },
    killed: function(evtData){
      Message.send(`You were killed by ${evtData.src.getName()}...`);
    },
    walkedOnItem: function(evtData){
      let items = evtData.item.getItems();
      if(items.length == 0){
        return;
      }
      else if(items.length == 1){
        let item = items[0];
        if(item.name){
          Message.send(`You walked on ${item.name}`);
        }
        else{
          Message.send(`You walked on an unidentified item`);
        }
      }
      else{
        Message.send(`You walked on a pile of ${items.length} items`);
      }
    },
    pickedUpItem: function(evtData){
      let items = evtData.items;
      if(items.length == 0){
        this.raiseMixinEvent('itemPickUpFailed', {
          reason: 'You picked up nothing!'
        });
      }
      else if(items.length == 1){
        let item = items[0];
        if(item.name){
          Message.send(`You picked up ${item.name}`);
        }
        else{
          Message.send(`You picked up an unidentified item`);
        }
      }
      else{
        Message.send(`You picked up pile of ${items.length} items`);
      }
    },
    itemPickUpFailed: function(evtData){
      Message.send(`Can't pick up item. ${evtData.reason}`);
    }
  }
};

export let HitPoints = {
  META: {
    mixinName: 'HitPoints',
    mixinGroupName: 'CombatGroup',
    stateNamespace: '_HitPoints',
    stateModel: {
      hp: 1,
      maxHp: 1
    },
    initialize: function(template){
      this.attr._HitPoints.maxHp = template.maxHp;
      this.attr._HitPoints.hp = template.hp || template.maxHp;
    }
  },
  METHODS: {
    loseHp: function(amt){
      let curHp = this.attr._HitPoints.hp;
      this.attr._HitPoints.hp -= amt;
      this.attr._HitPoints.hp = Math.max(0, this.attr._HitPoints.hp);
      this.raiseMixinEvent('lostHealth', {hpLost: curHp-this.attr._HitPoints.hp, hpLeft: this.attr._HitPoints.hp});
    },
    gainHp: function(amt){
      this.attr._HitPoints.hp += amt;
      this.attr._HitPoints.hp = Math.min(this.attr._HitPoints.maxHp, this.attr._HitPoints.hp);
    },
    getHp: function(){
      return this.attr._HitPoints.hp;
    },
    setHp: function(amt){
      this.attr._HitPoints.hp = amt;
    },
    getMaxHp: function(){
      return this.attr._HitPoints.maxHp;
    },
    setMaxHp: function(amt){
      this.attr._HitPoints.maxHp = amt;
    }
  },
  LISTENERS: {
    // src(entity): the source of the damage
    // damageAmount(int): the amount of damage taken
    damaged: function(evtData){
      let amt = evtData.damageAmount;
      this.loseHp(amt);
      evtData.src.raiseMixinEvent('damages', {
        target: this,
        damageAmount: amt
      });
      if(this.getHp() == 0){
        this.raiseMixinEvent('killed',{
          src: evtData.src
        });
        evtData.src.raiseMixinEvent('kills', {
          target: this
        });
        this.destroy();
        console.dir(this);
        console.dir(DATASTORE);
      }
    }
  }
};

export let MeleeAttacker = {
  META: {
    mixinName: 'MeleeAttacker',
    mixinGroupName: 'CombatGroup',
    stateNamespace: '_MeleeAttacker',
    stateModel: {
      meleeDamage: 1
    },
    initialize: function(template){
      this.attr._MeleeAttacker.meleeDamage = template.meleeDamage || 1;
    }
  },
  METHODS: {
    getMeleeDamage: function(){
      return this.attr._MeleeAttacker.meleeDamage;
    },
    setMeleeDamage: function(newVal){
      this.attr._MeleeAttacker.meleeDamage = newVal;
    }
  },
  LISTENERS: {
    // target(entity): the target of the melee hit
    bumpEntity: function(evtData){
      this.raiseMixinEvent('attacks', {
        actor: this,
        target: evtData.target
      });
      evtData.target.raiseMixinEvent('damaged', {
        src: this,
        damageAmount: this.getMeleeDamage()
      });
    }
  }
};

export let ActorPlayer = {
  META: {
    mixinName: 'ActorPlayer',
    mixinGroupName: 'ActorGroup',
    stateNamespace: '_ActorPlayer',
    stateModel: {
      baseActionDuration: 1000,
      actingState: false,
      currentActionDuration: 1000
    },
    initialize: function(){
      SCHEDULER.add(this, true, 0);
    }
  },
  METHODS: {
    getBaseActionDuration: function(){
      return this.attr._ActorPlayer.baseActionDuration;
    },
    setBaseActionDuration: function(n){
      this.attr._ActorPlayer.baseActionDuration = n;
    },
    getCurrentActionDuration: function(){
      return this.attr._ActorPlayer.currentActionDuration;
    },
    setCurrentActionDuration: function(n){
      this.attr._ActorPlayer.currentActionDuration = n;
    },

    isActing: function(state){
      if(state !== undefined){
        this.attr._ActorPlayer.actingState = state;
      }
      return this.attr._ActorPlayer.actingState;
    },
    act: function(){
      if(this.isActing()){
        return;
      }
      this.isActing(true);
      TIME_ENGINE.lock();
      DATASTORE.GAME.render();
      //console.log("player is acting");
    }
  },
  LISTENERS: {
    actionDone: function(evtData){
      this.isActing(false);
      SCHEDULER.setDuration(this.getBaseActionDuration());
      setTimeout(function(){
        TIME_ENGINE.unlock();
      }, 1);
      //console.log("end player acting");
    }
  }
};

export let AIActor = {
  META: {
    mixinName: 'AIActor',
    mixinGroupName: 'ActorGroup',
    stateNamespace: '_AIActor',
    stateModel: {
      baseActionDuration: 1000,
      actingState: false,
      currentActionDuration: 1000
    },
    initialize: function(template){
      this.setRenderDelay(template.renderDelay || -1);
      this.setPriorities(template.priorities);
      SCHEDULER.add(this, true, 0);
    }
  },
  METHODS: {
    getBaseActionDuration: function(){
      return this.attr._AIActor.baseActionDuration;
    },
    setBaseActionDuration: function(n){
      this.attr._AIActor.baseActionDuration = n;
    },
    getCurrentActionDuration: function(){
      return this.attr._AIActor.currentActionDuration;
    },
    setCurrentActionDuration: function(n){
      this.attr._AIActor.currentActionDuration = n;
    },
    getRenderDelay: function(){
      return this.attr._AIActor.renderDelay;
    },
    setRenderDelay: function(n){
      this.attr._AIActor.renderDelay = n;
    },
    getPriorities: function(){
      return this.attr._AIActor.priorities;
    },
    setPriorities: function(n){
      this.attr._AIActor.priorities = n;
    },

    isActing: function(state){
      if(state !== undefined){
        this.attr._AIActor.actingState = state;
      }
      return this.attr._AIActor.actingState;
    },
    act: function(){
      if(this.isActing()){
        return false;
      }
      setTimedUnlocker(true);
      this.isActing(true);
      SCHEDULER.setDuration(this.getBaseActionDuration());
      let priorities = this.getPriorities();
      if(!priorities){
        let actorData = {terminate: false};
        this.raiseMixinEvent('actorPerform', actorData);
      }
      else{
        //Sort array of priorities
        let priorityArray = Array();
        for(let name in priorities){
          priorityArray.push([name, priorityArray[name]]);
        }
        priorityArray.sort(function(a, b){
          return a[1] - b[1];
        });
        for(let i = 0; i < priorityArray.length; i++){
          let currName = priorityArray[i][0];
          let actorData = {target: currName, terminate: false};
          this.raiseMixinEvent('actorPerform', actorData);
          if(actorData.terminate){
            break;
          }
        }
      }
      let actor = this;
      this.isActing(false);
      if(actor.getRenderDelay() > 0){
        this.raiseMixinEvent('renderMain');
        return {then: function(unlocker){
            setTimeout(function(){
              setTimedUnlocker(false);
              unlocker();
            }, actor.getRenderDelay());
        }};
      }
      else{
        setTimedUnlocker(false);
      }
    }
  }
}

export let OmniscientEnemyTargeter = {
  META: {
    mixinName: 'OmniscientEnemyTargeter',
    mixinGroupName: 'Targeter',
    stateNamespace: '_OmniscientEnemyTargeter',
    stateModel: {
      targetName: '',
    },
    initialize: function(template){
      this.attr._OmniscientEnemyTargeter.targetName = template.targetName;
    }
  },
  METHODS: {
    getTargetPos: function(){
      console.dir(this);
      let map = this.getMap();
      let targets = [];
      for(let entId in map.attr.entityIdToMapPos){
        let ent = DATASTORE.ENTITIES[entId];
        if(ent.getName()===this.attr._OmniscientEnemyTargeter.targetName){
          targets.push(ent);
        }
      }
      let minD = 100000
      let minDIndex = 0;
      for(let i = 0; i < targets.length; i++){
        let enemy = targets[i];
        let d = U.distance2D(this.getX(), this.getY(), enemy.getX(), enemy.getY());
        if(d < minD){
          minD = d;
          minDIndex = i;
        }
      }
      if(targets.length==0){
        return null;
      }
      let target = targets[minDIndex];
      return `${target.getX()},${target.getY()}`;

    }
  },
  LISTENERS: {

  }
}

//Requires AIActor mixin
export let ActorRandomWalker = {
  META: {
    mixinName: 'ActorRandomWalker',
    mixinGroupName: 'ActorGroup',
    stateNamespace: '_ActorRandomWalker',
    stateModel: {
    },
    initialize: function(){
    }
  },
  METHODS: {

  },
  LISTENERS: {
    actorPerform: function(actorData){
      if(actorData.target && actorData.target !== 'ActorRandomWalker'){
        return;
      }
      //console.log("walker is acting");
      //Rand number from -1 to 1
      let dir = Math.floor(ROT.RNG.getUniform() * 5);
      let dx, dy;
      switch (dir) {
        case 0:
          dx = 0;
          dy = 0;
          break;
        case 1:
          dx = -1;
          dy = 0;
          break;
        case 2:
          dx = 0;
          dy = -1;
          break;
        case 3:
          dx = 1;
          dy = 0;
          break;
        case 4:
          dx = 0;
          dy = 1;
          break;
        default:
          dx = 0;
          dy = 0;
      }
      this.raiseMixinEvent('walkAttempt', {'dx': dx, 'dy': dy});
      //console.log("walker is done acting");
      actorData.terminate = true;
    }
  }
};

//Requires AIActor mixin and ANY targeter mixin
export let NearsightedAttacker = {
  META: {
    mixinName: 'NearsightedAttacker',
    mixinGroupName: 'ActorGroup',
    stateNamespace: '_NearsightedAttacker',
    stateModel: {
      enemy: {}
    },
    initialize: function(){
    }
  },
  METHODS: {

  },
  LISTENERS: {
    actorPerform: function(actorData){
      if(actorData.target && actorData.target !== 'NearsightedAttacker'){
        return;
      }
      let targetPos = this.getTargetPos().split(',');
      if(targetPos===null){
        actorData.terminate = false;
        return;
      }
      let targetX = targetPos[0]*1;
      let targetY = targetPos[1]*1;
      let x = this.getX();
      let y = this.getY();
      let dx, dy;
      //if enemy is in adjacent tile
      if(targetX == x-1 && targetY == y){
        dx = -1;
        dy = 0;
      }
      else if(targetX == x && targetY == y-1){
        dx = 0;
        dy = -1;
      }
      else if(targetX == x+1 && targetY == y){
        dx = 1;
        dy = 0;
      }
      else if(targetX == x && targetY == y+1){
        dx = 0;
        dy = 1;
      }
      else{
        actorData.terminate = false;
        return;
      }
      if(this.tryWalk(dx, dy)){
        actorData.terminate = true;
      }
    }
  }
};

//Requires aiactor and ANY targeter
export let OmniscientPathfinder = {
  META: {
    mixinName: 'OmniscientPathfinder',
    mixinGroupName: 'Pathfinder',
    stateNamespace: '_OmniscientPathfinder',
    stateModel: {
      enemy: {}
    },
    initialize: function(){
    }
  },
  METHODS: {
    getNextMoveDijkstra: function(){
      let targetPos = this.getTargetPos().split(',');
      let targetX = targetPos[0]*1;
      let targetY = targetPos[1]*1;
      let thisx = this.getX();
      let thisy = this.getY();
      let map = this.getMap();
      let passableCallback = function(x, y){
        //console.log(`${x},${y}`);
        return map.getTile(x, y).isPassable();
      }
      let dijkstra = new ROT.Path.AStar(thisx, thisy, passableCallback, {topology: 8});

      let dx = 'a';
      let dy = 'a';
      //console.log('target pos:');
      //console.log(`${targetX},${targetY}`);
      dijkstra.compute(targetX, targetY, function(x, y){
        if(x!=thisx || y!=thisy){
          dx = x-thisx;
          dy = y-thisy;
        }
      });
      return `${dx},${dy}`;

    }
  },
  LISTENERS: {
    actorPerform: function(actorData){
      if(actorData.target && actorData.target !== 'OmniscientPathfinder'){
        return;
      }
      let move = this.getNextMoveDijkstra().split(',');
      //console.log(move);
      if(move[0]==='a' || move[1]==='a'){
        actorData.terminate = false;
        //console.log('No path...');
        return;
      }
      let dx = move[0]*1;
      let dy = move[1]*1;

      if(this.tryWalk(dx, dy)){
        actorData.terminate = true;
        return;
      }

      actorData.terminate = false;
    }
  }
};

export let FOVHandler = {
  META: {
    mixinName: 'FOVHandler',
    mixinGroupName: 'LightingGroup',
    stateNamespace: '_FOVHandler',
    stateModel: {
      radius: 1,
      memory: {} //mapId --> (pos --> chr)
    },
    initialize: function(template){
      this.attr._FOVHandler.radius = template.radius;
    }
  },
  METHODS: {
    generateVisibilityChecker: function(){
      let ent = this;
      let checker = {
        visibleTiles: {},
        check: function(x, y){
          return this.visibleTiles[`${x},${y}`];
        },
        memoryTile: function(x, y){
          return ent.attr._FOVHandler.memory[ent.getMapId()][`${x},${y}`];
        }
      };
      let m = this.getMapId();
      let callback = function(x, y){
        return DATASTORE.MAPS[m].doesLightPass(x, y);
      }
      let fov = new ROT.FOV.RecursiveShadowcasting(callback, {topology: 8});

      fov.compute(this.getX(), this.getY(), this.attr._FOVHandler.radius, function(x, y, r, visibility){
        checker.visibleTiles[`${x},${y}`] = true;
        if(!ent.attr._FOVHandler.memory[ent.getMapId()]){
          ent.attr._FOVHandler.memory[ent.getMapId()] = {};
        }
        ent.attr._FOVHandler.memory[ent.getMapId()][`${x},${y}`] = DATASTORE.MAPS[m].getTile(x, y).chr;
      });

      return checker;
    }
  }
};

export let ItemDropper = {
  META: {
    mixinName: 'ItemDropper',
    mixinGroupName: 'ItemGroup',
    stateNamespace: '_ItemDropper',
    stateModel: {
    },
    initialize: function(){
    }
  },
  METHODS: {

  },
  LISTENERS: {
    //For testing, drop a dummy item
    killed: function(evtData){
      let itemData = {x: this.getX(), y: this.getY()};
      if(evtData.src.getName() == 'avatar'){
        itemData.item = {name: "JDog's Ramen", type: "Food", healAmount: 2};
        this.raiseMixinEvent('addItemToMap', itemData);
      }
      else{
        itemData.item = {name: "JDog's Spicy Ramen", type: "Food", healAmount: 5};
        this.raiseMixinEvent('addItemToMap', itemData);
      }
    }
  }
};

//Requires ItemPile mixin
export let Inventory = {
  META: {
    mixinName: 'Inventory',
    mixinGroupName: 'ItemGroup',
    stateNamespace: '_Inventory',
    stateModel: {
      // Item data stored in ItemPile
    },
    initialize: function(){
      // do any initialization
    }
  },
  METHODS: {
    pickUpItem: function(){
      let map = DATASTORE.MAPS[this.getMapId()];
      let items = map.getItemsAt(this.getX(), this.getY());
      if(items){
        //There is at least one item
        //For now just pick up the first one
        let item = map.removeItemAt(0, this.getX(), this.getY());
        if(this.addItem(item)){
          this.raiseMixinEvent('pickedUpItem', {
            'items': [item]
          });
          this.raiseMixinEvent('actionDone');
          return true;
        }
        else{
          let itemName = 'an unidentified item';
          if(item.name){
            itemName = item.name;
          }
          this.raiseMixinEvent('itemPickUpFailed', {
            reason: `Couldn\'t pick up ${itemName}!`
          });
        }
      }
      else{
        this.raiseMixinEvent('itemPickUpFailed', {
          reason: 'There are no items to pick up!'
        });
        return false;
      }
    },
    pickUpAllItems: function(){
      let map = DATASTORE.MAPS[this.getMapId()];
      let items = map.getItemsAt(this.getX(), this.getY());
      if(items){
        //Loop through and pick up all items one by one
        //Stop if there's an issue
        let failed = null;
        let itemsPickedUp = Array();
        for(let i = 0; i < items.length; i++){
          let item = map.removeItemAt(0, this.getX(), this.getY());
          if(!this.addItem(item)){
            failed = item;
          }
          else{
            itemsPickedUp.push(item);
          }
        }
        if(itemsPickedUp.length > 0){
          this.raiseMixinEvent('pickedUpItem', {
            'items': itemsPickedUp
          });
        }
        if(failed){
          let itemName = 'an unidentified item';
          if(failed.name){
            itemName = failed.name;
          }
          this.raiseMixinEvent('itemPickUpFailed', {
            reason: `Couldn\'t pick up ${itemName}!`
          });
        }
        this.raiseMixinEvent('actionDone');
        return itemsPickedUp.length;
      }
      else{
        this.raiseMixinEvent('itemPickUpFailed', {
          reason: 'There are no items to pick up!'
        });
        return 0;
      }
    }
  },
  LISTENERS: {
  }
};

export let ItemPile = {
  META: {
    mixinName: 'ItemPile',
    mixinGroupName: 'ItemGroup',
    stateNamespace: '_ItemPile',
    stateModel: {
      items: []
    },
    initialize: function(){
      // do any initialization
    }
  },
  METHODS: {
    addItem: function(item){
      this.attr._ItemPile.items.push(item);
      return true;
    },
    removeItem: function(itemIndex){
      let item = this.attr._ItemPile.items[itemIndex];
      if(itemIndex < this.attr._ItemPile.items.length){
        this.attr._ItemPile.items.splice(itemIndex, 1);
      }
      return item;
    },
    getItems: function(){
      return this.attr._ItemPile.items;
    },
    clearItems: function(){
      this.attr._ItemPile.items = [];
    }
  },
  LISTENERS: {

  }
}
