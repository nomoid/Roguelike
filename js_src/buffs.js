import {deepCopy} from './util.js';

export let Buffs = {
  "hp_regen_1": {
    name: 'HP Regeneration',
    duration: 20,
    frequency: 4,
    description: 'Regenerates ${this.effect.healAmount} HP every ${this.frequency} turns.',
    effect: {
      mixinEvent: "healed",
      healAmount: 1
    }
  },
  "hp_regen_2": {
    name: 'Strong HP Regeneration',
    duration: 100,
    frequency: 10,
    description: 'Regenerates ${this.effect.healAmount} HP every ${this.frequency} turns.',
    effect: {
      mixinEvent: "healed",
      healAmount: 8
    }
  },

  "lifelink_1": {
    name: 'Lifelink',
    duration: 50,
    description: 'Regenerates ${this.effect.healAmount} HP every time you kill an enemy.',
    //No mixin event because it is checked by the mixin on kill
    effect: {
      healAmount: 5
    }
  },
  "haste_1": {
    name: 'Haste',
    duration: 10,
    description: 'Multiplies action duration by ${this.effect.durationMultiplier}.',
    effect: {
      durationMultiplier: 0.5
    }
  }
}

export function generateBuff(name){
  return deepCopy(Buffs[name]);
}
