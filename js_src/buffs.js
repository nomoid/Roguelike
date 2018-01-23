import {deepCopy} from './util.js';

export let Buffs = {
  "hp_regen_1": {
    name: 'HP Regeneration',
    duration: 20,
    frequency: 4,
    description: 'Regenerates ${this.effect.hpAmount} HP every ${this.frequency} turns.',
    effect: {
      hpAmount: 1
    }
  },
  "lifelink_1": {
    name: 'Lifelink',
    duration: 50,
    description: 'Regenerates ${this.effect.hpAmount} HP every time you kill an enemy.',
    effect: {
      hpAmount: 5
    }
  }
}

export function getBuff(name){
  return deepCopy(Buffs[name]);
}
