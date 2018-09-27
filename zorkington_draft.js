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
  constructor(status, location, inventory = []) {
    this.status = status;
    this.location = location;
    this.inventory = inventory;
  }
  isInputValid(input) {
    let inputArray = input.split(" ");
    let item = this.location.inventoryItem(input);
    //console.log(item);
    if (item && inputArray.includes(item.action)) {
      return true;
    } else if (item && inputArray.length > 1) {
      console.log(`You can't ${inputArray.join(" this ")}.`, item.error);
    } else {
      console.log("Sorry, I did not understand.");
    }
    return false;
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
}
class Thing {
  constructor(name, status, action, message, error, otherThing = null) {
    this.name = name;
    this.status = status;
    this.action = action;
    this.message = message;
    this.error = error;
    this.dependsOn = otherThing;
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
}
// NOTE: if Thing dependsOn something, then first message must be what outputs if dependsOn has not been unlocked yet.

const sign = new Thing(
  "sign",
  ["unread", "read"],
  "read",
  [
    "Welcome to Burlington Code Academy! Come on up to the second floor. If the door is locked, use the code 12345.",
    "You don't remember reading the sign? The code for the door is 12345!"
  ],
  "That would be selfish. How will other students find their way?"
);
const lock = new Thing(
  "code", 
["locked", "unlocked"], 
"12345", 
["The lock requires a code. Try reading the sign", "Success! The door unlocks!.", "It is already unlocked!"], 
"Wrong code. Try again.",
sign);

const door = new Thing(
  "door",
  ["closed", "opened"],
  "open",
  ["The door is locked.", "You opened the door!", "The door is already wide open!"],
  " ",
  lock
);

const MainSt182 = new Room(
  "182 Main St.\n You are standing on Main Street between Church and South Winooski. There is a door here. A keypad sits on the handle. On the door is a handwritten sign.",
  { north: null, south: null, east: null, west: null },
  [door, sign, lock]
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
  // option to quit
  if(input === "quit" || input === "end" || input === "exit"){
    process.exit();
  }
  let item = user.location.inventoryItem(input);
  if (user.isInputValid(input)) {
      user.outputMessage(item);
      console.log("\n");
  }
  startGame();
};

startGame();