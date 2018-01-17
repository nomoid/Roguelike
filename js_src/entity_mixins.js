//defines mixins that can be added to an entity

import {Message} from './message.js'

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
    mixinGroupName: 'Tracker',
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
    mixinGroupName: 'Walker',
    initialize: function(){
      // do any initialization
    }
  },
  METHODS: {
    tryWalk: function(dx, dy){
      //get target location
      let newX = this.attr.x*1 + dx*1;
      let newY = this.attr.y*1 + dy*1;

      //get info for location (tile/entity)
      let targetPositionInfo = this.getMap().getTargetPositionInfo(newX, newY);
      //if entity, bump it
      if(targetPositionInfo.entity){
        this.raiseMixinEvent('bumpEntity', {
          actor:this,
          target:targetPositionInfo.entity
        });
        return false;
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

        return true;
      }
    }
  }
};

export let PlayerMessage = {
  META: {
    mixinName: 'PlayerMessage',
    mixinGroupName: 'Messager',
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
      Message.send(`You attacked a ${evtData.target.getName()}!`);
    }
  }
};

export let HitPoints = {
  META: {
    mixinName: 'HitPoints',
    mixinGroupName: 'HitPoints',
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
      this.loseHp(evtData.damageAmount);
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
      evtData.target.raiseMixinEvent('damaged', {
        src: this,
        damageAmount: this.getMeleeDamage()
      });
      this.raiseMixinEvent('attacks', {
        actor: this,
        target: evtData.target
      });
    }
  }
};
