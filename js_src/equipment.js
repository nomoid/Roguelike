import {deepCopy} from './util.js';

export let Equipment = {
  "boots_1": {
    name: "Leather Boots",
    type: "Equipment",
    slot: "Boots",
    equipmentData: {
      defense: 2
    },
    description: "Simple leather boots. Provides ${this.equipmentData.defense} defense."
  },
  "boots_2": {
    name: "Iron Boots",
    type: "Equipment",
    slot: "Boots",
    equipmentData: {
      defense: 4
    },
    description: "Simple iron boots. Provides ${this.equipmentData.defense} defense."
  },
  "cursed_boots_1": {
    name: "Cursed Boots",
    type: "Equipment",
    slot: "Boots",
    equipmentData: {
      defense: 3,
      cursed: true
    },
    description: "Cursed boots that can't be removed! Provides ${this.equipmentData.defense} defense."
  }
}

export let EquipmentSlots = {
  head: "Head",
  armor: "Armor",
  pants: "Pants",
  boots: "Boots",
  gauntlets: "Gauntlets",
  amulet: "Amulet",
  ring1: "Ring",
  ring2: "Ring",
  leftHand: "Left Hand",
  rightHand: "Right Hand"
}

export let EquipmentOrder = [
  'head', 'armor', 'pants', 'boots', 'gauntlets', 'amulet', 'ring1', 'ring2', 'leftHand', 'rightHand'
]

export function generateEquipment(name){
  return deepCopy(Equipment[name]);
}
