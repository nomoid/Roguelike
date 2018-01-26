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
  },
  "shortsword_1": {
    name: "Shortsword",
    type: "Equipment",
    slot: "One-Handed",
    equipmentData: {
      attack: 4
    },
    description: "A short sword. Deals ${this.equipmentData.attack} damage."
  },
  "longsword_1": {
    name: "Longsword",
    type: "Equipment",
    slot: "Primary Hand",
    equipmentData: {
      attack: 6
    },
    description: "A long sword. Cannot be equipped to the secondary hand. Deals ${this.equipmentData.attack} damage."
  },
  "battle_axe_1": {
    name: "Battle Axe",
    type: "Equipment",
    slot: "Two-Handed",
    equipmentData: {
      attack: 8
    },
    description: "A heavy battle axe. Deals ${this.equipmentData.attack} damage."
  },
  "wooden_shield_1": {
    name: "Wooden Shield",
    type: "Equipment",
    slot: "Secondary Hand",
    equipmentData: {
      defense: 2
    },
    description: "Simple wooden shield. Provides ${this.equipmentData.defense} defense."
  },
  "dagger_1": {
    name: "Dagger",
    type: "Equipment",
    slot: "One-Handed",
    equipmentData: {
      skill: 'Dagger Fighting',
      hit: {
        numDice: 3,
        diceVal: 4,
        modifier: 0,
        pick: 2
      },
      damage: {
        base: 4,
        numDice: 2,
        diceVal: 8
      },
      partition: [4, 6, 8]
    },
    description: "A dagger. Deals ${this.equipmentData.attack} damage."
  },
  "legendary_sword_1": {
    name: "Legendary Sword",
    type: "Equipment",
    slot: "Primary Hand",
    equipmentData: {
      attack: 20
    },
    description: "A special sword forged by the strongest metals. Deals ${this.equipmentData.attack} damage."
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
  primaryHand: "Primary Hand",
  secondaryHand: "Secondary Hand"
}

export let EquipmentOrder = [
  'head', 'armor', 'pants', 'boots', 'gauntlets', 'amulet', 'ring1', 'ring2', 'primaryHand', 'secondaryHand'
]

export function generateEquipment(name){
  return deepCopy(Equipment[name]);
}

export function getHit(weapon){
  return deepCopy(weapon.equipmentData.hit);
}

export function getDamage(weapon){
  return deepCopy(weapon.equipmentData.damage);
}
