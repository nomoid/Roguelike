import ROT from 'rot-js';
import * as U from './util.js';
import {StartupMode, PlayMode, WinMode, LoseMode, MessagesMode, PersistenceMode, BindingsMode} from './ui_mode.js'
import {Message} from './message.js';
import {MapMaker} from './map.js';
import {DATASTORE, clearDatastore} from './datastore.js';
import {initTiming} from './timing.js';

export let Game = {
  _PERSISTENCE_NAMESPACE: 'pickledpopcorn',
  _SAVE_LIST_NAMESPACE: 'savelist',
  _BINDINGS_NAMESPACE: 'bindings',
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
  modeStack: Array(),

  //Game Save ID, load and save at this location always
  _uid: null,

  mapIds: Array(),
  currMap: 0,

  init: function(){

    this.setupDisplays();

    Message.init(this._display.message.o);

    this.setupModes();
    this.modes.bindings.loadBindings();
    this.switchMode('startup');

    DATASTORE.GAME = this;

    console.log("game:");
    console.dir(ROT);
    console.dir(this);
    console.log('datastore');
    console.dir(DATASTORE);

  },

  setupDisplays: function(){
    for(var display_key in this._display){
      this._display[display_key].o = new ROT.Display({
        width: this._display[display_key].w,
        height: this._display[display_key].h,
        spacing: this._DISPLAY_SPACING,
        //forceSquareRatio: true
        tileWidth: 64,
        tileHeight: 32
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
    this.modes.bindings = new BindingsMode(this);
  },

  switchMode: function(newModeName){
    if (this.modeStack.length > 0) {
      this.curMode().exit();
    }
    this.modeStack = Array();
    this.modeStack.push(this.modes[newModeName]);
    this.curMode().enter();
  },

  pushMode: function(newModeName){
    if (this.modeStack.length > 0) {
      this.curMode().exit();
    }
    this.modeStack.push(this.modes[newModeName]);
    this.curMode().enter();
  },

  curMode: function(){
    if(this.modeStack.length > 0){
      return this.modeStack[this.modeStack.length - 1];
    }
    else{
      return null;
    }
  },

  prevMode : function(){
    if(this.modeStack.length > 1){
      return this.modeStack[this.modeStack.length - 2];
    }
    else{
      return null;
    }
  },

  popMode: function(){
    if (this.modeStack.length > 0) {
      this.curMode().exit();
      this.modeStack.pop();
    }
    this.curMode().enter();
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
    if(this.curMode() === null){
      return;
    }
    else{
      this.curMode().renderAvatar(d);
    }
  },

  renderDisplayMain: function(){
    let d = this._display.main.o;
    d.clear();
    if(this.curMode() === null){
      return;
    }
    else{
      this.curMode().renderMain(d);
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
    if (this.curMode() !== null){
      if(this.curMode().handleInput(eventType, evt)){
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
      currMap: this.currMap,
      rngState: ROT.RNG.getState()
    });
    return json;
  },

  fromJSON: function(json){
    let attr = JSON.parse(json);
    this.setupNewGame(attr);
  },

  setupNewGame: function(state){
    if(state){
      this.setupRng(state.rseed);
      ROT.RNG.setState(state.rngState);
      this.modes.play.restoreFromState(state.playModeState);
      this._uid = state.uid;
      this.mapIds = state.mapIds;
      this.currMap = state.currMap;
    }
    else{
      this.setupRng(U.getRandomNoStateSeed());
      this.modes.play.reset();
      this._uid = Math.floor(U.getRandomNoStateSeed());
      this.mapIds = Array();
      this.currMap = 0;

    }
    initTiming();
  },

  getMapId: function(){
    while(!this.mapIds[this.currMap]){
      let m = MapMaker({xdim: 50, ydim: 40, mapSeed: U.mapSeedFromFloor(this._mapRNGData, this.currMap)});
      let id = m.getId();
      m.setupMap();
      this.mapIds.push(id);
    }
    return this.mapIds[this.currMap];
  },

  previousFloor: function(){
    if(this.currMap > 0){
      this.currMap--;
      return true;
    }
    return false;
  },

  nextFloor: function(){
    if(this.currMap < this._MAX_FLOORS - 1){
      this.currMap++;
      return true;
    }
    return false;
  },

  //For 17 JDOGS use seed 26555
  //For 28 JDOGS use seed 501628887 (2nd floor)
  setupRng: function(rseed){
    console.log(rseed);
    this._randomSeed = rseed;//328343077;
    console.log("using random seed" + this._randomSeed);
    ROT.RNG.setSeed(this._randomSeed);
    let initSeedValue = U.getRandomSeed();
    let offsetValue = U.getRandomSeed();
    this._mapRNGData = {initSeed: initSeedValue, offset: offsetValue};
  },

  raiseEvent: function(evtLabel, evtData, src){
    if(evtLabel == "renderMain"){
      this.renderDisplayMain();
    }
    if(evtLabel == "killed"){
      if(src == this.modes.play.getAvatar()){
        this.switchMode('lose');
        this.renderDisplayMain();
      }
    }
    return true;
  }
};
