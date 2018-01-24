import {deepCopy} from './util.js';
import {BINDINGS} from './keybindings.js';

export let Items = {
  "JDog's Ramen": {
    name: "JDog's Ramen",
    type: "Food",
    effect: {
      mixinEvent: "healed",
      healAmount: 3
    },
    description: "A common drop item that jdogs like to eat in his free time. Heals for ${this.effect.healAmount}."
  },
  "JDog's Calves": {
    name: "JDog's Calves",
    type: "Key Item",
    description: "He's got them"
  },
  "JDog's Spicy Ramen": {
    name: "JDog's Spicy Ramen",
    type: "Food",
    effect: {
      mixinEvent: "healed",
      healAmount: 20
    },
    description: "A rare drop that only occurs when jdogs defeat each other. Heals for ${this.effect.healAmount}."
  },
  "Swiftness Candy": {
    name: "Swiftness Candy",
    type: "Food",
    effect: {
      mixinEvent: "addBuffFromName",
      buffName: "haste_1"
    },
    description: "A candy that makes you act twice as fast."
  }
};

export function getItem(name){
  return deepCopy(Items[name]);
}

export let Functionalities = {
  "Item": {
    list: [
      {binding: "DROP", description: "Drop", mixinEvent: "tryDropItem"},
      {binding: "TRASH", description: "Trash", mixinEvent: "tryTrashItem"}
    ]
  },
  "Key Item": {
    parent: "Item"
  },
  "Consumable": {
    list: [
      {binding: "CONSUME", description: "Consume", mixinEvent: "tryConsume"}
    ],
    parent: "Item"
  },
  "Food": {
    list: [
      {binding: "CONSUME", description: "Eat", mixinEvent: "tryEat"}
    ],
    parent: "Consumable"
  },
  "Equipment": {
    list: [
      {binding: "EQUIP", description: "Equip", mixinEvent: "tryEquip"}
    ],
    parent: "Item"
  }
};

export function getFunctionality(itemType){
  let parentData = Array();
  let functionalityData = Functionalities[itemType];
  if(!functionalityData){
    return parentData;
  }
  if(functionalityData.parent){
    parentData = getFunctionality(functionalityData.parent);
  }
  let functionalityList = functionalityData.list;
  if(!functionalityList){
    return parentData;
  }
  let added = Array();
  for(let i = 0; i < functionalityList.length; i++){
    let functionality = functionalityList[i];
    let key = BINDINGS.INVENTORY[functionality.binding];
    let replaced = false;
    for(let j = 0; j < parentData.length; j++){
      let parentObj = parentData[j];
      if(parentObj.key == key){
        parentObj.description = functionality.description;
        parentObj.mixinEvent = functionality.mixinEvent;
        replaced = true;
        break;
      }
    }
    if(!replaced){
      added.push({
        'key': key,
        description: functionality.description,
        mixinEvent: functionality.mixinEvent
      });
    }
  }
  return added.concat(parentData);
}
