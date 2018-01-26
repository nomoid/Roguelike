import {Factory} from './factory.js';
import {Entity} from './entity.js';
import {Color} from './color.js';

export let EntityFactory = new Factory(Entity,'ENTITIES');

EntityFactory.learn({
  name: 'avatar',
  chr: '@',
  fg: Color.AVATAR_FG,
  meleeDamage: 10,
  radius: 16,
  team: 'avatar',
  enemyTeams: ['baddies'],
  friendlyTeams: ['avatar'],
  race: 'human',
  stats: {
    maxHp: 10000,
    strength: 10,
    agility: 10,
    endurance: 10,
    charisma: 10,
    magic: 10,
    knowledge: 10
  },
  statNames: ['maxHp', 'strength', 'agility', 'endurance', 'charisma', 'magic', 'knowledge'],
  mixinNames: ['TimeTracker', 'WalkerCorporeal', 'PlayerMessage', 'HitPoints', 'TeamMember', 'ActorPlayer', 'MeleeAttacker', 'FOVHandler', 'ItemPile', 'Inventory', 'Equipment', 'Skills', 'SkillLearner', 'LevelProgress', 'CharacterStats', 'ItemConsumer', 'BuffHandler', 'Bloodthirst']
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
  stats: {
    maxHp: 40,
  },
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

EntityFactory.learn({
  name: 'chest',
  chr: '\u25a4',
  fg: Color.CHEST_FG,
  team: 'baddies',
  mixinNames: ['ItemPile', 'Chest', 'TeamMember']
});

EntityFactory.learn({
  name: 'open_chest',
  chr: '\u25a4',
  fg: Color.CHEST_OPENED_FG,
  team: 'baddies',
  mixinNames: ['TeamMember']
})
