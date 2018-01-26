import * as U from './util.js';
import {Color} from './color.js';

export let BINDINGS = {
  //Master bindings cannot be reassinged EXCEPT in play mode
  MASTER: {
    EXIT_MENU: "Escape",
    MENU_UP: "ArrowUp",
    MENU_LEFT: "ArrowLeft",
    MENU_DOWN: "ArrowDown",
    MENU_RIGHT: "ArrowRight",
    SELECT: "Enter"
    //Also disallow rebinding of number keys
  },
  INVENTORY: {},
  GAME: {},
  PERSISTENCE: {
    NEW_GAME: "n",
    SAVE: "s",
    ENTER_LOAD: "l",
    ENTER_DELETE: "d",
    DELETE_ALL: "D",
  },
  BINDING: {
    REVERT_WASD: "W",
    REVERT_ARROW: "A",
    REVERT_INVENTORY: "R"
  }
};

export let BINDING_DESCRIPTIONS = {
  MASTER: {
    EXIT_MENU: "Exit menu",
    MENU_UP: "Go up",
    MENU_LEFT: "Go left",
    MENU_DOWN: "Go down",
    MENU_RIGHT: "Go right",
    SELECT: "Select"
  },
  INVENTORY: {
    DROP: "Drop an item",
    EQUIP: "Equip an item",
    UNEQUIP: "Unequip an item",
    CONSUME: "Consume an item",
    UPGRADE: "Level up a skill",
    TRASH: "Trash an item permanently",
    ENTER_BINDINGS: "Show/switch key bindings"
  },
  GAME: {
    MOVE_NORTH: "Move north",
    MOVE_WEST: "Move west",
    MOVE_SOUTH: "Move south",
    MOVE_EAST: "Move east",
    MOVE_IN_PLACE: "Stay in place",
    PICK_UP_ITEM: "Pick up an item",
    PICK_UP_ALL_ITEMS: "Pick up all items in pile",
    ENTER_INVENTORY: "Inventory",
    ENTER_EQUIPMENT: "Equipment",
    ENTER_SKILLS: "Skills",
    ENTER_STATS: "Character stats",
    ENTER_PERSISTENCE: "Save/load/new game",
    ENTER_MESSAGES: "Show all messages",
    ENTER_BINDINGS: "Show/switch key bindings",
    NEXT_FLOOR: "Next floor",
    PREV_FLOOR: "Previous floor",
    WIN: "Win the game",
    LOSE: "Lose the game"
  },
};

export let BINDING_DESCRIPTIONS_SHORT = {
  MASTER: {
    EXIT_MENU: "Exit",
    MENU_UP: "Up",
    MENU_LEFT: "Left",
    MENU_DOWN: "Down",
    MENU_RIGHT: "Right",
    SELECT: "Select"
  },
  INVENTORY: {
    DROP: "Drop",
    EQUIP: "Equip",
    UNEQUIP: "Unequip",
    CONSUME: "Consume",
    UPGRADE: "Level up",
    TRASH: "Trash",
    ENTER_BINDINGS: "Bindings"
  },
  GAME: {
    MOVE_NORTH: "North",
    MOVE_WEST: "West",
    MOVE_SOUTH: "South",
    MOVE_EAST: "East",
    MOVE_IN_PLACE: "Stay",
    PICK_UP_ITEM: "Pick up",
    PICK_UP_ALL_ITEMS: "Pick up all",
    ENTER_INVENTORY: "Inventory",
    ENTER_EQUIPMENT: "Equipment",
    ENTER_SKILLS: "Skills",
    ENTER_STATS: "Stats",
    ENTER_PERSISTENCE: "Save/load",
    ENTER_MESSAGES: "Messages",
    ENTER_BINDINGS: "Bindings",
    NEXT_FLOOR: "Next floor",
    PREV_FLOOR: "Prev floor",
    WIN: "Win",
    LOSE: "Lose"
  },
};

setKeybindingsArrowKeys();
setInventoryBindings();

export function setKeybindingsWASD(){
  BINDINGS.GAME = {
    MOVE_NORTH: "w",
    MOVE_WEST: "a",
    MOVE_SOUTH: "s",
    MOVE_EAST: "d",
    MOVE_IN_PLACE: " ",
    PICK_UP_ITEM: "q",
    PICK_UP_ALL_ITEMS: "Q",
    ENTER_INVENTORY: "I",
    ENTER_EQUIPMENT: "E",
    ENTER_SKILLS: "S",
    ENTER_STATS: "C",
    ENTER_PERSISTENCE: "P",
    ENTER_MESSAGES: "M",
    ENTER_BINDINGS: "?",
    NEXT_FLOOR: ">",
    PREV_FLOOR: "<",
    WIN: "ArrowUp",
    LOSE: "ArrowDown"
  }
}

export function setKeybindingsArrowKeys(){
  BINDINGS.GAME = {
    MOVE_NORTH: "ArrowUp",
    MOVE_WEST: "ArrowLeft",
    MOVE_SOUTH: "ArrowDown",
    MOVE_EAST: "ArrowRight",
    MOVE_IN_PLACE: " ",
    PICK_UP_ITEM: "q",
    PICK_UP_ALL_ITEMS: "Q",
    ENTER_INVENTORY: "I",
    ENTER_EQUIPMENT: "E",
    ENTER_SKILLS: "S",
    ENTER_STATS: "C",
    ENTER_PERSISTENCE: "P",
    ENTER_MESSAGES: "M",
    ENTER_BINDINGS: "?",
    NEXT_FLOOR: ">",
    PREV_FLOOR: "<",
    WIN: "w",
    LOSE: "l"
  }
}

export function setInventoryBindings(){
  BINDINGS.INVENTORY = {
    DROP: "r",
    EQUIP: "e",
    UNEQUIP: "x",
    CONSUME: "c",
    UPGRADE: "V",
    TRASH: "T",
    ENTER_BINDINGS: "?"
  }
}

export function menuTopLine(highLighted){
  let topLineStrings = ['Equipment', 'Inventory', 'Skills', 'Character stats'];
  let topLineBindings = [BINDINGS.GAME.ENTER_EQUIPMENT, BINDINGS.GAME.ENTER_INVENTORY, BINDINGS.GAME.ENTER_SKILLS, BINDINGS.GAME.ENTER_STATS];
  let start = '|';
  for(let i = 0; i < topLineStrings.length; i++){
    let currString = topLineStrings[i];
    let firstChar = currString.charAt(0);
    if(firstChar == topLineBindings[i]){
      currString = `[${firstChar}]${currString.substring(1)}`;
    }
    else{
      currString = `[${topLineBindings[i]}] - ${currString}`;
    }
    if(i == highLighted){
      currString = U.applyBackground(U.applyColor(currString, Color.TEXT_HIGHLIGHTED), Color.TEXT_HIGHLIGHTED_BG);
    }
    start += currString + '|';
  }
  return start;
}
