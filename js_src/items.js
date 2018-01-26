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
  },
  "Applesauce": {
    name: "Applesauce",
    type: "Food",
    description: "A very tasty snack, often hoarded by Thomas. Heals for ${this.effect.healAmount} and regenerates lots of health for a long time.",
    effects:[
      {
        mixinEvent: "healed",
        healAmount: 30
      },
      {
        mixinEvent: "addBuffFromName",
        buffName: "hp_regen_2",
      }
    ]
  },
  "Dog Food": {
    name: "Dog Food",
    type: "Food",
    description: "A nasty pile of food that only the hounds could enjoy. Heals for ${this.effect.healAmount}.",
    effect: {
      mixinEvent: "healed",
      healAmount: 8
    }
  },
  "Apple": {
    name: "Apple",
    type: "Food",
    description: "A hearty snack. Heals for ${this.effect.healAmount}.",
    effect: {
      mixinEvent: "healed",
      healAmount: 16
    }
  },
  "Bread": {
    name: "Bread",
    type: "Food",
    description: "A hearty snack. Heals for ${this.effect.healAmount}.",
    effect: {
      mixinEvent: "healed",
      healAmount: 20
    }
  },

  "Minotaur Horn": {
    name: "Minotaur Horn",
    type: "Key Item",
    description: "A bloody horn cut from the Minotaur's head."
  },
  "Guano": {
    name: "Guano",
    type: "Food",
    description: "Absolutely disgusting but nutrient rich. Increases speed when eaten.",
    effect: {
      mixinEvent: "addBuffFromName",
      buffName: "haste_1"
    }
  },
  "Zombie Flesh": {
    name: "Zombie Flesh",
    type: "Food",
    description: "The rotting flesh of a zombie. Heals the user but causes food poisioning.",
    effects: [
        {
          mixinEvent: "healed",
          healAmount: 10
        },
        {
          mixinEvent: "addBuffFromName",
          buffName: "poisioning_1"
        }
    ]
  },
  "Holy Water of J": {
    name: "Holy Water of J",
    type: "Food",
    description: "An extremely rare and sought after relic. It is unknown what consuming this item would do...",
    effects: [
      {
        mixinEvent: "switchMode",
        type: "switch",
        mode: "win"
      }
    ]
  }


};

export function generateItem(name){
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
