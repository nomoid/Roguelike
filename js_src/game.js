import ROT from 'rot-js';
import * as U from './util.js';
import {StartupMode, PlayMode, WinMode, LoseMode} from './ui_mode.js'

export let Game = {

    _DISPLAY_SPACING: 1.1,
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

    modes: {
      startup: ''
    },
    curMode: '',

    init: function(){
      this._randomSeed = 5 + Math.floor(Math.random() * 100000);
      //this._randomSeed = 76250;
      console.log("using random seed" + this._randomSeed);
      ROT.RNG.setSeed(this._randomSeed);

      for(var display_key in this._display){
        this._display[display_key].o = new ROT.Display({
          width: this._display[display_key].w,
          height: this._display[display_key].h,
          spacing: this._DISPLAY_SPACING
        });
      }

      this.setupModes();
      this.switchMode('play');
      console.log("game:");
      console.dir(this);

    },

    setupModes: function(){
      this.modes.startup = new StartupMode();
      this.modes.play = new PlayMode();
      this.modes.win = new WinMode();
      this.modes.lose = new LoseMode();
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
      for(let i = 0; i < 20; i++){
        d.drawText(5, i, "avatar");
      }
    },

    renderDisplayMain: function(){
      //if (this.curMode.hasOwnProperty('render')){
      this.curMode.render(this._display.main.o);
      //}
      // let d = this._display.main.o;
      // for(let i = 0; i < 20; i++){
      //   d.drawText(5, i, "main");
      // }
    },

    renderDisplayMessage: function(){
      let d = this._display.message.o;
      for(let i = 0; i < 5; i++){
        d.drawText(5, i, "message");
      }
    }
};
