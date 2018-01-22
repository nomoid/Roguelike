//defines mixins that can be added to an entity

import ROT from 'rot-js';
import {Message} from './message.js';
import {Map} from './map.js';
import {TIME_ENGINE, SCHEDULER, setTimedUnlocker} from './timing.js';
import {DATASTORE} from './datastore.js';

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
      console.log("player is acting");
    }
  },
  LISTENERS: {
    actionDone: function(evtData){
      this.isActing(false);
      SCHEDULER.setDuration(this.getBaseActionDuration());
      setTimeout(function(){
        TIME_ENGINE.unlock();
      }, 1);
      console.log("end player acting");
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
      this.setRenderDelay(template.renderDelay || 1);//25
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
      SCHEDULER.setDuration(this.getBaseActionDuration());
      this.isActing(false);
      this.raiseMixinEvent('renderMain');
      return {then: function(unlocker){
        setTimeout(function(){
          setTimedUnlocker(false);
          unlocker();
        }, actor.getRenderDelay());
      }};
    }
  }
}

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
      console.log("walker is acting");
      //Rand number from -1 to 1
      let dx = Math.trunc(ROT.RNG.getUniform() * 3) - 1;
      let dy = Math.trunc(ROT.RNG.getUniform() * 3) - 1;
      this.raiseMixinEvent('walkAttempt', {'dx': dx, 'dy': dy});
      console.log("walker is done acting");
      actorData.terminate = true;
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

}

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
