//Divide game experience by this number when rendering
export let ExperienceMultiplier = 100;
//When you accumulate this many parts, convert it to a single skill point
//Base conversion rate: 1 excess xp after max level = 1 skill point part
export let PartsMultiplier = 1000;

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
    xpGain: {
      walkSuccess: {
        amount: 10
      }
    },
    description: 'How atheletic you are. Increases your Strength/Speed stats on level up.'
  },
  'Archery': {
    name: 'Archery',
    difficulty: 3,
    prerequisite: 'Swordfighting',
    description: 'How well you can use your bow. Increases your chance to hit and your ability use better bows.'
  },
  'Dagger Fighting': {
    name: 'Dagger Fighting',
    difficulty: 2,
    prerequisite: 'Athletics',
    modifyHit: function(hitData, level){
      hitData.numDice += level;
    },
    xpGain: {
      damages: {
        amount: 100,
        requirements: {
          weapon: {
            name: 'Dagger'
          }
        }
      },
      kills: {
        amount: 500,
        requirements: {
          weapon: {
            name: 'Dagger'
          }
        }
      }
    },
    description: 'How well you can use your dagger. Increases your chance to hit and your ability use better daggers.'
  },
  'Swordfighting': {
    name: 'Swordfighting',
    difficulty: 3,
    prerequisite: 'Dagger Fighting',
    xpGain: {
      damages: {
        amount: 100,
        //Or among array
        requirements: [
          {
            weapon: {
              name: 'Shortsword'
            }
          },
          {
            weapon: {
              name: 'Longsword'
            }
          },
        ]
      },
      kills: {
        amount: 500,
        //Or among array
        requirements: [
          {
            weapon: {
              name: 'Shortsword'
            }
          },
          {
            weapon: {
              name: 'Longsword'
            }
          },
        ]
      }
    },
    description: 'How well you can use your sword. Increases your chance to hit and your ability use better swords.'
  },
  'Blocking': {
    name: 'Blocking',
    difficulty: 2,
    prerequisite: 'Athletics',
    modifyBlock: function(blockData, level){
      blockData.modifier += level;
    },
    xpGain: {

    },
    description: 'How well you use shields. Increases your chance to block some damage taken from enemies.',
  },
  'Dodging': {
    name: 'Dodging',
    difficulty: 2,
    prerequisite: 'Athletics',
    modifyDodge: function(dodgeData, level, defending, speedDiff){
      if(defending){
        dodgeData.modifier = speedDiff * (1+0.2*level);
      }
      dodgeData.diceVal += 3*level;
    },
    xpGain: {

    },
    description: 'How well you dodge enemy attacks.',
  }
};

export let PlayerSkills = [
  'Athletics', 'Archery', 'Dagger Fighting', 'Swordfighting', 'Blocking', 'Dodging'
];

export let PlayerSeenSkills = [
  'Athletics', 'Dagger Fighting', 'Swordfighting'
];

export let PlayerStartSkills = [
  'Athletics'
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

export function getXpGain(skill){
  return Skills[skill].xpGain;
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

export function getMaxLevel(skill){
  let difficulty = Skills[skill].difficulty;
  let difficultyArray = DifficultyXpTable[`d${difficulty}`];
  return difficultyArray.length;
}

export function hasPrereqs(name, skills){
  let skillData = Skills[name];
  if(skillData.prerequisites){
    let prereqs = skillData.prerequisites;
    for(let i = 0; i < prereqs.length; i++){
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

export function prereqString(name){
  let skillData = Skills[name];
  if(skillData.prerequisites){
    let prereqs = skillData.prerequisites;
    let prereqStr = '';
    for(let i = 0; i < prereqs.length; i++){
      if(i != 0){
        prereqStr += ', ';
      }
      prereqStr += prereqs[i];
    }
    return `Prerequisites: ${prereqStr}`;
  }
  else if(skillData.prerequisite){
    return `Prerequisite: ${skillData.prerequisite}`;
  }
  else{
    return 'Prerequisites: None';
  }
}

//Require 50 more xp per level up
//0, 50, 150, 300, 500, 750, 1050, 1400
export function getCharacterLevelFromXp(xp){
  xp = Math.trunc(xp / ExperienceMultiplier);
  //Inverse triangle formula
  let multiplier = 50;
  return Math.trunc((Math.sqrt(8*Math.trunc(xp/multiplier)+1)-1)/2) + 1;
}

export function getXpForCharacterLevel(level){
  //Triangle formula
  let multiplier = 50;
  return Math.trunc(((level-1)*multiplier)*((level-1)*multiplier+1)/2) * ExperienceMultiplier;
}
