//defines mixins that can be added to an entity

import {Message} from './message.js';
import {TIME_ENGINE, SCHEDULER} from './timing.js';

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
      let newX = this.attr.x*1 + dx*1;
      let newY = this.attr.y*1 + dy*1;

      if(this.getMap().isPositionOpen(newX, newY)){
        this.attr.x = newX;
        this.attr.y = newY;
        this.getMap().updateEntityPosition(this, this.attr.x, this.attr.y);

        this.raiseMixinEvent('turnTaken', {timeUsed: 1});

        return true;
      }
      this.raiseMixinEvent('walkBlocked',{reason: 'Path is blocked'});
      return false;
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
    walkBlocked: function(evtData){
      Message.send("Can't walk there! "+evtData.reason);
    },
    lostHealth: function(evtData){
      Message.send(`Lost ${evtData.hpLost} hp! Only ${evtData.hpLeft} left...`);
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
    evtLabel: function(evtData){

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
      SCHEDULER.add(this, true, 1);
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
      this.isActing(false);
      console.log("player is acting");
    }
  },
  LISTENERS: {
    actionDone: function(evtData){
      SCHEDULER.setDuration(this.getBaseActionDuration());
      this.setBaseActionDuration(this.getBaseActionDuration()); //get random int
      setTimeout(function(){
        TIME_ENGINE.unlock();
      }, 1);
      console.log("end player acting");
    }
  }
};
