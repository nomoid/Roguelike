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
