export let Skills = {
    'Athletics': {
      name: 'Athletics',
      difficulty: 1,
    },
    'Archery': {
      name: 'Archery',
      difficulty: 3,
      prerequisite: 'Athletics'
    },
    'Dagger Fighting': {
      name: 'Dagger Fighting',
      difficulty: 2,
      prerequisite: 'Athletics'
    },
    'Swordfighting': {
      name: 'Swordfighting',
      difficulty: 3,
      prerequisite: 'Dagger Fighting'
    }
};

export let PlayerSkills = [
    'Athletics', 'Archery', 'Dagger Fighting', 'Swordfighting'
];

let DifficultyXpTable = {
  'd1': [100, 200, 300, 400, 500],
  'd2': [200, 400, 800, 1400, 2200],
  'd3': [300, 600, 1200, 2400, 4800]
}

export function getLevelForSkill(skill, xp){
  let difficulty = Skills[skill].difficulty;
  let difficultyArray = DifficultyXpTable[`d${difficulty}`];
  if(!difficultyArray){
    return 0;
  }
  for(let i = 0; i < difficultyArray.length; i++){
    if(xp < difficultyArray[i]){
      return i;
    }
  }
  return difficultyArray.length;
}

export function getXpForSkillLevel(skill, level){
  let difficulty = Skills[skill].difficulty;
  let difficultyArray = DifficultyXpTable[`d${difficulty}`];
  if(!difficultyArray){
    return -1;
  }
  if(level == 0){
    return 0;
  }
  else if(level <= difficultyArray.length){
    return difficultyArray[level - 1];
  }
  else{
    return -1;
  }
}
