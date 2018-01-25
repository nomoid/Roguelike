import {DisplaySymbol} from "./display_symbol.js";
import * as E from './entity_mixins.js';
import {deepCopy} from './util.js';

export class MixableSymbol extends DisplaySymbol{
  constructor(template){
    super(template);
    if(!this.attr){
      this.attr = {};
    }
    this.mixins = [];
    this.mixinTracker = {};

    // record/track any mixins this entity has
    if(template.mixinNames){
      for(let i = 0; i < template.mixinNames.length; i++){
        let name = template.mixinNames[i];
        this.mixins.push(E[name]);
        this.mixinTracker[name] = true;
      }
    }

    //setup mixin state and import mixin methods
    for(let i = 0; i < this.mixins.length; i++){
      let m = this.mixins[i];
      //handle attr stuff
      if(m.META.stateNamespace){
        let model = {};
        if(m.META.stateModel){
          for(let sbase in m.META.stateModel){
            let obj = m.META.stateModel[sbase];
            let newObj = deepCopy(obj);
            model[sbase] = newObj;
          }
        }
        this.attr[m.META.stateNamespace] = model;
      }
      //handle methods
      if(m.METHODS){
        for(let method in m.METHODS){
          this[method] = m.METHODS[method];
        }
      }
    }

    for (let i = 0; i < this.mixins.length; i++){
      let m = this.mixins[i];
      if (m.META.initialize) {
        m.META.initialize.call(this,template);
      }
    }
  }

  raiseMixinEvent(evtLabel, evtData){

    if(this._environment.raiseEvent(evtLabel, evtData, this)){
      for (let i=0; i < this.mixins.length; i++){
        let m = this.mixins[i];
        if(m.LISTENERS && m.LISTENERS[evtLabel]){
          m.LISTENERS[evtLabel].call(this,evtData);
        }
        if(m.LISTENERS && m.LISTENERS._wildCard){
          m.LISTENERS._wildCard.call(this,evtLabel,evtData);
        }
      }
    }
  }

  setEnvironment(environment){
    this._environment = environment;
  }

}
