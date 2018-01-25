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
  team: 'avatar',
  enemyTeams: ['baddies'],
  friendlyTeams: ['avatar'],
  meleeDamage: 10,
  mixinNames: ['TimeTracker', 'WalkerCorporeal', 'PlayerMessage', 'HitPoints', 'TeamMember', 'ActorPlayer', 'MeleeAttacker', 'FOVHandler', 'ItemPile', 'Inventory', 'Equipment', 'Skills', 'SkillLearner', 'ItemConsumer', 'BuffHandler', 'Bloodthirst']
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
  radius: 8,
  team: 'baddies',
  remember: true,
  enemyTeams: ['avatar'],
  friendlyTeams: ['baddies'],
  //targetName: 'avatar',
  maxHp: 40,
  meleeDamage: 10,
  priorities: {
    'NearsightedAttacker': 1,
    'SightedPathfinder': 2,
    'ActorRandomWalker': 3
  },
  mixinNames: ['HitPoints', 'AIActor', 'ActorRandomWalker', 'WalkerCorporeal', 'TeamMember', 'MeleeAttacker', 'ItemDropper', 'FOVHandler', 'NearsightedAttacker', 'SightedEnemyTargeter', 'SightedPathfinder']
});

EntityFactory.learn({
  name: 'item_pile',
  chr: 'o',
  fg: Color.ITEM_PILE_FG,
  mixinNames: ['ItemPile']
});
