// a database for all the objects in the game

export let DATASTORE;
clearDatastore();

export function clearDatastore(){
  DATASTORE = {
    GAME: '',
    ID_SEQ: 1,
    MAPS: {},
    ENTITIES: {},
    TIMING: {}
  }
}
