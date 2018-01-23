import {deepCopy} from './util.js';

export let Buffs = {
  "hp_regen_1": {
    name: 'HP Regeneration',
    duration: 20,
    frequency: 4,
    effect: {
      hpAmount: 1
    }
  },
  "lifelink_1": {
    name: 'Lifelink',
    duration: 50,
    effect: {
      hpAmount: 5
    }
  }
}

export function getBuff(name){
  return deepCopy(Buffs[name]);
}
