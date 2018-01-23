import {deepCopy} from './util.js';

export let Items = {
  "JDog's Ramen": {
    name: "JDog's Ramen",
    type: "Food",
    healAmount: 2,
    description: "A common drop item that jdogs like to eat in his free time"
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
    decription: "A rare drop that only occurs when jdogs defeat each other"
  }
}

export function getItem(name){
  return deepCopy(Items[name]);
}
