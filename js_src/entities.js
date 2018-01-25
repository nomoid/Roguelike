import {Factory} from './factory.js';
import {Entity} from './entity.js';
import {Color} from './color.js';

export let EntityFactory = new Factory(Entity,'ENTITIES');

EntityFactory.learn({
  name: 'avatar',
  chr: '@',
  fg: Color.AVATAR_FG,
  maxHp: 10000,
  radius: 16,
  mixinNames: ['TimeTracker', 'WalkerCorporeal', 'PlayerMessage', 'HitPoints', 'ActorPlayer', 'MeleeAttacker', 'FOVHandler', 'ItemPile', 'Inventory']
});

EntityFactory.learn({
  name: 'chris',
  chr: 'C',
  fg: '#5d4'
});

EntityFactory.learn({
  name: 'jdog',
  chr: 'd',
  fg: '#d06',
  maxHp: 4,
  targetName: 'avatar',
  priorities: {
    'NearsightedAttacker': 1,
    'OmniscientPathfinder': 2
  },
  mixinNames: ['HitPoints', 'AIActor', 'ActorRandomWalker', 'WalkerCorporeal', 'MeleeAttacker', 'ItemDropper', 'NearsightedAttacker', 'OmniscientEnemyTargeter', 'OmniscientPathfinder']
});

EntityFactory.learn({
  name: 'item_pile',
  chr: 'o',
  fg: Color.ITEM_PILE_FG,
  mixinNames: ['ItemPile']
});
