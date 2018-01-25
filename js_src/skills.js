//Divide game experience by this number when rendering
export let ExperienceMultiplier = 100;

export function renderXp(xp, ceil){
  if(ceil){
    return Math.trunc((xp + ExperienceMultiplier - 1) / ExperienceMultiplier);
  }
  else{
    return Math.trunc(xp / ExperienceMultiplier);
  }
}

export let Skills = {
  'Athletics': {
    name: 'Athletics',
    difficulty: 1,
    description: 'How atheletic you are. Increases your Strength/Speed stats on level up.'
  },
  'Archery': {
    name: 'Archery',
    difficulty: 3,
    prerequisite: 'Athletics',
    description: 'How well you can use your bow. Increases your chance to hit and your ability use better bows.'
  },
  'Dagger Fighting': {
    name: 'Dagger Fighting',
    difficulty: 2,
    prerequisite: 'Athletics',
    description: 'How well you can use your dagger. Increases your chance to hit and your ability use better daggers.'
  },
  'Swordfighting': {
    name: 'Swordfighting',
    difficulty: 3,
    prerequisite: 'Dagger Fighting',
    description: 'How well you can use your sword. Increases your chance to hit and your ability use better swords.'
  }
};

export let PlayerSkills = [
    'Athletics', 'Archery', 'Dagger Fighting', 'Swordfighting'
];

export let PlayerSeenSkills = [
    'Athletics', 'Dagger Fighting'
];

let DifficultyXpTable = {
  'd1': [10000, 20000, 30000, 40000, 50000],
  'd2': [20000, 40000, 80000, 140000, 220000],
  'd3': [30000, 60000, 120000, 240000, 480000]
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

export function getSkillDescription(skill){
  return Skills[skill].description;
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
