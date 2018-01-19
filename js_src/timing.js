import ROT from 'rot-js';

export let SCHEDULER;
export let TIME_ENGINE;

export function initTiming(){
  SCHEDULER = new ROT.Scheduler.Action();
  TIME_ENGINE = new ROT.Engine(SCHEDULER);
}

//Uses some private variables from ROT scheduler/eventqueue
export function loadScheduler(schedulerData){
  SCHEDULER = new ROT.Scheduler.Action();
  SCHEDULER._current = DATASTORE.ENTITIES[schedulerData.currentId];
  SCHEDULER._duration = schedulerData.duration;
  for(let i = 0; i < schedulerData.repeat.length; i++){
    let ent = DATASTORE.ENTITIES[schedulerData.repeat[i]];
    SCHEDULER._repeat.push(ent);
  }
  SCHEDULER._queue._time = schedulerData.idEventQueue.time;
  SCHEDULER._queue._eventTimes = schedulerData.idEventQueue.eventTimes;
  for(let i = 0; i < schedulerData.idEventQueue.events.length; i++){
    let ent = DATASTORE.ENTITIES[schedulerData.idEventQueue.events[i]];
    SCHEDULER._queue._events.push(ent);
  }
  TIME_ENGINE = new ROT.Engine(SCHEDULER);
}

export function saveScheduler(){
  let data = {
    currentId: SCHEDULER._current,
    duration: SCHEDULER._duration,
  };
  let repeatData = [];
  for(let i = 0; i < SCHEDULER._repeat.length; i++){
    repeatData.push(SCHEDULER._repeat[i].getId());
  }
  let eventData = [];
  for(let i = 0; i < SCHEDULER._queue._events.length; i++){
    eventData.push(SCHEDULER._queue._events[i].getId());
  }
  let idEventQueueData = {
    eventTimes: SCHEDULER._queue._eventTimes,
    time: SCHEDULER._queue._time,
    events: eventData
  };
  data.repeat = repeatData;
  data.idEventQueue = idEventQueueData;
  return data;
}
