export let StatDisplayNames = {
  maxHp: 'Max HP',
  strength: 'Strength',
  agility: 'Agility',
  endurance: 'Endurance',
  charisma: 'Charisma',
  magic: 'Magic',
  knowledge: 'Knowledge'
}

export function getStatDisplayName(stat){
  let displayName = StatDisplayNames[stat];
  if(!displayName){
    return 'Unidentified stat:';
  }
  return displayName;
}

export let RaceDisplayNames = {
  human: 'Human'
}

//Every 5 levels you level up all stats in addition
export let RaceLevelUp = {
  human: {
    maxHp: 10, //plus level
    random: [
      {
        count: 4,
        inStats: ['strength', 'agility', 'endurance', 'charisma', 'magic', 'knowledge']
      }
    ]
  },
  elf: {
    maxHp: 8,
    fixed: ['magic'],
    random: [
      {
        inStats: ['strength', 'agility', 'endurance']
      },
      {
        inStats: ['charisma', 'knowledge']
      }
    ]
  },
  dwarf: {
    maxHp: 12,
    fixed: ['endurance', 'strength'],
    random: [
      {
        count: 1,
        inStats: ['charisma', 'knowledge']
      }
    ]
  }
}

export function getLevelUpInfo(race){
  if(!race){
    return RaceLevelUp.human;
  }
  let info = RaceLevelUp[race];
  if(!info){
    return RaceLevelUp.human;
  }
  return RaceLevelUp;
}
