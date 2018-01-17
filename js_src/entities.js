import {Factory} from './factory.js';
import {Entity} from './entity.js';
import {Color} from './color.js';

export let EntityFactory = new Factory(Entity,'ENTITIES');

EntityFactory.learn({
  name: 'avatar',
  chr: '@',
  fg: Color.AVATAR_FG,
  maxHp: 10,
  radius: 16,
  mixinNames: ['TimeTracker', 'WalkerCorporeal', 'PlayerMessage', 'HitPoints', 'FOVHandler']
});

EntityFactory.learn({
  name: 'chris',
  chr: 'C',
  fg: '#5d4'
})

EntityFactory.learn({
  name: 'jdog',
  chr: '$',
  fg: '#d06',
  maxHp: 4,
  mixinNames: ['HitPoints']
})
