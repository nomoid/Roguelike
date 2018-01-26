import {deepCopy} from './util.js';

export let Equipment = {
  //Helmets
  "helmet_leather": {
    name: "Leather Helmet",
    type: "Equipment",
    slot: "Head",
    equipmentData: {
      defense: 1
    },
    description: "Simple leather helmet. Provides ${this.equipmentData.defense} defense."
  },
  "armor_leather": {
    name: "Leather Armor",
    type: "Equipment",
    slot: "Armor",
    equipmentData: {
      defense: 2
    },
    description: "Simple leather armor. Provides ${this.equipmentData.defense} defense."
  },
  "pants_leather": {
    name: "Leather Pants",
    type: "Equipment",
    slot: "Pants",
    equipmentData: {
      defense: 1
    },
    description: "Simple leather pants. Provides ${this.equipmentData.defense} defense."
  },
  "boots_leather": {
    name: "Leather Boots",
    type: "Equipment",
    slot: "Boots",
    equipmentData: {
      defense: 1
    },
    description: "Simple leather boots. Provides ${this.equipmentData.defense} defense."
  },
  "gauntlets_leather": {
    name: "Leather Gauntlets",
    type: "Equipment",
    slot: "Gauntlets",
    equipmentData: {
      defense: 1
    },
    description: "Simple leather gauntlets. Provides ${this.equipmentData.defense} defense."
  },
  "helmet_steel": {
    name: "Steel Helmet",
    type: "Equipment",
    slot: "Head",
    equipmentData: {
      defense: 2
    },
    description: "Metal helmet designed for combat. Provides ${this.equipmentData.defense} defense."
  },
  "armor_steel": {
    name: "Steel Armor",
    type: "Equipment",
    slot: "Armor",
    equipmentData: {
      defense: 3
    },
    description: "Steel armor made to withstand attacks. Provides ${this.equipmentData.defense} defense."
  },
  "pants_steel": {
    name: "Steel Pants",
    type: "Equipment",
    slot: "Pants",
    equipmentData: {
      defense: 3
    },
    description: "Leg armor made from high quality metals. Provides ${this.equipmentData.defense} defense."
  },
  "boots_steel": {
    name: "Steel Boots",
    type: "Equipment",
    slot: "Boots",
    equipmentData: {
      defense: 2
    },
    description: "Boots made from reinforced steel. Provides ${this.equipmentData.defense} defense."
  },
  "gauntlets_steel": {
    name: "Steel Gauntlets",
    type: "Equipment",
    slot: "Gauntlets",
    equipmentData: {
      defense: 2
    },
    description: "Gauntlets made from reinforced steel. Provides ${this.equipmentData.defense} defense."
  },
  "helmet_legendary": {
    name: "Legendary Helmet",
    type: "Equipment",
    slot: "Head",
    equipmentData: {
      defense: 5
    },
    description: "A helmet that only exist in legends. Provides ${this.equipmentData.defense} defense."
  },
  "armor_legendary": {
    name: "Legendary Armor",
    type: "Equipment",
    slot: "Armor",
    equipmentData: {
      defense: 5
    },
    description: "Armor that only exist in legends. Provides ${this.equipmentData.defense} defense."
  },
  "pants_legendary": {
    name: "Legendary Pants",
    type: "Equipment",
    slot: "Pants",
    equipmentData: {
      defense: 5
    },
    description: "Leg armor that only exists in legends. Provides ${this.equipmentData.defense} defense."
  },
  "boots_legendary": {
    name: "Legendary Boots",
    type: "Equipment",
    slot: "Boots",
    equipmentData: {
      defense: 5
    },
    description: "Boots that only exist in legends. Provides ${this.equipmentData.defense} defense."
  },
  "gauntlets_legendary": {
    name: "Legendary Gauntlets",
    type: "Equipment",
    slot: "Gauntlets",
    equipmentData: {
      defense: 5
    },
    description: "Gauntlets that only exist in legends. Provides ${this.equipmentData.defense} defense."
  },
  "cursed_boots": {
    name: "Cursed Boots",
    type: "Equipment",
    slot: "Boots",
    equipmentData: {
      defense: 3,
      cursed: true
    },
    description: "Cursed boots that can't be removed! Provides ${this.equipmentData.defense} defense."
  },
  "shortsword": {
    name: "Shortsword",
    type: "Equipment",
    slot: "One-Handed",
    equipmentData: {
      skill: 'Swordfighting',
      hit: {
        numDice: 3,
        diceVal: 6,
        modifier: 0,
        pick: 2
      },
      damage: {
        base: 5,
        numDice: 2,
        diceVal: 10
      },
      partition: [6, 8, 12]
    },
    description: "A short sword. Deals ${this.equipmentData.damage.base} to ${this.equipmentData.damage.base+this.equipmentData.damage.numDice*this.equipmentData.damage.diceVal} damage."
  },
  "longsword": {
    name: "Longsword",
    type: "Equipment",
    slot: "Primary Hand",
    equipmentData: {
      skill: 'Swordfighting',
      hit: {
        numDice: 3,
        diceVal: 8,
        modifier: 0,
        pick: 2
      },
      damage: {
        base: 7,
        numDice: 2,
        diceVal: 12
      },
      partition: [8, 12, 16]
    },
    description: "A long sword. Cannot be equipped to the secondary hand. Deals ${this.equipmentData.damage.base} to ${this.equipmentData.damage.base+this.equipmentData.damage.numDice*this.equipmentData.damage.diceVal} damage."
  },
  "handaxe": {
    name: "Handaxe",
    type: "Equipment",
    slot: "Primary Hand",
    equipmentData: {
      skill: 'Axe Fighting',
      hit: {
        numDice: 3,
        diceVal: 4,
        modifier: 0,
        pick: 3
      },
      damage: {
        base: 2,
        numDice: 4,
        diceVal: 6
      },
      partition: [6, 8, 14]
    },
    description: "A lightweight handaxe ideal for axe training. Deals ${this.equipmentData.damage.base} to ${this.equipmentData.damage.base+this.equipmentData.damage.numDice*this.equipmentData.damage.diceVal} damage."
  },
  "axe": {
    name: "Axe",
    type: "Equipment",
    slot: "Two-Handed",
    equipmentData: {
      skill: 'Axe Fighting',
      hit: {
        numDice: 3,
        diceVal: 6,
        modifier: 0,
        pick: 3
      },
      damage: {
        base: 4,
        numDice: 6,
        diceVal: 6
      },
      partition: [8, 12, 18]
    },
    description: "A two-handed heavy axe that may be difficult to use. Deals ${this.equipmentData.damage.base} to ${this.equipmentData.damage.base+this.equipmentData.damage.numDice*this.equipmentData.damage.diceVal} damage."
  },
  "battle_axe": {
    name: "Battle Axe",
    type: "Equipment",
    slot: "Two-Handed",
    equipmentData: {
      skill: 'Axe Fighting',
      hit: {
        numDice: 3,
        diceVal: 8,
        modifier: 0,
        pick: 3
      },
      damage: {
        base: 6,
        numDice: 8,
        diceVal: 6
      },
      partition: [12, 16, 24]
    },
    description: "A very difficult to handle two-handed heavy axe weapon. Deals ${this.equipmentData.damage.base} to ${this.equipmentData.damage.base+this.equipmentData.damage.numDice*this.equipmentData.damage.diceVal} damage."
  },
  "wooden_shield": {
    name: "Wooden Shield",
    type: "Equipment",
    slot: "Secondary Hand",
    equipmentData: {
      defense: 1
    },
    description: "Simple wooden shield. Provides ${this.equipmentData.defense} defense."
  },
  "iron_shield": {
    name: "Iron Shield",
    type: "Equipment",
    slot: "Secondary Hand",
    equipmentData: {
      defense: 3
    },
    description: "Simple iron shield. Provides ${this.equipmentData.defense} defense."
  },
  "legendary_shield": {
    name: "Wooden Shield",
    type: "Equipment",
    slot: "Secondary Hand",
    equipmentData: {
      defense: 5
    },
    description: "A shield that only exists in legends. Provides ${this.equipmentData.defense} defense."
  },
  "dagger": {
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
        base: 3,
        numDice: 2,
        diceVal: 8
      },
      partition: [4, 6, 8]
    },
    description: "A dagger ready for combat. Deals ${this.equipmentData.damage.base} to ${this.equipmentData.damage.base+this.equipmentData.damage.numDice*this.equipmentData.damage.diceVal} damage."
  },
  "legendary_sword": {
    name: "Legendary Sword",
    type: "Equipment",
    slot: "Primary Hand",
    equipmentData: {
      skill: 'Swordfighting',
      hit: {
        numDice: 3,
        diceVal: 8,
        modifier: 0,
        pick: 2
      },
      damage: {
        base: 10,
        numDice: 2,
        diceVal: 25
      },
      partition: [8, 12, 16]
    },
    description: "A special sword forged by the strongest metals. Deals ${this.equipmentData.damage.base} to ${this.equipmentData.damage.base+this.equipmentData.damage.numDice*this.equipmentData.damage.diceVal} damage."
  },
  "legendary_dagger": {
    name: "Legendary Dagger",
    type: "Equipment",
    slot: "Primary Hand",
    equipmentData: {
      skill: 'Dagger Fighting',
      hit: {
        numDice: 3,
        diceVal: 4,
        modifier: 0,
        pick: 2
      },
      damage: {
        base: 10,
        numDice: 2,
        diceVal: 8
      },
      partition: [0, 0, 8]
    },
    description: "A special dagger with mysterious properties. Deals ${this.equipmentData.damage.base} to ${this.equipmentData.damage.base+this.equipmentData.damage.numDice*this.equipmentData.damage.diceVal} damage."
  },
  "legendary_axe": {
    name: "Legendary Axe",
    type: "Equipment",
    slot: "Two-Handed",
    equipmentData: {
      skill: 'Axe Fighting',
      hit: {
        numDice: 3,
        diceVal: 8,
        modifier: 0,
        pick: 3
      },
      damage: {
        base: 10,
        numDice: 8,
        diceVal: 6
      },
      partition: [0, 16, 24]
    },
    description: "A special axe that provides an aura of protection around its user. Deals ${this.equipmentData.damage.base} to ${this.equipmentData.damage.base+this.equipmentData.damage.numDice*this.equipmentData.damage.diceVal} damage."
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
