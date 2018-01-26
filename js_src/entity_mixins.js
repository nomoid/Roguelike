//defines mixins that can be added to an entity

import ROT from 'rot-js';
import {Message} from './message.js';
import {Map} from './map.js';
import {TIME_ENGINE, SCHEDULER, setTimedUnlocker} from './timing.js';
import {DATASTORE} from './datastore.js';
import {Color} from './color.js';
import {generateItem} from './items.js';
import {generateEquipment, EquipmentSlots} from './equipment.js';
import {generateBuff} from './buffs.js';
import * as U from './util.js';
import * as S from './skills.js';
import {getLevelUpInfo} from './stats.js';
import {BINDINGS} from './keybindings.js';
import {generateLoot} from './populators.js';
import {EntityFactory} from './entities.js';

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
    actionDone: function(evtData){
      let timeUsed = 1;
      if(evtData){
        if(evtData.timeUsed){
          timeUsed = evtData.timeUsed;
        }
      }
      this.addTime(timeUsed);
      this.raiseMixinEvent('endOfTurn', {
        timeCounter: this.getTime()
      });
      this.raiseMixinEvent('turnDone');
    },
    requestContextText: function(evtData){
      if(this.getTime() < 50){
        let message = `Check here for useful tips/info!`;
        evtData.contextHolder.playerContext.push([19, message]);
      }
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
        //if you gotta worry about teams
        if(typeof this.getTeam === 'function' && typeof targetPositionInfo.entity.getTeam === 'function'){
          if(this.getFriendlyTeams().indexOf(targetPositionInfo.entity.getTeam())==-1){
            this.raiseMixinEvent('bumpEntity', {
              actor:this,
              target:targetPositionInfo.entity
            });
          }
          else{
            if(targetPositionInfo.entity != this){
              this.raiseMixinEvent('bumpsFriendly', {target:targetPositionInfo.entity});
            }
          }
        }
        else if(targetPositionInfo.entity != this){//if no teams to worry about
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
        this.raiseMixinEvent('walkSuccess', {
          x: newX,
          y: newY
        });
        this.raiseMixinEvent('actionDone');
        return true;
      }
    },
    checkAdjacentContextTile: function(contextHolder, dx, dy){
      let dirKey = '';
      if(dx == 0){
        if(dy < 0){
          dirKey = BINDINGS.GAME.MOVE_NORTH;
        }
        if(dy > 0){
          dirKey = BINDINGS.GAME.MOVE_SOUTH;
        }
      }
      if(dy == 0){
        if(dx < 0){
          dirKey = BINDINGS.GAME.MOVE_WEST;
        }
        if(dx > 0){
          dirKey = BINDINGS.GAME.MOVE_EAST;
        }
      }
      let messageStart = `[${dirKey}] - `;
      let positionInfo = this.getMap().getTargetPositionInfo(this.getX() + dx, this.getY() + dy);
      if(positionInfo.entity){
        if(positionInfo.entity.getName() == "chest"){
          let message = messageStart + 'Open chest';
          contextHolder.mapContext.push([80, message]);
        }
        else if(positionInfo.entity.getName() == "jdog"){
          let message = messageStart + 'Attack';
          contextHolder.mapContext.push([30, message]);
        }
      }
    },
    checkCurrentContextTile: function(contextHolder){
      let positionInfo = this.getMap().getTargetPositionInfo(this.getX(), this.getY());
      if(positionInfo.tile){
        if(positionInfo.tile.isA('stairs_down')){
          let message =  `[${BINDINGS.GAME.NEXT_FLOOR}] - Go down to the next floor`;
          contextHolder.mapContext.push([120, message]);
        }
        else if(positionInfo.tile.isA('stairs_up')){
          let message =  `[${BINDINGS.GAME.PREV_FLOOR}] - Go up from the previous floor`;
          contextHolder.mapContext.push([110, message]);
        }
      }
      if(positionInfo.item){
        let message = `[${BINDINGS.GAME.PICK_UP_ITEM}] - Pick up one item/[${BINDINGS.GAME.PICK_UP_ALL_ITEMS}] - Pick up all items`;
        contextHolder.mapContext.push([60, message]);
      }
    }
  },
  LISTENERS: {
    walkAttempt: function(evtData){
      this.tryWalk(evtData.dx, evtData.dy);
    },
    requestContextText: function(evtData){
      //Player context
      if(this.getMap().attr.floor == 0){
        let message = `Try finding the stairs to the next floor (>)`;
        evtData.contextHolder.playerContext.push([10, message]);
      }
      else if(this.getMap().attr.floor == 1){
        let message = `Press [${BINDINGS.GAME.ENTER_SKILLS}] to open your skill menu and upgrade your skills.`;
        evtData.contextHolder.playerContext.push([1, message]);
      }
      else if(this.getMap().attr.floor == 2){
        let message = `Good luck on your journey!`;
        evtData.contextHolder.playerContext.push([1, message]);
      }
      //Map context
      if(this.getMap().attr.floor == 0){
        let message = `Use arrow keys to move/attack (can be rebound using [${BINDINGS.GAME.ENTER_BINDINGS}])`;
        evtData.contextHolder.mapContext.push([1, message]);
      }
      else if(this.getMap().attr.floor == 1){
        let message = `Press [${BINDINGS.GAME.ENTER_INVENTORY}] to open your inventory to eat food or equip items.`;
        evtData.contextHolder.mapContext.push([1, message]);
      }
      else if(this.getMap().attr.floor == 2){
        let message = `Try to find out how far you can get!`;
        evtData.contextHolder.mapContext.push([1, message]);
      }
      //Check 4 tiles around you
      this.checkAdjacentContextTile(evtData.contextHolder, -1, 0);
      this.checkAdjacentContextTile(evtData.contextHolder, 1, 0);
      this.checkAdjacentContextTile(evtData.contextHolder, 0, -1);
      this.checkAdjacentContextTile(evtData.contextHolder, 0, 1);
      this.checkCurrentContextTile(evtData.contextHolder);
    },
    nextFloor: function(evtData){
      this.raiseMixinEvent('actionDone');
    },
    previousFloor: function(evtData){
      this.raiseMixinEvent('actionDone');
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
    gainedHealth: function(evtData){
      Message.send(`Gained ${evtData.hpGained} hp! Now you have ${evtData.hpLeft}.`);
    },
    attacks: function(evtData){
      Message.send(`You attack the ${evtData.target.getName()}!`);
    },
    bumpsFriendly: function(evtData){
      Message.send(`That ${evtData.target.getName()} is friendly! Don't attack.`);
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
    },
    consumed: function(evtData){
      Message.send(`You consumed ${evtData.item.name}.${evtData.message ? ' ' + evtData.message : ''}`);
    },
    buffGained: function(evtData){
      Message.send(`You gained the ${evtData.name} buff.`);
      Message.send(U.fillTemplate(evtData.description, evtData));
    },
    buffLost: function(evtData){
      Message.send(`You lost the ${evtData.name} buff.`);
    },
    equipSuccess: function(evtData){
      Message.send(`You equipped ${evtData.item.name} to the ${EquipmentSlots[evtData.slot]} slot.`);
    },
    equipFailed: function(evtData){
      Message.send(`You failed to equip ${evtData.item.name}.${evtData.message ? ' ' + evtData.message : ''}`);
    },
    unequipSuccess: function(evtData){
      Message.send(`You unequipped ${evtData.item.name} from the ${EquipmentSlots[evtData.slot]} slot.`);
    },
    unequipFailed: function(evtData){
      Message.send(`You failed to unequip ${evtData.item.name}.${evtData.message ? ' ' + evtData.message : ''}`);
    },
    itemDropped: function(evtData){
      Message.send(`You dropped ${evtData.item.name}.`);
    },
    itemTrashed: function(evtData){
      Message.send(`You trashed ${evtData.item.name}.`);
    },
    skillLevelUp: function(evtData){
      Message.send(`${evtData.name} leveled up to level ${evtData.level}`);
    },
    skillLevelUpFailed: function(evtData){
      Message.send(`${evtData.name} failed to level up.${evtData.message ? ' ' + evtData.message : ''}`);
    },
    skillSeen: function(evtData){
      Message.send(`You discovered the ${evtData.name} skill.`);
    },
    //addSkillFailed: function(evtData){
    //  Message.send(`You failed to improve the ${evtData.name} skill.${evtData.message ? ' ' + evtData.message : ''}`)
    //}
    characterLevelUp: function(evtData){
      Message.send(`You have leveled up to Level ${evtData.level}!`);
    },
    previousFloor: function(evtData){
      Message.send("You have entered the previous floor");
    },
    nextFloor: function(evtData){
      Message.send("You have entered the next floor");
    },
    foundChest: function(evtData){
      Message.send(`You found a chest with ${evtData.items.length} items inside. The items dropped to your feet ([${BINDINGS.GAME.PICK_UP_ALL_ITEMS}] to pick them up).`);
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
    },
    initialize: function(template){
      this.attr._HitPoints.hp = template.hp || template.stats.maxHp;
    }
  },
  METHODS: {
    loseHp: function(amt){
      let curHp = this.attr._HitPoints.hp;
      this.attr._HitPoints.hp -= amt;
      this.attr._HitPoints.hp = Math.max(0, this.attr._HitPoints.hp);
      let hpDiff = curHp-this.attr._HitPoints.hp;
      if(hpDiff > 0){
        this.raiseMixinEvent('lostHealth', {
          hpLost: hpDiff,
          hpLeft: this.attr._HitPoints.hp
        });
      }
    },
    gainHp: function(amt){
      let curHp = this.attr._HitPoints.hp;
      this.attr._HitPoints.hp += amt;
      this.attr._HitPoints.hp = Math.min(this.getStat('maxHp'), this.attr._HitPoints.hp);
      let hpDiff = this.attr._HitPoints.hp-curHp;
      if(hpDiff > 0){
        this.raiseMixinEvent('gainedHealth', {
          hpGained: hpDiff,
          hpLeft: this.attr._HitPoints.hp
        });
      }
    },
    getHp: function(){
      return this.attr._HitPoints.hp;
    },
    setHp: function(amt){
      this.attr._HitPoints.hp = amt;
    }
  },
  LISTENERS: {
    // src(entity): the source of the damage
    // damageAmount(int): the amount of damage taken
    // weapon(weapon): the weapon used to attack
    damaged: function(evtData){
      let amt = evtData.damageAmount;
      this.loseHp(amt);
      evtData.src.raiseMixinEvent('damages', {
        target: this,
        damageAmount: amt,
        weapon: evtData.weapon
      });
      if(this.getHp() == 0){
        this.raiseMixinEvent('killed',{
          src: evtData.src
        });
        evtData.src.raiseMixinEvent('kills', {
          target: this,
          weapon: evtData.weapon
        });
        this.destroy();
        console.dir(this);
        console.dir(DATASTORE);
      }
    },
    healed: function(evtData){
      let amt = evtData.healAmount;
      this.gainHp(amt);
    },
    kills: function(evtData){
      if(typeof this.getBuffInfo !== 'function'){
        return;
      }
      let info = this.getBuffInfo('Lifelink');
      if(info){
        this.raiseMixinEvent('healed', {
          srcBuffInfo: info,
          srcType: 'buff',
          src: DATASTORE.ENTITIES[info.srcId],
          healAmount: info.effect.healAmount
        });
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
      if(evtData.target.getName()==='chest'){
        evtData.target.raiseMixinEvent('openChest', {src: this});
      }
      this.raiseMixinEvent('attacks', {
        actor: this,
        target: evtData.target
      });
      let bumpWeapon = null;
      if(typeof this.getWeapon === 'function'){
        bumpWeapon = this.getWeapon();
      }
      evtData.target.raiseMixinEvent('damaged', {
        src: this,
        damageAmount: this.getMeleeDamage(),
        weapon: bumpWeapon
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
      //Find context text
      //Pass in arrays of [priority, text]
      let contextHolder = {
        playerContext: [],
        mapContext: []
      };
      this.raiseMixinEvent('requestContextText', {
        'contextHolder': contextHolder
      });
      this.raiseMixinEvent('updateContext', {
        'contextHolder': contextHolder
      });
      this.isActing(true);
      TIME_ENGINE.lock();
      DATASTORE.GAME.render();
      //console.log("player is acting");
    }
  },
  LISTENERS: {
    turnDone: function(evtData){
      this.getMap().clearPaint();
      this.isActing(false);
      let duration = this.getBaseActionDuration();
      if(typeof this.getBuffInfo === 'function'){
        let info = this.getBuffInfo('Haste');
        if(info){
          //Min duration 1
          duration = Math.max(1, Math.trunc(duration * info.effect.durationMultiplier));
        }
      }
      SCHEDULER.setDuration(duration);
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

export let TeamMember = {
  META: {
    mixinName: 'TeamMember',
    mixinGroupName: 'TeamMember',
    stateNamespace: '_TeamMember',
    stateModel: {
      friendlyTeams: [],
      enemyTeams: [],
      team: ''
    },
    initialize: function(template){
      // console.log('AAAAAAAAAAAAAA');
      this.attr._TeamMember.friendlyTeams = U.deepCopy(template.friendlyTeams || {});
      this.attr._TeamMember.enemyTeams = U.deepCopy(template.enemyTeams || {});
      // console.log('assigned enemy teams');
      //console.dir(this.attr._TeamMember.enemyTeams);
      this.attr._TeamMember.team = template.team;
    }
  },
  METHODS: {
    getTeam: function(){
      return this.attr._TeamMember.team;
    },
    setTeam: function(newTeam){
      this.removeEnemyTeam(newTeam);
      this.addFriendlyTeam(newTeam);
      this.attr._TeamMember.team = newTeam;
    },
    getEnemyTeams: function(){
      //console.dir(this.attr._TeamMember.enemyTeams);
      return this.attr._TeamMember.enemyTeams;
    },
    addEnemyTeam: function(enemyName){
      if(this.attr._TeamMember.enemyTeams.indexOf(enemyName)==-1){
        this.attr._TeamMember.enemyTeams.push(enemyName);
      }
    },
    removeEnemyTeam: function(enemyName){
      if(this.attr._TeamMember.enemyTeams.indexOf(enemyName)!=-1){
        this.attr._TeamMember.enemyTeams.splice(this.attr._TeamMember.enemyTeams.indexOf(enemyName));
      }
    },
    getFriendlyTeams: function(){
      return this.attr._TeamMember.friendlyTeams;
    },
    addFriendlyTeam: function(friendlyName){
      if(this.attr._TeamMember.friendlyTeams.indexOf(friendlyName)==-1){
        this.attr._TeamMember.friendlyTeams.push(friendlyName);
      }
    },
    removeFriendlyTeam: function(friendlyName){
      if(this.attr._TeamMember.friendlyTeams.indexOf(friendlyName)!=-1){
        this.attr._TeamMember.friendlyTeams.splice(this.attr._TeamMember.friendlyTeams.indexOf(friendlyName));
      }
    }
  }
}

//requires teammember
export let OmniscientEnemyTargeter = {
  META: {
    mixinName: 'OmniscientEnemyTargeter',
    mixinGroupName: 'Targeter',
    stateNamespace: '_OmniscientEnemyTargeter',
    stateModel: {
    },
    initialize: function(template){
    }
  },
  METHODS: {
    getTargetPos: function(){
      // console.dir(this);
      let map = this.getMap();
      let targets = [];
      for(let entId in map.attr.entityIdToMapPos){
        let ent = DATASTORE.ENTITIES[entId];
        // console.dir(this.getEnemyTeams());
        if(typeof ent.getTeam === 'function'){
          if(this.getEnemyTeams().indexOf(ent.getTeam())!=-1){
            targets.push(ent);
            // console.dir(ent);
          }
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

//requires teammember and FOVHandler
export let SightedEnemyTargeter = {
  META: {
    mixinName: 'SightedEnemyTargeter',
    mixinGroupName: 'Targeter',
    stateNamespace: '_SightedEnemyTargeter',
    stateModel: {
      remember: false,
      memoryPos: null
    },
    initialize: function(template){
      this.attr._SightedEnemyTargeter.remember = template.remember;
    }
  },
  METHODS: {
    getTargetPos: function(){
      // console.dir(this);
      let map = this.getMap();
      let visibility_checker = this.generateVisibilityChecker();
      let targets = [];
      let memoryPos = this.attr._SightedEnemyTargeter.memoryPos;
      for(let entId in map.attr.entityIdToMapPos){
        let ent = DATASTORE.ENTITIES[entId];
        // console.dir(this.getEnemyTeams());
        if(visibility_checker.check(ent.getX(), ent.getY())){
          if(typeof ent.getTeam === 'function'){
            if(this.getEnemyTeams().indexOf(ent.getTeam())!=-1){
              targets.push(ent);
              //console.dir(ent);
            }
          }
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
      if(memoryPos){
        if(memoryPos.split(',')[0]==this.getX() && memoryPos.split(',')[1]==this.getY()){
          memoryPos = null;
          this.attr._SightedEnemyTargeter.memoryPos = null;
        }
      }
      if(targets.length==0){
        return this.attr._SightedEnemyTargeter.memoryPos;
      }
      let target = targets[minDIndex];
      let pos = `${target.getX()},${target.getY()}`;
      this.attr._SightedEnemyTargeter.memoryPos = pos;
      return pos;

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
      let dir = Math.floor(ROT.RNG.getUniform() * 10);//the higher this is, the higher the chance of standing still
      let dx, dy;
      switch (dir) {
        case 0:
          dx = -1;
          dy = 0;
          break;
        case 1:
          dx = 0;
          dy = -1;
          break;
        case 2:
          dx = 1;
          dy = 0;
          break;
        case 3:
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
      let targetPos = this.getTargetPos();
      if(targetPos==null){
        actorData.terminate = false;
        return;
      }
      targetPos = targetPos.split(',');
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
    },
    initialize: function(){
    }
  },
  METHODS: {
    getNextMoveDijkstra: function(){
      let targetPos = this.getTargetPos();
      if(targetPos==null){
        return null;
      }
      let thisEnt = this;
      targetPos = targetPos.split(',');
      let targetX = targetPos[0]*1;
      let targetY = targetPos[1]*1;
      let thisx = this.getX();
      let thisy = this.getY();
      let map = this.getMap();
      let passableFunction = function(x, y){
        //console.log(`${x},${y}`);
        let oneAway = false;
        if(y == thisy){
          if(x == thisx + 1 || x == thisx - 1){
            oneAway = true;
          }
        }
        if(x == thisx){
          if(y == thisy + 1 || y == thisy - 1){
            oneAway = true;
          }
        }
        if(oneAway){
          //Still may result in no path found
          let isOpen = map.isPositionOpen(x, y);
          let isEnemy = false;
          let info = map.getTargetPositionInfo(x, y);
          let ent = info.entity;
          if(ent){
            if(typeof ent.getTeam === 'function' && typeof thisEnt.getEnemyTeams === 'function'){
              if(thisEnt.getEnemyTeams(ent.getTeam())!=-1){
                isEnemy = true;
              }
            }
          }
          return isOpen || isEnemy;
        }
        else{
          return map.getTile(x, y).isPassable();
        }
      }
      //Randomly decide to use x,y coords or y,x coords
      let invertCoords = ROT.RNG.getUniform() < 0.5;
      if(invertCoords){
        let passableCallback = function(y, x){
          return passableFunction(x, y);
        }
        let dijkstra = new ROT.Path.AStar(thisy, thisx, passableCallback, {topology: 4});

        let dx = 'a';
        let dy = 'a';
        //console.log('target pos:');
        //console.log(`${targetX},${targetY}`);
        dijkstra.compute(targetY, targetX, function(y, x){
          if(x!=thisx || y!=thisy){
            dx = x-thisx;
            dy = y-thisy;
          }
        });
        return `${dx},${dy}`;
      }
      else{
        let passableCallback = function(x, y){
          return passableFunction(x, y);
        }
        let dijkstra = new ROT.Path.AStar(thisx, thisy, passableCallback, {topology: 4});

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
    }
  },
  LISTENERS: {
    actorPerform: function(actorData){
      if(actorData.target && actorData.target !== 'OmniscientPathfinder'){
        return;
      }
      let move = this.getNextMoveDijkstra();
      if(move==null){
        actorData.terminate = false;
        return;
      }
      move = move.split(',');
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

//requires aiactor and any targeter and FOVHandler
export let SightedPathfinder = {
  META: {
    mixinName: 'SightedPathfinder',
    mixinGroupName: 'Pathfinder',
    stateNamespace: '_SightedPathfinder',
    stateModel: {
      darknessRadius: 1
    },
    initialize: function(template){
      this.attr._SightedPathfinder.darknessRadius = template.radius+2;
    }
  },
  METHODS: {
    getNextMoveDijkstra: function(){
      let targetPos = this.getTargetPos();
      if(targetPos==null){
        return null;
      }
      let thisEnt = this;
      let checker = this.generateVisibilityChecker();
      targetPos = targetPos.split(',');
      let targetX = targetPos[0]*1;
      let targetY = targetPos[1]*1;
      let thisx = this.getX();
      let thisy = this.getY();
      let map = this.getMap();

      let pathfindingMaxDistance = Math.max(this.attr._SightedPathfinder.darknessRadius, Math.floor(U.distance2D(this.getX(), this.getY(), targetX, targetY)));
      let passableFunction = function(x, y){
        //console.log(`${x},${y}`);
        if(U.distance2D(thisEnt.getX(), thisEnt.getY(), x, y)>pathfindingMaxDistance){
          if(!checker.memoryTile(x, y)){
            return false;
          }
        }
        else if(!checker.memoryTile(x, y)){
          return true;
        }
        let oneAway = false;
        if(y == thisy){
          if(x == thisx + 1 || x == thisx - 1){
            oneAway = true;
          }
        }
        if(x == thisx){
          if(y == thisy + 1 || y == thisy - 1){
            oneAway = true;
          }
        }
        if(oneAway){
          //Still may result in no path found
          let isOpen = map.isPositionOpen(x, y);
          let isEnemy = false;
          let info = map.getTargetPositionInfo(x, y);
          let ent = info.entity;
          if(ent){
            if(typeof ent.getTeam === 'function' && typeof thisEnt.getEnemyTeams === 'function'){
              if(thisEnt.getEnemyTeams().indexOf(ent.getTeam())!=-1){
                isEnemy = true;
              }
            }
          }
          return isOpen || isEnemy;
        }
        else{
          return map.getTile(x, y).isPassable();
        }
      };
      //Randomly decide to use x,y coords or y,x coords
      let invertCoords = ROT.RNG.getUniform() < 0.5;
      if(invertCoords){
        let passableCallback = function(y, x){
          return passableFunction(x, y);
        }
        let dijkstra = new ROT.Path.AStar(thisy, thisx, passableCallback, {topology: 4});

        let dx = 'a';
        let dy = 'a';
        //console.log('target pos:');
        //console.log(`${targetX},${targetY}`);
        dijkstra.compute(targetY, targetX, function(y, x){
          if(x!=thisx || y!=thisy){
            dx = x-thisx;
            dy = y-thisy;
          }
          //thisEnt.getMap().paintTile(x, y, Color.PAINT_BG);
        });
        return `${dx},${dy}`;
      }
      else{
        let passableCallback = function(x, y){
          return passableFunction(x, y);
        }
        let dijkstra = new ROT.Path.AStar(thisx, thisy, passableCallback, {topology: 4});

        let dx = 'a';
        let dy = 'a';
        //console.log('target pos:');
        //console.log(`${targetX},${targetY}`);
        dijkstra.compute(targetX, targetY, function(x, y){
          if(x!=thisx || y!=thisy){
            dx = x-thisx;
            dy = y-thisy;
          }
          //thisEnt.getMap().paintTile(x, y, Color.PAINT_BG);
        });
        return `${dx},${dy}`;
      }
    }
  },
  LISTENERS: {
    actorPerform: function(actorData){
      if(actorData.target && actorData.target !== 'SightedPathfinder'){
        return;
      }
      let move = this.getNextMoveDijkstra();
      if(move==null){
        actorData.terminate = false;
        return;
      }
      move = move.split(',');
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
    initialize: function(){
    }
  },
  METHODS: {

  },
  LISTENERS: {
    //For testing, drop a dummy item
    killed: function(evtData){
      if(evtData.src.getName() == 'avatar'){
        for(let i = 0; i < 10; i++){
          let itemData = {x: this.getX(), y: this.getY()};
          itemData.item = generateItem("JDog's Ramen");
          this.raiseMixinEvent('addItemToMap', itemData);
        }
        for(let i = 0; i < 2; i++){
          let itemData = {x: this.getX(), y: this.getY()};
          itemData.item = generateItem("JDog's Calves");
          this.raiseMixinEvent('addItemToMap', itemData);
        }
      }
      else{
        let itemData = {x: this.getX(), y: this.getY()};
        itemData.item = generateItem("JDog's Spicy Ramen");
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
    initialize: function(){
      // do any initialization
    }
  },
  METHODS: {
    pickUpItem: function(){
      let map = this.getMap();
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
        let itemLength = items.length;
        for(let i = 0; i < itemLength; i++){
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
    tryDropItem: function(evtData){
      this.getMap().addItemAt(evtData.item, this.getX(), this.getY());
      this.raiseMixinEvent('itemDropped', {
        item: evtData.item,
        src: this,
        xPos: this.getX(),
        yPos: this.getY()
      });
      evtData.removed = true;
    },
    tryTrashItem: function(evtData){
      this.raiseMixinEvent('itemTrashed', {
        item: evtData.item,
        src: this
      });
      evtData.removed = true;
    },
    initAvatar: function(evtData){
      let startingEquipment = [
        "dagger_1",
        "boots_1",
        "boots_2",
        "cursed_boots_1",
        "shortsword_1",
        "longsword_1",
        "battle_axe_1",
        "wooden_shield_1"
      ];
      let item = generateItem("Swiftness Candy");
      this.addItem(item);
      for(let i = 0; i < startingEquipment.length; i++){
        let equip1 = generateEquipment(startingEquipment[i]);
        this.addItem(equip1);
      }
    }
  }
};

export let Equipment = {
  META: {
    mixinName: 'Equipment',
    mixinGroupName: 'ItemGroup',
    stateNamespace: '_Equipment',
    stateModel: {
      equipment: {
        head: null,
        armor: null,
        pants: null,
        boots: null,
        gauntlets: null,
        amulet: null,
        ring1: null,
        ring2: null,
        primaryHand: null,
        secondaryHand: null
      }
    },
    initialize: function(){
      // do any initialization
    }
  },
  METHODS: {
    getEquipment: function(){
      return this.attr._Equipment.equipment;
    },
    //Temp method
    getWeapon: function(){
      return this.getEquipment().primaryHand;
    },
    addEquipment: function(slot, item, oldItemHolder){
      let primarySlot = "primaryHand";
      let secondarySlot = "secondaryHand";
      let oneHandedSlot = "One-Handed";
      let twoHandedSlot = "Two-Handed";
      //Check if item is allowed in slot
      let allowed = false;
      if(item.type == "Equipment" && item.slot == EquipmentSlots[slot]){
        allowed = true;
      }
      //Check for primary/secondary hand
      if(item.slot == oneHandedSlot && (slot == primarySlot || slot == secondarySlot)){
        allowed = true;
      }
      //Check for two handed
      if(item.slot == twoHandedSlot && (slot == primarySlot)){
        allowed = true;
      }
      if(!allowed){
        this.raiseMixinEvent('equipFailed', {
          'item': item,
          message: `Can't equip to this to the ${EquipmentSlots[slot]} slot!`
        });
        return false;
      }
      if(oldItemHolder){
        if(!oldItemHolder.items){
          oldItemHolder.items = Array();
        }
      }
      let equipmentHolder = this.getEquipment();
      //If there's already one there swap it out
      let removeItemHolder = {item: null};
      if(!this.removeEquipment(slot, removeItemHolder)){
        this.raiseMixinEvent('equipFailed', {
          'item': item,
          message: `Failed to remove the item occupying the same slot!`
        });
        if(oldItemHolder && removeItemHolder.item){
          oldItemHolder.items.push(removeItemHolder.item);
        }
        return false;
      }
      else{
        if(oldItemHolder && removeItemHolder.item){
          oldItemHolder.items.push(removeItemHolder.item);
        }
      }
      //Unequip from secondary if equipping two-handed
      if(item.slot == twoHandedSlot){
        let secondaryRemoveItemHolder = {item: null};
        if(!this.removeEquipment(secondarySlot, secondaryRemoveItemHolder)){
          this.raiseMixinEvent('equipFailed', {
            'item': item,
            message: `Failed to remove the item occupying the secondary hand slot!`
          });
          if(oldItemHolder && secondaryRemoveItemHolder.item){
            oldItemHolder.items.push(secondaryRemoveItemHolder.item);
          }
          return false;
        }
        else{
          if(oldItemHolder && secondaryRemoveItemHolder.item){
            oldItemHolder.items.push(secondaryRemoveItemHolder.item);
          }
        }
      }
      equipmentHolder[slot] = item;
      this.raiseMixinEvent('equipSuccess', {
        'item': item,
        'slot': slot
      });
      return true;
    },
    removeEquipment: function(slot, oldItemHolder){
      let primarySlot = "primaryHand";
      let secondarySlot = "secondaryHand";
      let twoHandedSlot = "Two-Handed";
      let equipmentHolder = this.getEquipment();
      //If removing from the secondary slot remove any two handed weapons from primary
      if(slot == secondarySlot){
        let primaryItem = equipmentHolder[primarySlot];
        if(primaryItem){
          if(primaryItem.slot == twoHandedSlot){
            let removedItemHolder = {item: null};
            let success = this.removeEquipment(primarySlot, removedItemHolder);
            if(oldItemHolder){
              oldItemHolder.item = removedItemHolder.item;
            }
            return success;
          }
        }
      }
      //Remove the item
      let item = equipmentHolder[slot];
      if(oldItemHolder){
        oldItemHolder.item = item;
      }
      if(item){
        if(item.equipmentData){
          if(item.equipmentData.cursed){
            this.raiseMixinEvent('unequipFailed', {
              'item': item,
              message: `Can't remove the item from the ${EquipmentSlots[slot]} slot!`
            });
            return false;
          }
        }
        equipmentHolder[slot] = null;
        this.raiseMixinEvent('unequipSuccess', {
          'item': item,
          'slot': slot
        });
      }
      return true;
    }
  },
  LISTENERS: {
    tryEquip: function(evtData){
      this.raiseMixinEvent('switchMode', {
        mode: 'equipment',
        type: 'push',
        template: {
          equipping: true,
          itemIndex: evtData.itemIndex,
          item: evtData.item,
          avatarId: evtData.src.getId()
        }
      });
    }
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
    canRemoveItem: function(itemIndex){
      if(itemIndex >= 0 && itemIndex < this.getItems().length){
        return true;
      }
      return false;
    },
    addItem: function(item){
      this.getItems().push(item);
      return true;
    },
    removeItem: function(itemIndex){
      let items = this.getItems();
      let item = items[itemIndex];
      if(itemIndex < items.length){
        items.splice(itemIndex, 1);
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

//Requires ItemPile
export let Chest = {
  META: {
    mixinName: 'Chest',
    mixinGroupName: 'ItemGroup',
    stateNamespace: '_Chest',
    initialize: function(){
      // do any initialization
    }
  },
  METHODS: {
    seedLoot: function(lootTable){
      //Generate what's in this chest
      let itemCount = Math.trunc(ROT.RNG.getUniform() * (lootTable.itemCount - 1)) + 1;
      let lootSet = lootTable.lootSet;
      for(let i = 0; i < itemCount; i++){
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
        let item = generateLoot(possibleLoot[index].item);
        this.addItem(item);
      }
    }
  },
  LISTENERS: {
    openChest: function(evtData){
      //Drop all held items
      let items = this.getItems();
      if(items.length > 0){
        evtData.src.raiseMixinEvent('foundChest', {
          'items': items
        });
      }
      for(let i = 0; i < items.length; i++){
        let itemData = {x: evtData.src.getX(), y: evtData.src.getY()};
        itemData.item = items[i];
        this.raiseMixinEvent('addItemToMap', itemData);
      }
      let map = this.getMap();
      let x = this.getX();
      let y = this.getY();
      this.clearItems();
      this.destroy();
      //Kill this chest, replace it with an opened one
      let mob = EntityFactory.create('open_chest', true);
      map.addEntityAt(mob, x, y);
    }
  }
}

export let ItemConsumer = {
  META: {
    mixinName: 'ItemConsumer',
    mixinGroupName: 'ItemGroup',
    stateNamespace: '_ItemConsumer',
    initialize: function(){
      // do any initialization
    }
  },
  METHODS: {
  },
  LISTENERS: {
    //Only called on misc consumables
    tryConsume: function(evtData){
      if(evtData.item.effect){
        this.raiseMixinEvent('consumed', {
          item: eatenItem
        });
        let data = U.deepCopy(eatenItem.effect);
        data.srcItem = eatenItem;
        data.srcType = 'consumable';
        data.src = this;
        delete data.mixinEvent;
        this.raiseMixinEvent(evtData.item.effect.mixinEvent, data);
      }
      else{
        this.raiseMixinEvent('consumed', {
          item: evtData.item,
          message: "But nothing happened..."
        });
      }
      evtData.removed = true;
    },
    tryEat: function(evtData){
      let eatenItem = evtData.item;
      this.raiseMixinEvent('consumed', {
        item: eatenItem
      });
      if(eatenItem.satiation){
        this.raiseMixinEvent('gainSatiation', {
          amount: eatenItem.satiation
        });
      }
      //More than one effect in an array
      if(eatenItem.effects){
        for(let i = 0; i < eatenItem.effects.length; i++){
          let effect = eatenItem.effects[i];
          let data = U.deepCopy(effect);
          data.srcItem = eatenItem;
          data.srcType = 'food';
          data.src = this;
          delete data.mixinEvent;
          this.raiseMixinEvent(effect.mixinEvent, data);
        }
      }
      //A single effect
      else if(eatenItem.effect){
        let data = U.deepCopy(eatenItem.effect);
        data.srcItem = eatenItem;
        data.srcType = 'food';
        data.src = this;
        delete data.mixinEvent;
        this.raiseMixinEvent(eatenItem.effect.mixinEvent, data);
      }
      evtData.removed = true;
    }
  }
}

//Requires TimeTracker
//Also handles debuffs
export let BuffHandler = {
  META: {
    mixinName: 'BuffHandler',
    mixinGroupName: 'BuffGroup',
    stateNamespace: '_BuffHandler',
    stateModel: {
      timeCounter: 0,
      buffInfoList: []
      //Each buffinfo has a
      //name(str),
      //startTime(int),
      //endTime(int),
      //effect(obj),
      //frequency(int)
    },
    initialize: function(){
      // do any initialization
    }
  },
  METHODS: {
    addBuff: function(buffTemplate, src){
      let buffObj = U.deepCopy(buffTemplate);
      this.removeBuff(buffObj.name);
      buffObj.duration = buffObj.duration || 1;
      buffObj.frequency = buffObj.frequency || 1;
      buffObj.description = buffObj.description || "It is currently unknown what this buff will do";
      buffObj.endTime = buffObj.duration;
      if(buffObj.duration >= 0){
        buffObj.endTime = this.attr._BuffHandler.timeCounter + buffObj.duration;
      }
      buffObj.startTime = this.attr._BuffHandler.timeCounter;
      buffObj.srcId = src.getId();
      this.getBuffInfoList().push(buffObj);
      let buffInfo = this.generateBuffInfo(buffObj);
      this.raiseMixinEvent('buffGained', buffInfo);
    },
    removeBuff: function(buffName){
      let buffList = this.getBuffInfoList();
      for(let i = 0; i < buffList.length; i++){
        if(buffList[i].name === buffName){
          let buff = buffList[i];
          let buffInfo = this.generateBuffInfo(buff);
          buffList.splice(i, 1);
          this.raiseMixinEvent('buffLost', buffInfo);
          return buffInfo;
        }
      }
      return null;
    },
    getBuffInfo: function(buffName){
      let buffList = this.getBuffInfoList();
      for(let i = 0; i < buffList.length; i++){
        if(buffList[i].name === buffName){
          return this.generateBuffInfo(buffList[i]);
        }
      }
    },
    getBuffInfoList: function(){
      return this.attr._BuffHandler.buffInfoList;
    },
    generateBuffInfo: function(buffObj){
      let newBuffObj = U.deepCopy(buffObj);
      let endTime = newBuffObj.endTime;
      if(newBuffObj.endTime >= 0){
        endTime = newBuffObj.endTime - this.attr._BuffHandler.timeCounter;
      }
      newBuffObj.timeLeft = endTime;
      delete newBuffObj.startTime;
      delete newBuffObj.endTime;
      return newBuffObj;
    }
  },
  LISTENERS: {
    endOfTurn: function(evtData){
      let timeCounter = evtData.timeCounter;
      this.attr._BuffHandler.timeCounter = timeCounter;
      let removedIndices = Array();
      let buffList = this.getBuffInfoList();
      for(let i = 0; i < buffList.length; i++){
        //Happens even if removed this turn
        let buff = buffList[i];
        let buffInfo = this.generateBuffInfo(buff);
        if(buff.effect.mixinEvent){
          if((timeCounter - buff.startTime) % buff.frequency === 0){
            let effectData = U.deepCopy(buff.effect);
            delete effectData.mixinEvent;
            effectData.srcBuffInfo = buffInfo;
            effectData.srcType = 'buff';
            effectData.src = DATASTORE.ENTITIES[buff.srcId];
            this.raiseMixinEvent(buff.effect.mixinEvent, effectData);
          }
        }
        if(buff.endTime >= 0 && timeCounter >= buff.endTime){
          removedIndices.push(i);
        }
      }
      //Remove in reverse
      for(let i = removedIndices.length - 1; i >= 0; i--){
        let buff = buffList[removedIndices[i]];
        let buffInfo = this.generateBuffInfo(buff);
        buffList.splice(removedIndices[i], 1);
        this.raiseMixinEvent('buffLost', buffInfo);
      }
    },
    addBuffFromName: function(evtData){
      this.addBuff(generateBuff(evtData.buffName), evtData.src);
    }
  }
}

//Requres BuffHandler
export let Bloodthirst = {
  META: {
    mixinName: 'Bloodthirst',
    mixinGroupName: 'BuffGroup',
    stateNamespace: '_Bloodthirst',
    initialize: function(){
      // do any initialization
    }
  },
  METHODS: {
  },
  LISTENERS: {
    kills: function(evtData){
      if(typeof this.addBuff === 'function'){
        if(ROT.RNG.getUniform() < 0.5){
          this.raiseMixinEvent("addBuffFromName", {
            buffName: "hp_regen_1",
            src: this
          });
        }
        else{
          this.raiseMixinEvent("addBuffFromName", {
            buffName: "lifelink_1",
            src: this
          });
        }
      }
    }
  }
}

export let Skills = {
  META: {
    mixinName: 'Skills',
    mixinGroupName: 'SkillsGroup',
    stateNamespace: '_Skills',
    stateModel: {
      skillPoints: 0,
      skillPointParts: 0,
      levelXp: 0,
      skills: {

      }
      //Each skill has a
      //name(str),
      //xp(int) - cumulative skill xp
      //seen(bool)
    },
    initialize: function(){

    }
  },
  METHODS: {
    getSkillPoints: function(){
      return this.attr._Skills.skillPoints;
    },
    setSkillPoints: function(s){
      this.attr._Skills.skillPoints = s;
    },
    getSkillPointParts: function(){
      return this.attr._Skills.skillPointParts;
    },
    setSkillPointParts: function(s){
      this.attr._Skills.skillPointParts = s;
    },
    getSkills: function(){
      return this.attr._Skills.skills;
    },
    //Alphabetical order
    getSkillNames: function(){
      let skillArray = Array();
      let skills = this.getSkills();
      for(let skillName in skills){
        skillArray.push(skillName);
      }
      skillArray.sort();
      return skillArray;
    },
    getSkillInfo: function(name){
      let skill = this.getSkills()[name];
      let lvl = S.getLevelForSkill(skill.name, skill.xp);
      //xp remaining needed to level up
      let xpNeeded = S.getXpForSkillLevel(skill.name, lvl+1) - skill.xp;
      let skillInfo = {
        name: skill.name,
        level: lvl,
        xp: skill.xp,
        seen: skill.seen,
        description: S.getSkillDescription(skill.name)
      };
      if(xpNeeded > 0){
        skillInfo.xpNeeded = xpNeeded;
      }
      return skillInfo;
    },
    addSkill: function(name, xp, extraData){
      let seen = false;
      let addPointParts = true;
      let addLevelXp = true;
      let message = true;
      if(extraData){
        if(extraData.seen){
          seen = true;
        }
        //No parts happens when we get a skill by default
        //No parts also happens when we spen skill points
        if(extraData.noParts){
          addPointParts = false;
        }
        //No xp happens when we get a skill by default
        if(extraData.noLevelXp){
          addLevelXp = false;
        }
        if(extraData.noMessage){
          message = false;
        }
      }
      if(!xp){
        xp = 0;
      }
      let success = true;
      let skills = this.getSkills();
      let skill = skills[name];
      let oldLevel = 0;
      //Check for prereqs
      if(!S.hasPrereqs(name, skills)){
        this.raiseMixinEvent('addSkillFailed', {
          'name': name,
          'xp': xp,
          'message': 'You do not have the proper prerequisites.'
        });
        success = false;
        xp = 0;
      }
      if(skill){
        oldLevel = S.getLevelForSkill(skill.name, skill.xp);
        //If new skill has higher xp, replace
        skill.xp += xp;
        if(seen){
          skill.seen = true;
        }
      }
      else{
        let seenTruth = false;
        if(seen){
          seenTruth = true;
        }
        skills[name] = {
          'name': name,
          'xp': xp,
          'seen': seenTruth
        };
      }
      let newSkill = skills[name];
      //Get some skill point parts
      if(addPointParts){
        let partXp = xp;
        //If skill is previously at max level, get more skill point parts
        if(oldLevel == S.getMaxLevel(name)){
          partXp *= 2;
        }
        this.raiseMixinEvent('addSkillPointParts', {
          parts: partXp
        });
      }
      let newLevel = S.getLevelForSkill(newSkill.name, newSkill.xp);
      //Gain level xp points
      if(addLevelXp){
        this.raiseMixinEvent('addLevelXp', {
          'xp': xp
        });
      }
      //If skill reaches level 1, set seen flag to true
      if(newLevel > 0){
        if(!newSkill.seen){
          //If level up, fire an event
          this.raiseMixinEvent('skillSeen', {
            'name': newSkill.name
          });
          newSkill.seen = true;
        }
      }
      if(newLevel > oldLevel){
        if(message){
            //If level up, fire an event
            this.raiseMixinEvent('skillLevelUp', {
              'name': newSkill.name,
              'level': newLevel
            });
          }
      }
      return success;
    }
  },
  LISTENERS: {
    initAvatar: function(evtData){
      this.raiseMixinEvent('addSkillPoints', {
        points: 100
      });
      for(let i = 0; i < S.PlayerSkills.length; i++){
        this.addSkill(S.PlayerSkills[i]);
      }
      for(let i = 0; i < S.PlayerSeenSkills.length; i++){
        this.raiseMixinEvent('seeSkill', {
          name: S.PlayerSeenSkills[i]
        });
      }
      for(let i = 0; i < S.PlayerStartSkills.length; i++){
        this.raiseMixinEvent('gainSkill', {
          name: S.PlayerStartSkills[i],
          xp: S.getXpForSkillLevel(S.PlayerStartSkills[i], 1)
        })
      }
    },
    addSkillPoints: function(evtData){
      this.setSkillPoints(this.getSkillPoints() + evtData.points);
    },
    addSkillPointParts: function(evtData){
      let total = this.getSkillPointParts() + evtData.parts;
      let addPoints = Math.trunc(total / S.PartsMultiplier);
      let removeParts = addPoints * S.PartsMultiplier;
      this.setSkillPointParts(total - removeParts);
      this.raiseMixinEvent('addSkillPoints', {
        points: addPoints
      });
    },
    //Gains skill without adding skill points, level xp, or sending messages
    gainSkill: function(evtData){
      this.addSkill(evtData.name, evtData.xp, {
        noParts: true,
        noLevelXp: true,
        noMessage: true
      });
    },
    //Also learns skills
    addSkillXp: function(evtData){
      this.addSkill(evtData.name, evtData.xp, evtData);
    },
    seeSkill: function(evtData){
      this.addSkill(evtData.name, 0, {seen: true});
    },
    levelUpSkill: function(evtData){
      let skillInfo = this.getSkillInfo(evtData.name);
      let xpNeeded = skillInfo.xpNeeded;
      if(xpNeeded){
        let skillPoints = this.getSkillPoints();
        if(skillPoints * S.ExperienceMultiplier >= xpNeeded){
          if(S.hasPrereqs(evtData.name, this.getSkills())){
            let newSkillPoints = Math.trunc((skillPoints * S.ExperienceMultiplier - xpNeeded) / S.ExperienceMultiplier);
            this.setSkillPoints(newSkillPoints);
            this.addSkill(evtData.name, xpNeeded, {
              noParts: true
            });
          }
          else{
            this.raiseMixinEvent('skillLevelUpFailed', {
              message: 'You do not have the prerequisites!',
              name: evtData.name
            });
          }
        }
        else{
          this.raiseMixinEvent('skillLevelUpFailed', {
            message: 'Not enough skill points!',
            name: evtData.name
          });
        }
      }
      else{
        this.raiseMixinEvent('skillLevelUpFailed', {
          message: 'Skill already at max level!',
          name: evtData.name
        });
      }
    }
  }
}

export let LevelProgress = {
  META: {
    mixinName: 'LevelProgress',
    mixinGroupName: 'SkillsGroup',
    stateNamespace: '_LevelProgress',
    stateModel: {
      levelXp: 0
    },
    initialize: function(){
      // do any initialization
    }
  },
  METHODS: {
    getLevelXp(){
      return this.attr._LevelProgress.levelXp;
    },
    setLevelXp(s){
      this.attr._LevelProgress.levelXp = s;
    },
    addXp(xp){
      if(!xp){
        return;
      }
      let oldLevel = this.getLevel();
      let oldXp = this.getLevelXp();
      let newLevel = S.getCharacterLevelFromXp(oldXp + xp);
      if(newLevel > oldLevel){
        for(let i = 0; i < newLevel - oldLevel; i++){
          this.raiseMixinEvent('characterLevelUp', {
            level: oldLevel + i + 1
          });
        }
        this.setLevel(newLevel);
      }
      this.setLevelXp(oldXp + xp);
    },
    currentLevelXp(){
      return S.getXpForCharacterLevel(this.getLevel());
    },
    nextLevelXp(){
      return S.getXpForCharacterLevel(this.getLevel() + 1);
    }
  },
  LISTENERS: {
    addLevelXp(evtData){
      this.addXp(evtData.xp);
    }
  }
}

//Requires Skills
export let SkillLearner = {
  META: {
    mixinName: 'SkillLearner',
    mixinGroupName: 'SkillsGroup',
    stateNamespace: '_SkillLearner',
    stateModel: {
      beenTo: {
        'f0': true
        //floor:been(bool)
      }
    },
    initialize: function(){
      // do any initialization
    }
  },
  METHODS: {
    gainXpFromEvent: function(skillName, xpGainInfo, evtData){
      //Check to see if it meets requirements
      let requirements = xpGainInfo.requirements;
      if(requirements){
        //Check if there's more than one requirement to be or'ed
        if(Array.isArray(requirements)){
          let passOverall = false;
          for(let i = 0; i < requirements.length; i++){
            let singleRequirement = requirements[i];
            if(this.checkSingleRequirement(singleRequirement, evtData)){
              passOverall = true;
              break;
            }
          }
          if(!passOverall){
            return false;
          }
        }
        else{
          if(!this.checkSingleRequirement(requirements, evtData)){
            return false;
          }
        }
      }
      this.raiseMixinEvent('addSkillXp', {
        name: skillName,
        xp: xpGainInfo.amount
      });
      return true;
    },
    checkSingleRequirement: function(requirement, evtData){
      for(let req in requirement){
        let currentRequirement = requirement[req];
        if(typeof currentRequirement === "object"){
          let subreq = evtData[req];
          if(!subreq){
            return false;
          }
          if(!this.checkSingleRequirement(currentRequirement, subreq)){
            return false;
          }
        }
        else{
          let evtReq = evtData[req];
          let pass = false;
          if(evtReq){
            if(evtReq == currentRequirement){
              pass = true;
            }
          }
          if(!pass){
            return false;
          }
        }
      }
      return true;
    },
    beenTo: function(){
      return this.attr._SkillLearner.beenTo;
    },
    newFloorSkill: function(floor){
      let beenToFloors = this.beenTo();
      let floorNum = `f${floor}`;
      if(!beenToFloors[floorNum]){
        beenToFloors[floorNum] = true;
        this.raiseMixinEvent('addSkillPoints',{
          points: 100
        });
      }
    }
  },
  LISTENERS: {
    _wildCard: function(evtName, evtData){
      let skillNames = this.getSkillNames();
      for(let i = 0; i < skillNames.length; i++){
        let skillName = skillNames[i];
        let xpGain = S.getXpGain(skillName);
        if(xpGain && xpGain[evtName]){
          this.gainXpFromEvent(skillName, xpGain[evtName], evtData);
        }
      }
    },
    nextFloor: function(evtData){
      this.newFloorSkill(evtData.floor);
    },
    previousFloor: function(evtData){
      this.newFloorSkill(evtData.floor);
    }
  }
}

export let Race = {
  META: {
    mixinName: 'Race',
    mixinGroupName: 'StatsGroup',
    stateNamespace: '_Race',
    stateModel: {
      race: []
    },
    initialize: function(template){
      this.attr._CharacterStats.race = template.race || 'human';
    }
  },
  METHODS: {
    getRace(){
      return this.attr._Race.race;
    }
  },
  LISTENERS: {

  }
}

export let CharacterStats = {
  META: {
    mixinName: 'CharacterStats',
    mixinGroupName: 'StatsGroup',
    stateNamespace: '_CharacterStats',
    stateModel: {
      statNames: []
    },
    initialize: function(template){
      this.attr._CharacterStats.statNames = template.statNames || [];
    }
  },
  METHODS: {
    getStatNames: function(){
      return this.attr._CharacterStats.statNames;
    },
    getCharacterStats: function(){
      let output = Array();
      let statNames = this.getStatNames();
      for(let i = 0; i < statNames.length; i++){
        let statName = statNames[i];
        let statValue = this.getStat(statName);
        output.push([statName, statValue]);
      }
      return output;
    }
  },
  LISTENERS: {
    characterLevelUp: function(evtData){
      let statIncrease = {
        maxHp: evtData.level,
        strength: 0,
        agility: 0,
        endurance: 0,
        charisma: 0,
        magic: 0,
        knowledge: 0
      };
      //Increase all stats every 4 levels
      if(evtData.level % 4 == 0){
        statIncrease = {
          maxHp: evtData.level,
          strength: 1,
          agility: 1,
          endurance: 1,
          charisma: 1,
          magic: 1,
          knowledge: 1
        };
      }
      let levelUpInfo;
      if(typeof this.getRace === 'function'){
        levelUpInfo = getLevelUpInfo(this.getRace());
      }
      else{
        levelUpInfo = getLevelUpInfo();
      }
      if(levelUpInfo.maxHp){
        statIncrease.maxHp += levelUpInfo.maxHp;
      }
      if(levelUpInfo.fixed){
        for(let i = 0; i < levelUpInfo.fixed.length; i++){
          statIncrease[levelUpInfo.fixed[i]] += 1;
        }
      }
      if(levelUpInfo.random){
        for(let i = 0; i < levelUpInfo.random.length; i++){
          let count = levelUpInfo.random[i].count;
          if(!count){
            count = 1;
          }
          let statIncreases = levelUpInfo.random[i].inStats;
          let shuffled = U.shuffleArray(U.deepCopy(statIncreases));
          for(let j = 0; j < count; j++){
            statIncrease[shuffled[j]] += 1;
          }
        }
      }
      for(let stat in statIncrease){
        this.setStat(stat, this.getStat(stat) + statIncrease[stat]);
      }
    }
  }
}
