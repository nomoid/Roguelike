export let Message = {
  _messages: Array(),
  _targetDisplay: '',
  _bufferLength: 6,
  _historyLength: 1000,
  init: function(targetDisplay){
    this._targetDisplay = targetDisplay;
  },
  render: function(){
    if(!this._targetDisplay){
      return;
    }
    this._targetDisplay.clear();
    for (let i=0; i<this._bufferLength; i++){
      if(this._messages.length >= this._bufferLength-i){
        this._targetDisplay.drawText(1, i, this._messages[this._messages.length-this._bufferLength+i], '#fff', '#000');
      }
    }
    //this._targetDisplay.drawText(1, 1, this._messages[this._messages.length-1], '#fff', '#000');
  },
  send: function(msg){
    this._messages.push(msg);
    if(this._messages.length > this._historyLength){
      this._messages.shift();
    }
    this.render();
  },
  clear: function(){
    this._messages = Array();
  },
  getMessages: function(){
    return this._messages;
  }
};
