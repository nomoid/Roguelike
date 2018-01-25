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

export let PlayerSeenSkills = [
    'Athletics', 'Dagger Fighting'
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

export function hasPrereqs(name, skills){
  let skillData = Skills[name];
  if(skillData.prerequisites){
    let prereqs = skillData.prerequisites;
    for(let i = 0; i < arr.length; i++){
      let prereq = prereqs[i];
      if(!hasSinglePrerequisite(prereq, skills)){
        return false;
      }
    }
    return true;
  }
  else if(skillData.prerequisite){
    return hasSinglePrerequisite(skillData.prerequisite, skills);
  }
  else{
    return true;
  }
}

function hasSinglePrerequisite(prereq, skills){
  let skill = skills[prereq];
  if(skill){
    if(getLevelForSkill(prereq, skill.xp) > 0){
      return true;
    }
  }
  return false;
}
