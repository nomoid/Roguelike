import {DATASTORE} from './datastore.js';
import {BINDINGS, BINDING_DESCRIPTIONS_SHORT} from './keybindings.js';

export function renderAvatar(display, avatar, game, mode){
  let xAxis = 1;
  display.drawText(xAxis, 0, "Player Info");
  display.drawText(xAxis, 2, `Level ${avatar.getLevel()}`);
  display.drawText(xAxis, 3, `HP: ${avatar.getHp()}/${avatar.getStat('maxHp')}`);
  display.drawText(xAxis, 4, `Location: ${avatar.getX()}, ${avatar.getY()}`);
  display.drawText(xAxis, 5, `Floor: ${game.currMap+1}`);
  display.drawText(xAxis, 6, `Time: ${avatar.getTime()}`);

  //display.drawText(xAxis, 6, `${DATASTORE.MAPS[game.getMapId()].getMobAmounts('jdog')} jdogs left`);
  let modeBinding = ModeAvatarBindings[mode];
  if(modeBinding){
    let lastRow = 23;
    let bindingLimit = 6;
    let bindingStack = Array();
    //Search inventory, game, then master for bindings
    if(modeBinding.inventory){
      for(let i = 0; i < modeBinding.inventory.length; i++){
        bindingStack.push(['INVENTORY',modeBinding.inventory[i]]);
      }
    }
    if(modeBinding.game){
      for(let i = 0; i < modeBinding.game.length; i++){
        bindingStack.push(['GAME',modeBinding.game[i]]);
      }
    }
    if(modeBinding.master){
      for(let i = 0; i < modeBinding.master.length; i++){
        bindingStack.push(['MASTER', modeBinding.master[i]]);
      }
    }
    let bindingsToRender = Math.min(bindingLimit, bindingStack.length);
    for(let i = 0; i < bindingsToRender; i++){
      let bindingItem = bindingStack.pop();
      let bindingKey = BINDINGS[bindingItem[0]][bindingItem[1]];
      let bindingDescription = BINDING_DESCRIPTIONS_SHORT[bindingItem[0]][bindingItem[1]];
      let bindingString = `[${bindingKey}] - ${bindingDescription}`;
      //Limit based on row length
      let lengthLimit = 18;
      bindingString = bindingString.substring(0, lengthLimit);
      display.drawText(xAxis, lastRow - i, bindingString);
    }
  }
}


export let ModeAvatarBindings = {
  play: {
    game: [
      'ENTER_INVENTORY',
      'ENTER_SKILLS',
      'ENTER_MESSAGES',
      'ENTER_PERSISTENCE',
      'ENTER_BINDINGS'
    ]
  },
  inventory: {
    game: [
      'ENTER_EQUIPMENT',
      'ENTER_SKILLS',
      'ENTER_STATS'
    ],
    master: [
      'EXIT_MENU'
    ]
  },
  skills: {
    game: [
      'ENTER_EQUIPMENT',
      'ENTER_INVENTORY',
      'ENTER_STATS'
    ],
    master: [
      'EXIT_MENU'
    ]
  },
  equipment: {
    game: [
      'ENTER_INVENTORY',
      'ENTER_SKILLS',
      'ENTER_STATS'
    ],
    master: [
      'EXIT_MENU'
    ]
  },
  stats: {
    game: [
      'ENTER_EQUIPMENT',
      'ENTER_INVENTORY',
      'ENTER_SKILLS'
    ],
    master: [
      'EXIT_MENU'
    ]
  },
}
