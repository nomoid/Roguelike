import * as U from './util.js';
import {Message} from './message.js';
import {Map, MapMaker} from './map.js';
import {DisplaySymbol} from './display_symbol.js';
import {DATASTORE, clearDatastore} from './datastore.js';
import {Color} from './color.js';
import {Character} from './character.js';
import {Entity} from './entity.js';
import {EntityFactory} from './entities.js';
import {BINDINGS, BINDING_DESCRIPTIONS, setKeybindingsArrowKeys, setKeybindingsWASD, setInventoryBindings} from './keybindings.js';
import {TIME_ENGINE, loadScheduler, saveScheduler} from './timing.js';
import {getFunctionality} from './items.js';
import {EquipmentSlots, EquipmentOrder} from './equipment.js';

class UIMode{
  constructor(game){
    console.log("created "+this.constructor.name);
    this.game = game;
  }

  enter(){
    console.log("entering "+this.constructor.name);
  }
  exit(){
    console.log("exiting "+this.constructor.name);
  }
  handleInput(eventType, evt){
    console.log("handing input for "+this.constructor.name);
    console.log(`event type is ${eventType}`);
    console.dir(evt);
    return false;
  }
  renderMain(display){
    display.drawText(2, 2, "rendering "+this.constructor.name);
  }
  renderAvatar(display){
    display.drawText(2, 1, "this is avatar");
  }

}

export class StartupMode extends UIMode{
  constructor(game){
    super(game);
  }

  enter(){
    Message.clear();
    this.game.isPlaying = false;
  }

  renderMain(display){
    display.drawText(2, 1, "Welcome to...")
    U.drawTextWithSpaces(display, 2, 2, "  _____ _      _    _          _ _____                                 ");
    U.drawTextWithSpaces(display, 2, 3, " |  __ (_)    | |  | |        | |  __ \\                                ");
    U.drawTextWithSpaces(display, 2, 4, " | |__) |  ___| | _| | ___  __| | |__) |__  _ __   ___ ___  _ __ _ __  ");
    U.drawTextWithSpaces(display, 2, 5, " |  ___/ |/ __| |/ / |/ _ \\/ _` |  ___/ _ \\| '_ \\ / __/ _ \\| '__| '_ \\ ");
    U.drawTextWithSpaces(display, 2, 6, " | |   | | (__|   <| |  __/ (_| | |  | (_) | |_) | (_| (_) | |  | | | |");
    U.drawTextWithSpaces(display, 2, 7, " |_|   |_|\\___|_|\\_\\_|\\___|\\__,_|_|   \\___/| .__/ \\___\\___/|_|  |_| |_|");
    U.drawTextWithSpaces(display, 2, 8, "                                           | |                         ");
    U.drawTextWithSpaces(display, 2, 9, "                                           |_|                         ");
    display.drawText(2, 15, "Press space key to continue...")
  }

  handleInput(eventType, evt){
    console.dir(evt);
    if(eventType == "keyup"){
      if(evt.key == " "){
        this.game.switchMode('persistence');
        return true;
      }
    }
    return false;
  }
}

export class PlayMode extends UIMode{
  constructor(game){
    super(game);
    this.reset();
    //this.cameraSymbol = new DisplaySymbol({name: 'avatar',chr:"@", fg:"#eb4"});
  }

  enter(){
    if(!this.attr.avatarId){
      let a = EntityFactory.create('avatar', true);
      this.attr.avatarId = a.getId();
      a.raiseMixinEvent('initAvatar');
    }
    this.game.isPlaying = true;
    this.setupAvatar();
    TIME_ENGINE.unlock();
  }

  exit(){
    TIME_ENGINE.lock();
  }

  reset(){
    this.attr = {
    };
  }

  toJSON(){
    return JSON.stringify(this.attr);
  }
  restoreFromState(data){
    this.attr = JSON.parse(data);
  }

  renderMain(display){
    /*
    display.drawText(2, 12, "Playing the game");
    display.drawText(2, 13, `[${BINDINGS.GAME.WIN}] to win,
                             [${BINDINGS.GAME.LOSE}] to lose,
                             [${BINDINGS.GAME.ENTER_PERSISTENCE}] to save,
                             [${BINDINGS.GAME.ENTER_MESSAGES}] to view messages`);
    display.drawText(2, 17, "" + this.game._randomSeed);
    */
    //console.log(this.attr.cameramapx);
    DATASTORE.MAPS[this.game.getMapId()].render(display, this.attr.cameramapx, this.attr.cameramapy, this.getAvatar().generateVisibilityChecker());
    //this.cameraSymbol.render(display, Math.trunc(display.getOptions().width/2), Math.trunc(display.getOptions().height/2));
  }

  renderAvatar(display){
    display.drawText(2, 2, "AVATAR, THIS IS");
    display.drawText(2, 3, `Time: ${this.getAvatar().getTime()}`);
    display.drawText(2, 4, `HP: ${this.getAvatar().getHp()}/${this.getAvatar().getMaxHp()}`);
    display.drawText(2, 5, `Location: ${this.getAvatar().getX()}, ${this.getAvatar().getY()}`);
    display.drawText(2, 6, `Floor: ${this.game.currMap+1}`);
    display.drawText(2, 7, `${DATASTORE.MAPS[this.game.getMapId()].getMobAmounts('jdog')} jdogs left`);
  }

  handleInput(eventType, evt){
    if(!this.getAvatar().isActing()){
      return false;
    }
    if(eventType == "keyup"){
      // if(evt.key == BINDINGS.GAME.WIN){//real win condition now!
      //   this.game.switchMode('win');
      //   return true;
      // }
      // else if(evt.key == BINDINGS.GAME.LOSE){//Better lose condition now!
      //   this.game.switchMode('lose');
      //   return true;
      // }
      if(evt.key == BINDINGS.GAME.ENTER_MESSAGES){
        this.game.pushMode('messages');
        return true;
      }
      else if(evt.key == BINDINGS.GAME.ENTER_PERSISTENCE){
        this.game.pushMode('persistence');
        return true;
      }
      else if(evt.key == BINDINGS.GAME.ENTER_BINDINGS){
        this.game.pushMode('bindings', {
          mode: 'GAME'
        });
        return true;
      }
      else if(evt.key == BINDINGS.GAME.ENTER_INVENTORY){
        this.game.pushMode('inventory', {
          avatarId: this.attr.avatarId
        });
        return true;
      }
      else if(evt.key == BINDINGS.GAME.ENTER_EQUIPMENT){
        this.game.pushMode('equipment', {
          avatarId: this.attr.avatarId
        });
        return true;
      }
      else if(evt.key == BINDINGS.GAME.PREV_FLOOR){
        let oldId = this.game.getMapId();
        if(this.game.previousFloor()){
          Message.send("You have entered the previous floor");
          this.setupAvatar();
          DATASTORE.MAPS[oldId].removeEntity(DATASTORE.ENTITIES[this.attr.avatarId]);
          return true;
        }
      }
      else if(evt.key == BINDINGS.GAME.NEXT_FLOOR){
        let oldId = this.game.getMapId();
        if(DATASTORE.MAPS[oldId].getMobAmounts('jdog')==0){
          if(this.game.nextFloor()){
            Message.send("You have entered the next floor");
            this.setupAvatar();
            DATASTORE.MAPS[oldId].removeEntity(DATASTORE.ENTITIES[this.attr.avatarId]);
            return true;
          }
        }
        else{
          Message.send(`Still ${DATASTORE.MAPS[oldId].getMobAmounts('jdog')} jdogs on floor. Kill them before continuing.`);
        }
      }
      else if(evt.key == BINDINGS.GAME.MOVE_NORTH){
        if(this.moveAvatar(0, -1)){
          return true;
        }
        else{
          //Message.send("This path is blocked!");
        }
      }
      else if(evt.key == BINDINGS.GAME.MOVE_SOUTH){
        if(this.moveAvatar(0, 1)){
          return true;
        }
        else{
          //Message.send("This path is blocked!");
        }
      }
      else if(evt.key == BINDINGS.GAME.MOVE_EAST){
        if(this.moveAvatar(1, 0)){
          return true;
        }
        else{
          //Message.send("This path is blocked!");
        }
      }
      else if(evt.key == BINDINGS.GAME.MOVE_WEST){
        if(this.moveAvatar(-1, 0)){
          return true;
        }
        else{
          //Message.send("This path is blocked!");
        }
      }
      else if(evt.key == BINDINGS.GAME.MOVE_IN_PLACE){
        if(this.moveAvatar(0, 0)){
          return true;
        }
        else{
          //Message.send("This path is blocked!");
        }
      }
      else if(evt.key == BINDINGS.GAME.PICK_UP_ITEM){
        if(this.getAvatar().pickUpItem()){
          return true;
        }
      }
      else if(evt.key == BINDINGS.GAME.PICK_UP_ALL_ITEMS){
        if(this.getAvatar().pickUpAllItems() > 0){
          return true;
        }
      }
    }
    return false;
  }

  setupAvatar(){
    let m = DATASTORE.MAPS[this.game.getMapId()];
    if(!m.attr.entityIdToMapPos[this.attr.avatarId]){
      let a = DATASTORE.ENTITIES[this.attr.avatarId];
      m.addEntityAtRandomPosition(a);
    }
    this.moveCameraToAvatar();
  }

  moveAvatar(dx, dy){
    // let newX = this.attr.camerax + dx;
    // let newY = this.attr.cameray + dy;
    // if(newX < 0 || newX > DATASTORE.MAPS[this.attr.mapId].getXDim() - 1){
    //   return;
    // }
    // if(newY < 0 || newY > DATASTORE.MAPS[this.attr.mapId].getYDim() - 1){
    //   return;
    // }
    // this.attr.camerax = newX;
    // this.attr.cameray = newY;
    let success = this.getAvatar().tryWalk(dx, dy);
    this.moveCameraToAvatar();
    return success;
  }

  moveCameraToAvatar(){
    this.attr.cameramapx = this.getAvatar().getX();
    this.attr.cameramapy = this.getAvatar().getY();
  }

  getAvatar(){
    return DATASTORE.ENTITIES[this.attr.avatarId];
  }

}

export class WinMode extends UIMode{
  constructor(game){
    super(game);
  }

  enter(){
    this.game.isPlaying = false;
    console.log("You win");
    Message.send("You win!")
  }

  renderMain(display){
    display.drawText(2, 2, "You have won the game of PickledPopcorn")
    display.drawText(2, 15, "Press any key to restart...")
  }

  handleInput(eventType, evt){
    if(eventType == "keyup"){
      this.game.switchMode('startup');
      return true;
    }
    return false;
  }
}

export class LoseMode extends UIMode{
  constructor(game){
    super(game);
  }

  enter(){
    this.game.isPlaying = false;
    console.log("You lose");
    Message.send("You lose!");
  }

  renderMain(display){
    display.drawText(2, 2, "You lose!");
    display.drawText(2, 15, "Press any key to restart...")
  }

  handleInput(eventType, evt){
    if(eventType == "keyup"){
      this.game.switchMode('startup');
      return true;
    }
    return false;
  }
}

export class MessagesMode extends UIMode{
  constructor(game){
    super(game);
  }

  enter(){
    console.log("Entering Messages mode");
    this.messageIndex = Message.getMessages().length-1;
    this.lines = 20;
  }

  renderMain(display){
    let messageQueue = Message.getMessages();
    let bottom = 23;
    display.drawText(2, 0, "Viewing message history. Arrow Keys to navigate")
    display.drawText(2, 1, "Message " + (this.messageIndex+1) + "/" + messageQueue.length);
    for(let i=0; i < this.lines; i++){
      if(i > this.messageIndex){
        break;
      }
      display.drawText(2, bottom-i, messageQueue[this.messageIndex-i]);
    }
  }

  handleInput(eventType, evt){
    if(eventType == "keyup"){
      if(evt.key == BINDINGS.MASTER.EXIT_MENU){
        this.game.popMode();
        return true;
      }
    }
    if(eventType == "keydown"){
      if(evt.key == BINDINGS.MASTER.MENU_UP){
        if(this.messageIndex >= this.lines){
          this.messageIndex--;
          return true;
        }
      }
      if(evt.key == BINDINGS.MASTER.MENU_DOWN){
        if(this.messageIndex < Message.getMessages().length-1){
          this.messageIndex++;
          return true;
        }
      }
    }
    return false;
  }

}


export class PersistenceMode extends UIMode{
  constructor(game){
    super(game);
  }

  enter(){
    console.log("Entering Persistence mode");
    if (this.loadSaveList().length > 0){
      this.game.hasSaved = true;
    }
    else{
      this.game.hasSaved = false;
    }
    this.currState = PersistenceMode.States.MAIN;
  }

  renderMain(display){
    display.drawText(2, 0, 'Persistence Mode');
    if(this.currState == PersistenceMode.States.MAIN){
      if(this.game.isPlaying){
        display.drawText(2, 3, `[${BINDINGS.MASTER.EXIT_MENU}] - Back to game`);
      }
      display.drawText(2, 4, `[${BINDINGS.PERSISTENCE.NEW_GAME}] - New game`);
      let loadColor = null;
      if(this.game.hasSaved){
        loadColor = Color.TEXT_ACTIVE;
      }
      else{
        loadColor = Color.TEXT_DISABLED;
      }
      display.drawText(2, 5, U.applyColor(`[${BINDINGS.PERSISTENCE.ENTER_LOAD}] - Load game`, loadColor));
      let saveColor = null;
      if(this.game.isPlaying){
        saveColor = Color.TEXT_ACTIVE;
      }
      else{
        saveColor = Color.TEXT_DISABLED;
      }
      display.drawText(2, 6, U.applyColor(`[${BINDINGS.PERSISTENCE.SAVE}] - Save game`, saveColor));
      let deleteColor = loadColor;
      display.drawText(2, 7, U.applyColor(`[${BINDINGS.PERSISTENCE.ENTER_DELETE}] - Delete data`, deleteColor));
    }
    else if(this.currState == PersistenceMode.States.LOADING){
      display.drawText(2, 3, `[${BINDINGS.MASTER.EXIT_MENU}] - Back`);
      let saveList = this.loadSaveList();
      //display.drawText(2, 4, '[1] - Load game 1');
      let saveListLength = saveList.length;
      if(saveListLength > 9){
        saveListLength = 9;
      }
      for(let i = 0; i < saveListLength; i++){
        display.drawText(2, 4+i, '['+(i+1)+'] - Load game '+saveList[i]);
      }
    }
    else if(this.currState == PersistenceMode.States.DELETING){
      display.drawText(2, 3, `[${BINDINGS.MASTER.EXIT_MENU}] - Back`);
      let saveList = this.loadSaveList();
      //display.drawText(2, 4, '[1] - Load game 1');
      let saveListLength = saveList.length;
      if(saveListLength > 9){
        saveListLength = 9;
      }
      for(let i = 0; i < saveListLength; i++){
        display.drawText(2, 4+i, '['+(i+1)+'] - Delete game '+saveList[i]);
      }
      display.drawText(2, 14, `[${BINDINGS.PERSISTENCE.DELETE_ALL}] - Delete all saves`);
    }
  }

  loadSaveList(){
    try{
      if(!U.localStorageAvailable()){
        return Array();
      }
      let saveListPath = this.game._PERSISTENCE_NAMESPACE + '_' + this.game._SAVE_LIST_NAMESPACE;
      let saveListString = window.localStorage.getItem(saveListPath);
      if(!saveListString){
        return Array();
      }
      return JSON.parse(saveListString);
    }
    catch(e){
      Message.send('Error loading saves list');
      return Array();
    }
  }

  handleInput(eventType, evt){
    if(eventType == "keyup"){
      if(this.currState == PersistenceMode.States.MAIN){
        if(evt.key == BINDINGS.PERSISTENCE.NEW_GAME){
          this.game.setupNewGame();
          Message.send("New Game!");
          this.game.switchMode('play');
          return true;
        }
        if(evt.key == BINDINGS.PERSISTENCE.ENTER_LOAD){
          if(this.game.hasSaved){
            this.currState = PersistenceMode.States.LOADING;
            return true;
          }
        }
        if(evt.key == BINDINGS.PERSISTENCE.SAVE){
          if(this.game.isPlaying){
            this.save();
            this.game.switchMode('startup');
            return true;
          }
        }
        if(this.game.isPlaying){
          if(evt.key == BINDINGS.MASTER.EXIT_MENU){
            this.game.popMode();
            return true;
          }
        }
        if(evt.key == BINDINGS.PERSISTENCE.ENTER_DELETE){
          if(this.game.hasSaved){
            this.currState = PersistenceMode.States.DELETING;
            return true;
          }
        }
      }
      else if(this.currState == PersistenceMode.States.LOADING){
        if(evt.key == BINDINGS.MASTER.EXIT_MENU){
          this.currState = PersistenceMode.States.MAIN;
          return true;
        }
        let saveList = this.loadSaveList();
        let selectedSave = parseInt(evt.key);
        if(!isNaN(selectedSave)){
          if(saveList.length>=selectedSave && selectedSave != 0){
            this.load(saveList[selectedSave-1])
            this.game.switchMode('play');
            return true;
          }
        }
      }
      else if(this.currState == PersistenceMode.States.DELETING){
        if(evt.key == BINDINGS.PERSISTENCE.DELETE_ALL){
          if(U.localStorageAvailable()){
            window.localStorage.clear();
            this.game.switchMode('startup');
            return true;
          }
        }
        let saveList = this.loadSaveList();
        let selectedSave = parseInt(evt.key);
        if(!isNaN(selectedSave)){
          if(saveList.length>=selectedSave && selectedSave != 0){
            this.deleteSave(saveList[selectedSave-1])
            this.game.switchMode('startup');
            return true;
          }
        }
      }
    }
    return false;
  }

  save(){
    try {
      Message.send("Saving...");
      if(!U.localStorageAvailable()){
        Message.send("Error Saving!");
        return;
      }
      //Generate timing save state
      let schedulerData = saveScheduler();
      DATASTORE.TIMING = schedulerData;

      window.localStorage.setItem(this.game._uid, JSON.stringify(DATASTORE));
      console.log('post-save datastore');
      console.dir(DATASTORE);
      let saveListPath = this.game._PERSISTENCE_NAMESPACE + '_' + this.game._SAVE_LIST_NAMESPACE;
      //window.localStorage.setItem(saveListPath, JSON.stringify(['u1']));
      let saveList = this.loadSaveList();
      if(!saveList.includes(this.game._uid)){
        saveList.push(this.game._uid);
      }
      window.localStorage.setItem(saveListPath, JSON.stringify(saveList));
    }
    catch(e){
      Message.send("Error Saving!");
      return;
    }
  }

  load(uid){
    try {
      Message.send("Loading " + uid + "...");
      if(!U.localStorageAvailable()){
        Message.send("Error Loading!");
        return;
      }

      let data = JSON.parse(window.localStorage.getItem(uid));
      clearDatastore();

      DATASTORE.ID_SEQ = data.ID_SEQ;
      this.game.fromJSON(data.GAME);

      DATASTORE.GAME = this.game;

      for(let entityid in data.ENTITIES){
        let attr = JSON.parse(data.ENTITIES[entityid]);
        let e = EntityFactory.create(attr.name, false);
        e.restoreFromState(attr);
        DATASTORE.ENTITIES[entityid] = e;
      }

      for(let mapid in data.MAPS){
        let mapData = JSON.parse(data.MAPS[mapid]);
        DATASTORE.MAPS[mapid] = MapMaker(mapData);
        DATASTORE.MAPS[mapid].setupMap();
      }

      loadScheduler(data.TIMING);

      console.log('post-load datastore:');
      console.dir(DATASTORE);
    }
    catch(e){
      Message.send("Error Loading!");
      throw e;
    }
  }

  deleteSave(uid){
    try {
      Message.send("Deleting " + uid + "...");
      if(!U.localStorageAvailable()){
        Message.send("Error Deleting!");
        return;
      }
      let saveList = this.loadSaveList();
      let saveListPath = this.game._PERSISTENCE_NAMESPACE + '_' + this.game._SAVE_LIST_NAMESPACE;
      U.removeByValue(saveList, uid);
      window.localStorage.removeItem(uid);
      window.localStorage.setItem(saveListPath, JSON.stringify(saveList));
    }
    catch(e){
      Message.send("Error Deleting!");
      return;
    }
  }


}

PersistenceMode.States = {
  MAIN: "main",
  LOADING: "loading",
  DELETING: "deleting"
}

export class BindingsMode extends UIMode{
  constructor(game){
    super(game);
  }

  enter(template){
    console.log("Entering Bindings Mode");
    this.changingBinding = false;
    this.keyToChange = null;
    if(template.mode){
      this.mode = template.mode;
    }
    else{
      this.mode = 'GAME';
    }
  }

  renderMain(display){
    display.drawText(2, 0, 'Key Bindings');
    display.drawText(2, 1, `[${BINDINGS.MASTER.SELECT}]+[Old Key]+[New Key] Rebind key`);
    if(!this.changingBinding){
      if(this.mode == 'GAME'){
        display.drawText(2, 2, `[${BINDINGS.BINDING.REVERT_ARROW}] to revert to arrow key defaults, [${BINDINGS.BINDING.REVERT_WASD}] to revert to WASD defaults`);
      }
      else if(this.mode == 'INVENTORY'){
        display.drawText(2, 2, `[${BINDINGS.BINDING.REVERT_INVENTORY} to revert to default]`)
      }
    }
    else {
      let text = 'Currently changing binding';
      if(this.keyToChange){
        text = text + ' for ' + BINDING_DESCRIPTIONS[this.mode][this.keyToChange];
      }
      else{
        text = text + ' (press a key to change the binding for that key)';
      }
      display.drawText(2, 2, text);
    }
    let i = 0;
    for(let binding in BINDINGS[this.mode]){
      let text = `${BINDING_DESCRIPTIONS[this.mode][binding]} - [${BINDINGS[this.mode][binding]}]`;
      if(binding == this.keyToChange){
        text = U.applyColor(text, Color.TEXT_SELECTED);
      }
      display.drawText(2, 4+i, text);
      i++;
    }
  }

  handleInput(eventType, evt){
    if(eventType == "keyup"){
      if(evt.key == "Shift"){
        return false;
      }
      if(!this.changingBinding){
        if(evt.key == BINDINGS.MASTER.EXIT_MENU){
          this.game.popMode();
          return true;
        }
        else if(evt.key == BINDINGS.MASTER.SELECT){
          this.changingBinding = true;
          return true;
        }
        else if(this.mode == "GAME"){
          if(evt.key == BINDINGS.BINDING.REVERT_ARROW){
            setKeybindingsArrowKeys();
            this.saveBindings();
            return true;
          }
          else if(evt.key == BINDINGS.BINDING.REVERT_WASD){
            setKeybindingsWASD();
            this.saveBindings();
            return true;
          }
        }
        else if(this.mode == "INVENTORY"){
          if(evt.key == BINDINGS.BINDING.REVERT_INVENTORY){
            setInventoryBindings();
            this.saveBindings();
            return true;
          }
        }
      }
      else{
        if(this.keyToChange){
          if(this.mode != "GAME"){
            for(let binding in BINDINGS.MASTER){
              if(evt.key == BINDINGS.MASTER[binding]){
                Message.send("Cannot bind to this key!");
                this.keyToChange = null;
                this.changingBinding = false;
                return true;
              }
            }
            let numKey = parseInt(evt.key);
            if(!isNaN(numKey)){
              Message.send("Cannot bind to this key!");
              this.keyToChange = null;
              this.changingBinding = false;
              return true;
            }
          }
          else{
            if(evt.key == BINDINGS.MASTER.SELECT || evt.key == BINDINGS.MASTER.EXIT_MENU){
              Message.send("Cannot bind to this key!");
              this.keyToChange = null;
              this.changingBinding = false;
              return true;
            }
          }
          for(let binding in BINDINGS[this.mode]){
            if(evt.key == BINDINGS[this.mode][binding]){
              BINDINGS[this.mode][binding] = BINDINGS[this.mode][this.keyToChange];
              BINDINGS[this.mode][this.keyToChange] = evt.key;
              Message.send("Bindings swapped.");
              this.keyToChange = null;
              this.changingBinding = false;
              this.saveBindings();
              return true;
            }
          }
          BINDINGS[this.mode][this.keyToChange] = evt.key;
          Message.send("Binding set.");
          this.keyToChange = null;
          this.changingBinding = false;
          this.saveBindings();
          return true;
        }
        else{
          if(evt.key == BINDINGS.MASTER.SELECT){
            this.changingBinding = false;
            return true;
          }
          for(let binding in BINDINGS[this.mode]){
            if(evt.key == BINDINGS[this.mode][binding]){
              this.keyToChange = binding;
              return true;
            }
          }
          Message.send("Please enter a pre-bound key.");
          this.changingBinding = false;
          return true;
        }
      }
    }
  }

  saveBindings(){
    try {
      if(!U.localStorageAvailable()){
        Message.send("Error saving bindings!");
        return;
      }
      let bindingsPath = this.game._PERSISTENCE_NAMESPACE + '_' + this.game._BINDINGS_NAMESPACE;
      window.localStorage.setItem(bindingsPath, JSON.stringify(BINDINGS));
    }
    catch(e) {
      Message.send("Error saving bindings!");
      return;
    }
  }

  loadBindings(){
    try {
      if(!U.localStorageAvailable()){
        Message.send("Error loading bindings!");
        return;
      }
      let bindingsPath = this.game._PERSISTENCE_NAMESPACE + '_' + this.game._BINDINGS_NAMESPACE;
      let bindingString = window.localStorage.getItem(bindingsPath);
      let bindings = JSON.parse(bindingString);
      for(let bindingGroupIndex in bindings){
        let bindingGroup = bindings[bindingGroupIndex];
        for(let bindingIndex in bindingGroup){
            BINDINGS[bindingGroupIndex][bindingIndex] = bindingGroup[bindingIndex];
        }
      }
    }
    catch(e) {
      Message.send("Error loading bindings!");
      return;
    }
  }
}

export class InventoryMode extends UIMode{
  constructor(game){
    super(game);
  }

  enter(template){
    if(template.avatarId){
      this.avatarId = template.avatarId;
    }
    if(template.selected){
      let items = this.getAvatar().getItems();
      this.game.persist.inventoryIndex = template.selected;
      if(this.game.persist.inventoryIndex >= items.length){
        this.game.persist.inventoryIndex = items.length - 1;
      }
      if(this.game.persist.inventoryIndex < 0){
        this.game.persist.inventoryIndex = 0;
      }
    }
  }

  renderMain(display){
    let bottom = 23;
    display.drawText(0, 0, '|Equipment|' + U.applyBackground(U.applyColor('Inventory', Color.TEXT_HIGHLIGHTED), Color.TEXT_HIGHLIGHTED_BG) + '|Skills|');
    let items = this.getAvatar().getItems();
    let maxRender = 20;
    if(items.length - this.game.persist.inventoryIndex > maxRender){
      display.drawText(0, bottom, Character.DOWN_TRIANGLE);
    }
    let skip = Math.max(0, Math.min(items.length - maxRender, this.game.persist.inventoryIndex));
    let renderEnd = Math.min(maxRender, items.length - skip);
    if(skip > 0){
      display.drawText(0, 4, Character.UP_TRIANGLE);
    }
    //Render items
    for(let i = 0; i < renderEnd; i++){
      let item = items[skip + i];
      let name = "Unidentified item";
      if(item.name){
        name = item.name;
      }
      //Highlight selected item
      if(skip + i == this.game.persist.inventoryIndex){
        name = U.applyBackground(U.applyColor(name, Color.TEXT_HIGHLIGHTED), Color.TEXT_HIGHLIGHTED_BG)
      }
      display.drawText(2, i + 4, name);
    }
    if(this.game.persist.inventoryIndex < items.length){
      //Render description
      let selectedItem = items[this.game.persist.inventoryIndex];
      let descriptionX = 40;
      let description = "Nobody knows what this item is used for...";
      if(selectedItem.description){
        description = U.fillTemplate(selectedItem.description, selectedItem);
      }
      let itemType = "Item";
      if(selectedItem.type){
        itemType = selectedItem.type;
      }
      display.drawText(descriptionX, 4, itemType);
      display.drawText(descriptionX, 5, description);
      //Render functionality
      let functionalityX = 40;
      let functionalityList = getFunctionality(itemType);
      for(let i = 0; i < functionalityList.length; i++){
        let functionality = functionalityList[i];
        let functionalityString = `[${functionality.key}] - ${functionality.description}`;
        display.drawText(functionalityX, 8 + i, functionalityString);
      }
    }

  }

  handleInput(eventType, evt){
    if(eventType == "keyup"){
      if(evt.key == BINDINGS.MASTER.EXIT_MENU){
        this.game.popMode();
        return true;
      }
      else if(evt.key == BINDINGS.MASTER.MENU_DOWN){
        let maxRender = 20;
        let items = this.getAvatar().getItems();
        if(this.game.persist.inventoryIndex < items.length - 1){
          this.game.persist.inventoryIndex++;
          return true;
        }
      }
      else if(evt.key == BINDINGS.MASTER.MENU_UP){
        if(this.game.persist.inventoryIndex > 0){
          this.game.persist.inventoryIndex--;
          return true;
        }
      }
      else if(evt.key == BINDINGS.MASTER.MENU_LEFT){
        this.game.swapMode('equipment', {
          avatarId: this.avatarId
        });
        return true;
      }
      else if(evt.key == BINDINGS.MASTER.MENU_RIGHT){
        //this.game.swapMode('skills');
        //return true;
      }
      else if(evt.key == BINDINGS.INVENTORY.ENTER_BINDINGS){
        this.game.pushMode('bindings', {
          mode: 'INVENTORY'
        });
        return true;
      }
      else{
        let items = this.getAvatar().getItems();
        if(this.game.persist.inventoryIndex < items.length){
          let selectedItem = items[this.game.persist.inventoryIndex];
          let itemType = "Item";
          if(selectedItem.type){
            itemType = selectedItem.type;
          }
          let functionalityList = getFunctionality(itemType);
          for(let i = 0; i < functionalityList.length; i++){
            let functionality = functionalityList[i];
            if(evt.key == functionality.key){
              //Perform the functionality
              let functionalityData = {
                itemIndex: this.game.persist.inventoryIndex,
                item: selectedItem,
                src: this.getAvatar(),
                removed: false
              };
              this.getAvatar().raiseMixinEvent(functionality.mixinEvent, functionalityData);
              if(functionalityData.removed){
                this.getAvatar().removeItem(this.game.persist.inventoryIndex);
                if(this.game.persist.inventoryIndex >= items.length){
                  this.game.persist.inventoryIndex = Math.max(0, items.length - 1);
                }
              }
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  getAvatar(){
    return DATASTORE.ENTITIES[this.avatarId];
  }
}

export class EquipmentMode extends UIMode{
  constructor(game){
    super(game);
  }

  enter(template){
    if(template.avatarId){
      this.avatarId = template.avatarId;
    }
    if(template.equipping){
      this.equipping = true;
      this.itemIndex = template.itemIndex;
      this.item = template.item;
      //Try to find the correct slot
      this.game.persist.equipmentIndex = this.getPreferredSlotIndex(template.item);
    }
    else{
      this.equipping = false;
    }
  }

  renderMain(display){
    display.drawText(0, 0, '|' + U.applyBackground(U.applyColor('Equipment', Color.TEXT_HIGHLIGHTED), Color.TEXT_HIGHLIGHTED_BG) + '|Inventory|Skills|');
    let equipment = this.getAvatar().getEquipment();
    for(let i = 0; i < EquipmentOrder.length; i++){
      let slot = EquipmentOrder[i];
      let slotName = EquipmentSlots[slot];
      if(slotName){
        let item = equipment[slot];
        let itemText = "Empty";
        if(item){
          itemText = "Unidentified item";
          if(item.name){
            itemText = item.name;
          }
        }
        let slotText = `${slotName} - ${itemText}`;
        if(i == this.game.persist.equipmentIndex){
          slotText = U.applyBackground(U.applyColor(slotText, Color.TEXT_HIGHLIGHTED), Color.TEXT_HIGHLIGHTED_BG)
        }
        display.drawText(2, 4 + i, slotText);
      }
    }
    let selectedItemSlot = EquipmentOrder[this.game.persist.equipmentIndex];
    let selectedItem = equipment[selectedItemSlot];
    if(selectedItem){
      let descriptionX = 40;
      let description = "Nobody knows what this item is used for...";
      if(selectedItem.description){
        description = U.fillTemplate(selectedItem.description, selectedItem);
      }
      let slotType = "Equipment";
      if(selectedItem.slot){
        slotType = selectedItem.slot;
      }
      display.drawText(descriptionX, 4, slotType);
      display.drawText(descriptionX, 5, description);
    }
    //Render functionality
    let functionalityX = 40;
    if(this.equipping){
      display.drawText(functionalityX, 8, `[${BINDINGS.INVENTORY.EQUIP}] - Equip here`);
      display.drawText(functionalityX, 9, `[${BINDINGS.MASTER.EXIT_MENU}] - Cancel`);
    }
    else if(selectedItem){
      display.drawText(functionalityX, 8, `[${BINDINGS.INVENTORY.UNEQUIP}] - Unequip`);
      display.drawText(functionalityX, 9, `[${BINDINGS.INVENTORY.DROP}] - Drop`);
    }
  }

  handleInput(eventType, evt){
    if(eventType == "keyup"){
      if(evt.key == BINDINGS.MASTER.EXIT_MENU){
        this.game.popMode();
        return true;
      }
      else if(evt.key == BINDINGS.MASTER.MENU_UP){
        if(this.game.persist.equipmentIndex > 0){
          this.game.persist.equipmentIndex--;
          return true;
        }
      }
      else if(evt.key == BINDINGS.MASTER.MENU_DOWN){
        if(this.game.persist.equipmentIndex < EquipmentOrder.length - 1){
          this.game.persist.equipmentIndex++;
          return true;
        }
      }
      else{
        if(this.equipping){
          if(evt.key == BINDINGS.INVENTORY.EQUIP){
            let oldItemHolder = {};
            let slot = EquipmentOrder[this.game.persist.equipmentIndex];
            if(this.getAvatar().canRemoveItem(this.itemIndex)){
              if(this.getAvatar().addEquipment(slot, this.item, oldItemHolder)){
                //Remove from inventory on success
                this.getAvatar().removeItem(this.itemIndex);
                if(oldItemHolder.item){
                  this.getAvatar().addItem(oldItemHolder.item);
                }
                this.game.popMode({
                  selected: this.itemIndex
                });
              }
            }
            return true;
          }
        }
        else{
          if(evt.key == BINDINGS.INVENTORY.ENTER_BINDINGS){
            this.game.pushMode('bindings', {
              mode: 'INVENTORY'
            });
            return true;
          }
          //Disallow L/R when equipping
          else if(evt.key == BINDINGS.MASTER.MENU_LEFT){
            //this.game.swapMode('skills');
            //return true;
          }
          else if(evt.key == BINDINGS.MASTER.MENU_RIGHT){
            this.game.swapMode('inventory', {
              avatarId: this.avatarId
            });
            return true;
          }
          else if(evt.key == BINDINGS.INVENTORY.UNEQUIP){
            let oldItemHolder = {};
            let slot = EquipmentOrder[this.game.persist.equipmentIndex];
            if(this.getAvatar().removeEquipment(slot, oldItemHolder)){
              if(oldItemHolder.item){
                this.getAvatar().addItem(oldItemHolder.item);
              }
            }
            return true;
          }
          else if(evt.key == BINDINGS.INVENTORY.DROP){
            let oldItemHolder = {};
            let slot = EquipmentOrder[this.game.persist.equipmentIndex];
            if(this.getAvatar().removeEquipment(slot, oldItemHolder)){
              if(oldItemHolder.item){
                let tryDropHolder = {
                  item: oldItemHolder.item,
                  removed: false
                };
                this.getAvatar().raiseMixinEvent('tryDropItem', tryDropHolder);
                if(!tryDropHolder.removed){
                  this.getAvatar().addItem(oldItemHolder.item);
                }
              }
            }
            return true;
          }
          //For a safety measure, you can't trash things equipped on yourself
        }
      }
    }
    return false;
  }

  getPreferredSlotIndex(item){
    //Try finding an empty one
    let allowedClosed = Array();
    let allowedOpen = Array();
    let equipment = this.getAvatar().getEquipment();
    for(let i = 0; i < EquipmentOrder.length; i++){
      let slot = EquipmentOrder[i];
      if(item.slot === EquipmentSlots[slot]){
        if(equipment[slot] == null){
          allowedOpen.push(i);
        }
        else{
          allowedClosed.push(i);
        }
      }
    }
    if(allowedOpen.length > 0){
      return allowedOpen[0];
    }
    else if(allowedClosed.length > 0){
      return allowedClosed[0];
    }
    else{
      return 0;
    }
  }

  getAvatar(){
    return DATASTORE.ENTITIES[this.avatarId];
  }
}
