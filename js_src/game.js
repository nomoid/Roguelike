import ROT from 'rot-js';
import * as U from './util.js';
import {StartupMode, PlayMode, WinMode, LoseMode, MessagesMode, PersistenceMode} from './ui_mode.js'
import {Message} from './message.js';
import {MapMaker} from './map.js';
import {DATASTORE, clearDatastore} from './datastore.js';

export let Game = {
  _PERSISTENCE_NAMESPACE: 'pickledpopcorn',
  _SAVE_LIST_NAMESPACE: 'savelist',
  _DISPLAY_SPACING: 1.1,
  _MAX_FLOORS: 10,
  _display: {
    main: {
      w: 80,
      h: 24,
      o: null
    },
    avatar: {
      w: 20,
      h: 24,
      o: null
    },
    message: {
      w: 100,
      h: 6,
      o: null
    }
  },

  hasSaved: false,

  modes: {

  },
  curMode: '',
  settings: {
    activeTextColor: "#ccc",
    disabledTextColor: "#555"
  },

  //Game Save ID, load and save at this location always
  _uid: null,

  mapIds: Array(),
  currMap: 0,

  init: function(){

    this.setupDisplays();

    Message.init(this._display.message.o);

    this.setupModes();
    this.switchMode('startup');

    DATASTORE.GAME = this;

    console.log("game:");
    console.dir(this);
    console.log('datastore');
    console.dir(DATASTORE);

  },

  setupDisplays: function(){
    for(var display_key in this._display){
      this._display[display_key].o = new ROT.Display({
        width: this._display[display_key].w,
        height: this._display[display_key].h,
        spacing: this._DISPLAY_SPACING
      });
    }
  },

  setupModes: function(){
    this.modes.startup = new StartupMode(this);
    this.modes.play = new PlayMode(this);
    this.modes.win = new WinMode(this);
    this.modes.lose = new LoseMode(this);
    this.modes.messages = new MessagesMode(this);
    this.modes.persistence = new PersistenceMode(this);
  },

  switchMode: function(newModeName){
    if (this.curMode) {
      this.curMode.exit();
    }
    this.curMode = this.modes[newModeName];
    if (this.curMode){
      this.curMode.enter();
    }
  },

  getDisplay: function(displayId){
    if(this._display.hasOwnProperty(displayId)){
      return this._display[displayId].o;
    }
    return null;
  },

  render: function(){
    this.renderDisplayAvatar();
    this.renderDisplayMain();
    this.renderDisplayMessage();
  },

  renderDisplayAvatar: function(){
    let d = this._display.avatar.o;
    d.clear();
    if(this.curMode===null || this.curMode==''){
      return;
    }
    else{
      this.curMode.renderAvatar(d);
    }
  },

  renderDisplayMain: function(){
    let d = this._display.main.o;
    d.clear();
    if(this.curMode===null || this.curMode==''){
      return;
    }
    else{
      this.curMode.renderMain(d);
    }
  },

  renderDisplayMessage: function(){
    this._display.message.o.clear();
    Message.render();
    // let d = this._display.message.o;
    // d.clear();
    // if(this.curMode===null || this.curMode==''){
    //   return;
    // }
    // else{
    //   this.curMode.renderMessage(d);
    // }
  },

  bindEvent: function(eventType) {
    window.addEventListener(eventType, (evt) => {
      this.eventHandler(eventType, evt);
    });
  },

  eventHandler: function (eventType, evt){
    if (this.curMode !== null && this.curMode != ''){
      if(this.curMode.handleInput(eventType, evt)){
        this.render();
        //Message.ageMessages();
      }
    }
  },

  toJSON: function(){
    let json = '';
    json = JSON.stringify({
      rseed: this._randomSeed,
      uid: this._uid,
      playModeState: this.modes.play,
      mapIds: this.mapIds,
      currMap: this.currMap
    });
    return json;
  },

  fromJSON: function(json){
    let attr = JSON.parse(json);
    this.setupNewGame(attr);
  },

  setupNewGame: function(state){
    if(state){
      this._randomSeed = state.rseed;
      this.modes.play.restoreFromState(state.playModeState);
      this._uid = state.uid;
      this.mapIds = state.mapIds;
      this.currMap = state.currMap;
    }
    else{
      this._randomSeed = 5 + Math.floor(Math.random() * 100000);
      this.modes.play.reset();
      this._uid = Math.floor(Math.random() * 1000000000);
      this.mapIds = Array();
      this.currMap = 0;
    }
    console.log("using random seed" + this._randomSeed);
    ROT.RNG.setSeed(this._randomSeed);
  },

  getMapId: function(){
    while(!this.mapIds[this.currMap]){
      let m = MapMaker({xdim: 50, ydim: 40});
      let id = m.getId();
      m.setupMap();
      this.mapIds.push(id);
    }
    return this.mapIds[this.currMap];
  },

  previousFloor: function(){
    if(this.currMap > 0){
      this.currMap--;
    }
  },

  nextFloor: function(){
    if(this.currMap < this._MAX_FLOORS - 1){
      this.currMap++;
    }
  }

};
