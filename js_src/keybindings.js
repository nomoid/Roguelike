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
  INVENTORY: {
    DROP: "Drop an item",
    EQUIP: "Equip an item",
    CONSUME: "Consume an item",
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
    ENTER_PERSISTENCE: "Save/load/new game",
    ENTER_MESSAGES: "Show all messages",
    ENTER_BINDINGS: "Show/switch key bindings",
    NEXT_FLOOR: "Next floor",
    PREV_FLOOR: "Previous floor",
    WIN: "Win the game",
    LOSE: "Lose the game"
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
    ENTER_PERSISTENCE: "S",
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
    ENTER_PERSISTENCE: "S",
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
    CONSUME: "c",
    TRASH: "T",
    ENTER_BINDINGS: "?"
  }
}
