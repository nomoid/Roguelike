import * as U from './util.js';
import {Message} from './message.js';
import {Map, MapMaker} from './map.js';
import {DisplaySymbol} from './display_symbol.js';
import {DATASTORE, clearDatastore} from './datastore.js';
import {Color} from './color.js';
import {Entity} from './entity.js';
import {EntityFactory} from './entities.js';
import {BINDINGS} from './keybindings.js';

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
    display.drawText(2, 2, "this is avatar");
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
      let a = EntityFactory.create('avatar');
      this.attr.avatarId = a.getId();
    }
    this.game.isPlaying = true;
    this.setupAvatar();
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
    display.drawText(2, 12, "Playing the game");
    display.drawText(2, 13, `[${BINDINGS.GAME.WIN}] to win,
                             [${BINDINGS.GAME.LOSE}] to lose,
                             [${BINDINGS.GAME.ENTER_PERSISTENCE}] to save,
                             [${BINDINGS.GAME.ENTER_MESSAGES}] to view messages`);
    display.drawText(2, 15, "" + this.game._randomSeed);
    //console.log(this.attr.cameramapx);
    DATASTORE.MAPS[this.game.getMapId()].render(display, this.attr.cameramapx, this.attr.cameramapy);
    //this.cameraSymbol.render(display, Math.trunc(display.getOptions().width/2), Math.trunc(display.getOptions().height/2));
  }

  handleInput(eventType, evt){
    if(eventType == "keyup"){
      if(evt.key == BINDINGS.GAME.WIN){
        this.game.switchMode('win');
        return true;
      }
      else if(evt.key == BINDINGS.GAME.LOSE){
        this.game.switchMode('lose');
        return true;
      }
      else if(evt.key == BINDINGS.GAME.ENTER_MESSAGES){
        this.game.switchMode('messages');
        return true;
      }
      else if(evt.key == BINDINGS.GAME.ENTER_PERSISTENCE){
        this.game.switchMode('persistence');
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
        if(this.game.nextFloor()){
          Message.send("You have entered the next floor");
          this.setupAvatar();
          DATASTORE.MAPS[oldId].removeEntity(DATASTORE.ENTITIES[this.attr.avatarId]);
          return true;
        }
      }
      else if(evt.key == BINDINGS.GAME.MOVE_NORTH){
        if(this.moveAvatar(0, -1)){
          return true;
        }
        else{
          Message.send("This path is blocked!");
        }
      }
      else if(evt.key == BINDINGS.GAME.MOVE_SOUTH){
        if(this.moveAvatar(0, 1)){
          return true;
        }
        else{
          Message.send("This path is blocked!");
        }
      }
      else if(evt.key == BINDINGS.GAME.MOVE_EAST){
        if(this.moveAvatar(1, 0)){
          return true;
        }
        else{
          Message.send("This path is blocked!");
        }
      }
      else if(evt.key == BINDINGS.GAME.MOVE_WEST){
        if(this.moveAvatar(-1, 0)){
          return true;
        }
        else{
          Message.send("This path is blocked!");
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
    let success = this.getAvatar().moveBy(dx, dy);
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
        this.game.switchMode('play');
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
        display.drawText(2, 3, `[${BINDINGS.MENU.EXIT_MENU}] - Back to game`);
      }
      display.drawText(2, 4, `[${BINDINGS.PERSISTENCE.NEW_GAME}] - New game`);
      let loadColor = null;
      if(this.game.hasSaved){
        loadColor = Color.TEXT_ACTIVE;
      }
      else{
        loadColor = Color.TEXT_DISABLED;
      }
      display.drawText(2, 5, U.applyColor(`[${BINDINGS.MENU.ENTER_LOAD}] - Load game`, loadColor));
      let saveColor = null;
      if(this.game.isPlaying){
        saveColor = Color.TEXT_ACTIVE;
      }
      else{
        saveColor = Color.TEXT_DISABLED;
      }
      display.drawText(2, 6, U.applyColor(`[${BINDINGS.MENU.SAVE}] - Save game`, saveColor));
      let deleteColor = loadColor;
      display.drawText(2, 7, U.applyColor(`[${BINDINGS.MENU.ENTER_DELETE}] - Delete data`, deleteColor));
    }
    else if(this.currState == PersistenceMode.States.LOADING){
      display.drawText(2, 3, `[${BINDINGS.MENU.EXIT_MENU}] - Back`);
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
      display.drawText(2, 3, `[${BINDINGS.MENU.EXIT_MENU}] - Back`);
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
      if(!this.localStorageAvailable()){
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

  //Code from https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
  //Retrieved 2018-01-08
  localStorageAvailable() {
    try {
        var x = '__storage_test__';
        window.localStorage.setItem(x, x);
        window.localStorage.removeItem(x);
        return true;
    }
    catch(e) {
        Message.send('Browser cannot save or load!');
        return false;
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
            this.game.switchMode('play');
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
          if(this.localStorageAvailable()){
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
    Message.send("Saving...");
    if(!this.localStorageAvailable()){
      Message.send("Error Saving!");
      return;
    }
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

  load(uid){
    Message.send("Loading " + uid + "...");
    if(!this.localStorageAvailable()){
      Message.send("Error Loading!");
      return;
    }

    let data = JSON.parse(window.localStorage.getItem(uid));
    clearDatastore();

    DATASTORE.ID_SEQ = data.ID_SEQ;
    this.game.fromJSON(data.GAME);

    for(let entityid in data.ENTITIES){
      let attr = JSON.parse(data.ENTITIES[entityid]);
      let e = EntityFactory.create(attr.name);
      e.restoreFromState(attr);
      DATASTORE.ENTITIES[entityid] = e;
    }

    for(let mapid in data.MAPS){
      let mapData = JSON.parse(data.MAPS[mapid]);
      DATASTORE.MAPS[mapid] = MapMaker(mapData);
      DATASTORE.MAPS[mapid].setupMap();
    }

    DATASTORE.GAME = this.game;

    console.log('post-load datastore:');
    console.dir(DATASTORE);

  }

  deleteSave(uid){
    Message.send("Deleting " + uid + "...");
    if(!this.localStorageAvailable()){
      Message.send("Error Deleting!");
      return;
    }
    let saveList = this.loadSaveList();
    let saveListPath = this.game._PERSISTENCE_NAMESPACE + '_' + this.game._SAVE_LIST_NAMESPACE;
    U.removeByValue(saveList, uid);
    window.localStorage.removeItem(uid);
    window.localStorage.setItem(saveListPath, JSON.stringify(saveList));
  }

}

PersistenceMode.States = {
  MAIN: "main",
  LOADING: "loading",
  DELETING: "deleting"
}
