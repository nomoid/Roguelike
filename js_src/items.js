import {deepCopy} from './util.js';
import {BINDINGS} from './keybindings.js';

export let Items = {
  "JDog's Ramen": {
    name: "JDog's Ramen",
    type: "Food",
    healAmount: 2,
    description: "A common drop item that jdogs like to eat in his free time. Heals for ${this.healAmount}."
  },
  "JDog's Calves": {
    name: "JDog's Calves",
    type: "Key Item",
    description: "He's got them"
  },
  "JDog's Spicy Ramen": {
    name: "JDog's Spicy Ramen",
    type: "Food",
    healAmount: 5,
    description: "A rare drop that only occurs when jdogs defeat each other. Heals for ${this.healAmount}."
  }
};

export function getItem(name){
  return deepCopy(Items[name]);
}

export let Functionalities = {
  "Item": {
    list: [
      {binding: "DROP", description: "Drop"},
      {binding: "TRASH", description: "Trash"}
    ]
  },
  "Key Item": {
    parent: "Item"
  },
  "Consumable": {
    list: [
      {binding: "CONSUME", description: "Consume"}
    ],
    parent: "Item"
  },
  "Food": {
    list: [
      {binding: "CONSUME", description: "Eat"}
    ],
    parent: "Consumable"
  },
  "Equipment": {
    list: [
      {binding: "EQUIP", description: "Equip"}
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
      if(parentData[j].key == key){
        parentData[j].description = functionality.description;
        replaced = true;
        break;
      }
    }
    if(!replaced){
      added.push({
        'key': key,
        description: functionality.description
      });
    }
  }
  return added.concat(parentData);
}
