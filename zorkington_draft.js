const readline = require("readline");
const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
class Room {
  constructor(description, connections, inventory) {
    this.description = description;
    this.connections = connections;
    this.inventory = inventory;
  }
  inventoryItem(inputArray) {
    for (let i = 0; i < this.inventory.length; i++) {
      if (inputArray.includes(this.inventory[i].name)) {
        return this.inventory[i];
      }
    }
  }
  // setPlayerHere() {
  //   let isPlayerHere = true;
  // }
}
class Player {
  constructor(status, location, inventory = {}) {
    this.status = status;
    this.location = location;
    this.inventory = inventory;
  }
  isInputValid(input) {
    let item = this.location.inventoryItem(input);
    if (item){
      let action = item.actionWord(input);
      console.log(item, action);
      return true;  
    }else{
      return false;
    }
  }
  outputMessage(input){
    if(!input.canStatusBeChanged()){
      console.log(input.message[0])
    } else {
      if(input.dependsOn && !input.dependsOn.isLocked() && input.message.length>1){
        input.message.shift()
      }
      console.log(input.message[0]);
      if(input.message.length >1){
        input.updateStatus(input);
      }
    } 
  }
  sorry(verb) {
    console.log(`Sorry, I don't know how to ${verb}.`);
  }
  

};


class Thing {
  constructor(name, status, action, message, error, otherThing = null) {
    this.name = name;
    this.status = status;
    this.action = action;
    this.message = message;
    this.error = error;
    this.dependsOn = otherThing;
  }
  actionWord(inputArray) {
    console.log(this.action);
    for (let i = 0; i < this.action.length; i++) {
      if (inputArray.includes(this.action[i])) {
        return this.action[i];
      }
    }
  }
  isLocked() {
    if (this.status.length === 1){
      return false;
    } else {
      return true;
    }
  }
  canStatusBeChanged() {
    if(this.isLocked()){
      if(this.dependsOn && this.dependsOn.isLocked()){
        return false;
      } 
      return true;
    }
    return false;
  }
  updateStatus() {
    this.status.shift();
    this.message.shift();
  }
  take(){
    if (this.action.includes("take")){
    user.inventory[this.name] = this;
    }
  }
}
// NOTE: if Thing dependsOn something, then first message must be what outputs if dependsOn has not been unlocked yet.

const sign = new Thing(
  "sign",
  ["unread", "read"],
  ["read"],
  [
    "Welcome to Burlington Code Academy! Come on up to the second floor. If the door is locked, use the code 12345.",
    "You don't remember reading the sign? The code for the door is 12345!"
  ],
  "That would be selfish. How will other students find their way?"
);
const lock = new Thing(
"12345", 
["locked", "unlocked"], 
["code", "enter", "key"],
["Bzzzzt! The door is still locked!", "Success! The door unlocks!.", "It is already unlocked!"], 
"Wrong code. Try again.",
sign);

const door = new Thing(
  "door",
  ["closed", "opened"],
  ["open"],
  ["The door is locked.", "Success! The door opens. You enter the foyer and the door shuts behind you.", "The door is already open!"],
  " ",
  lock
);

const paper = new Thing(
  "paper",
  ["not picked up", "picked up"],
  ["take", "read", "pick"],
  ["You pick up the paper and leaf through it looking for comics and ignoring the articles, just like everybody else does.", "You already took the paper"],
  " ",
);

const MainSt182 = new Room(
  "182 Main St.\n You are standing on Main Street between Church and South Winooski. There is a door here. A keypad sits on the handle. On the door is a handwritten sign.",
  { north: null, south: null, east: null, west: null },
  [door, sign, lock]
);

const Foyer = new Room(
  "You are in a foyer. Or maybe it's an antechamber. Or a vestibule. Or an entryway. Or an atrium. Or a narthex. But let's forget all that fancy flatlander vocabulary, and just call it a foyer. In Vermont, this is pronounced 'FO-ee-yurr'. A copy of Seven Days lies in a corner.",
  { },
  [paper]
);
const user = new Player("good", MainSt182);
// { food: null, weapons: null, misc: null }



ask = questionText =>
  new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });

const startGame = async () => {
  console.log("You are here: " + user.location.description);
  console.log("\n");
  let input = await ask("> ");
  let inputArray = input.split(" ");

  // option to quit
  if(input === "quit" || input === "end" || input === "exit"){
    process.exit();
  }
  let item = user.location.inventoryItem(inputArray);
  if (user.isInputValid(inputArray)) {
      user.outputMessage(item);
      console.log("\n");
  }else{
    console.log("error");
  }
  // else outputError message
  /*
    else if (item || action && inputArray.length > 1) {
      console.log(`You can't ${inputArray.join(" this ")}.`, item.error);
    } else {
      console.log("Sorry, I did not understand.");
  }*/
  startGame();
};

startGame();