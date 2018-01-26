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
  race: 'human',
  team: 'avatar',
  enemyTeams: ['baddies'],
  friendlyTeams: ['avatar'],
  race: 'human',
  stats: {
    maxHp: 100,
    strength: 10,
    agility: 10,
    endurance: 10,
    charisma: 10,
    magic: 10,
    knowledge: 10
  },
  statNames: ['maxHp', 'strength', 'agility', 'endurance', 'charisma', 'magic', 'knowledge'],
  mixinNames: ['TimeTracker', 'WalkerCorporeal', 'Combat', 'PlayerMessage', 'TeamMember', 'HitPoints', 'ActorPlayer', 'MeleeAttacker', 'FOVHandler', 'ItemPile', 'Inventory', 'Equipment', 'Skills', 'SkillLearner', 'LevelProgress', 'CharacterStats', 'ItemConsumer', 'BuffHandler']
});

EntityFactory.learn({
  name: 'Thomas',
  chr: 'T',
  fg: '#5d4',
  radius: 16,
  team: 'baddies',
  remember: true,
  enemyTeams: ['avatar'],
  friendlyTeams: ['baddies'],
  dropItem: 'Applesauce',
  delay: 2000,
  stats: {
    maxHp: 40,
    strength: 12,
    endurance: 6
  },
  priorities: {
    'NearsightedAttacker': 1,
    'SightedPathfinder': 2
  },
  mixinNames: ['HitPoints', 'AIActor', 'LackOfSkills', 'Combat', 'WalkerCorporeal', 'TeamMember', 'MeleeAttacker', 'ItemDropper', 'FOVHandler', 'NearsightedAttacker', 'SightedEnemyTargeter', 'SightedPathfinder']
});

EntityFactory.learn({
  name: 'minotaur',
  chr: 'M',
  fg: '#40a',
  radius: 4,
  team: 'baddies',
  remember: false,
  enemyTeams: ['avatar'],
  friendlyTeams: ['baddies'],
  dropItem: 'Minotaur Horn',
  delay: 2000,
  stats: {
    maxHp: 100,
    strength: 12,
    endurance: 10
  },
  priorities: {
    'NearsightedAttacker': 1,
    'SightedPathfinder': 2,
  },
  mixinNames: ['HitPoints', 'AIActor', 'LackOfSkills', 'Combat', 'WalkerCorporeal', 'TeamMember', 'MeleeAttacker', 'ItemDropper', 'FOVHandler', 'NearsightedAttacker', 'SightedEnemyTargeter', 'SightedPathfinder']
})

EntityFactory.learn({
  name: 'bat',
  chr: 'b',
  fg: '#ccb',
  team: 'baddies',
  enemyTeams: ['avatar'],
  friendlyTeams: ['baddies'],
  dropItem: "Guano",
  delay: 500,
  stats: {
    maxHp: 10,
    strength: 3,
    endurance: 2
  },
  priorities: {
    'ActorRandomWalker': 1
  },
  mixinNames: ['HitPoints', 'AIActor', 'ActorRandomWalker', 'LackOfSkills', 'Combat', 'WalkerCorporeal', 'TeamMember', 'MeleeAttacker', 'ItemDropper']

})

EntityFactory.learn({
  name: 'hound',
  chr: 'd',
  fg: '#d06',
  radius: 8,
  dropItem: 'Dog Food',
  team: 'baddies',
  remember: true,
  enemyTeams: ['avatar'],
  friendlyTeams: ['baddies'],
  //targetName: 'avatar',
  stats: {
    maxHp: 40,
    strength: 5,
    endurance: 5
  },
  meleeDamage: 10,
  priorities: {
    'NearsightedAttacker': 1,
    'SightedPathfinder': 2,
    'ActorRandomWalker': 3
  },
  mixinNames: ['HitPoints', 'AIActor', 'ActorRandomWalker', 'LackOfSkills', 'Combat', 'WalkerCorporeal', 'TeamMember', 'MeleeAttacker', 'ItemDropper', 'FOVHandler', 'NearsightedAttacker', 'SightedEnemyTargeter', 'SightedPathfinder']
});

EntityFactory.learn({
  name: 'zombie',
  chr: 'z',
  fg: '#d77',
  radius: 16,
  dropItem: 'Zombie Flesh',
  team: 'baddies',
  remember: true,
  enemyTeams: ['avatar'],
  friendlyTeams: ['baddies'],
  delay: 2000,
  //targetName: 'avatar',
  stats: {
    maxHp: 100,
    strength: 5,
    endurance: 5
  },
  meleeDamage: 10,
  priorities: {
    'NearsightedAttacker': 1,
    'SightedPathfinder': 2,
    'ActorRandomWalker': 3
  },
  mixinNames: ['HitPoints', 'AIActor', 'ActorRandomWalker', 'LackOfSkills', 'Combat', 'WalkerCorporeal', 'TeamMember', 'MeleeAttacker', 'ItemDropper', 'FOVHandler', 'NearsightedAttacker', 'SightedEnemyTargeter', 'SightedPathfinder']
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
