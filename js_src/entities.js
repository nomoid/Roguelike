import {Factory} from './factory.js';
import {Entity} from './entity.js';
import {Color} from './color.js';

export let EntityFactory = new Factory(Entity,'ENTITIES');

EntityFactory.learn({
  name: 'avatar',
  chr: '@',
  fg: Color.AVATAR_FG,
  mixinNames: ['TimeTracker', 'WalkerCorporeal']
});

EntityFactory.learn({
  name: 'chris',
  chr: 'C',
  fg: '#5d4'
})

EntityFactory.learn({
  name: 'jdog',
  chr: '$',
  fg: '#d06'
})
