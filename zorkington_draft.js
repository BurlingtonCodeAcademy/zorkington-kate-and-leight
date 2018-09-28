const readline = require("readline");
const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
class Room {
  constructor(description, connections, inventory, dependsOn = null) {
    this.description = description;
    this.connections = connections;
    this.inventory = inventory;
    this.dependsOn = dependsOn;
  }
  roomInventory(inputArray) {
    for (let i = 0; i < this.inventory.length; i++) {
      if (inputArray.includes(this.inventory[i].name)) {
        return this.inventory[i];
      }
    }
  }
}
class Player {
  constructor(status, location, inventory = []) {
    this.status = status;
    this.location = location;
    this.inventory = inventory;
  }
  playerInventory(inputArray) {
    for (let i = 0; i < this.inventory.length; i++) {
      if (inputArray.includes(this.inventory[i].name)) {
        return this.inventory[i];
      }
    } return;
  }
  displayInventory(){
    console.log("You are carrying:")
    if(this.inventory.length < 1){
      console.log("nothing.")
    } else{
      for (let item of this.inventory) {
        console.log(item.name);
      }
    }
  }
  // checking if user input contains direction words for the room ('north...')
  // can we move to room? if true, moves room
  checkRoom(input){
    let newLocation;
    for (let direction in this.location.connections) {
      if (input.includes(direction)) {
        newLocation = direction;
        // are we allowed to move that direction yet? Has depondsOn been unlocked?
        if( this.location.dependsOn == null || this.location.dependsOn.status.length === 1){
          if(newLocation){
            this.location = this.location.connections[newLocation];
            return true;
        }
        }
      }
    } 
    return false;
  }
  // checks if item exists 
  // checks if action exists
  // returns true if both item and action are entered 
  isInputValid(input) {
    if(input.includes("inventory")){
      this.displayInventory();
      return false;
    };
    let item = this.location.roomInventory(input) || this.playerInventory(input);
    if (item){
      let action = item.actionWord(input);
      if (action){
        if (action === "take" || action === "add"){
          this.addToInventory(item);
        } 
        if (action == "drop" || action == "leave"){
          this.dropFromInventory(item);
        }
        return true;
      } else {
        console.log(`You can't ${input.join(" this ")}.`, item.error);
      }
    }else {
      user.sorry(input.join(" "));
      return false;
    }
  }
  handleInput(item, array){   
    if(!item.canStatusBeChanged()){
      console.log(item.message[0])
    } else {
      if(item.dependsOn && !item.dependsOn.isLocked() && item.message.length>1){
        item.message.shift()
      }
      console.log(item.message[0]);

      if(item.message.length >1){
        item.updateStatus(item);
      }
    }
  }
  // adds item to user.inventory, and removes item from room
  addToInventory(item){
    item.action.splice(0, 2, 'drop', 'leave');
    console.log(item.action);
    this.inventory.push(this.location.inventory.pop());
    // remove add words
    console.log(`${item.name} added to your inventory`);
  }
  dropFromInventory(item){
    item.action.splice(0, 2, 'add', 'take');
    console.log(item.action);
    item.status.unshift["picked up"]
    this.location.inventory.push(this.inventory.pop());
    console.log(`${item.name} dropped from your inventory`);
  }
  sorry(verb) {
    console.log(`I don't know how to ${verb}.`);
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
  ["The door is locked.", "Success! The door opens. There's a foyer ahead of you to the north", "The door is already open!"],
  " ",
  lock
);

const paper = new Thing(
  "paper",
  ["not picked up", "picked up"],
  ["take", "add", "read"],
  ["You pick up the paper and leaf through it looking for comics and ignoring the articles, just like everybody else does."],
  " ",
);
Foyer = new Room(
  "You are in a foyer. Or maybe it's an antechamber. Or a vestibule. Or an entryway. Or an atrium. Or a narthex. But let's forget all that fancy flatlander vocabulary, and just call it a foyer. In Vermont, this is pronounced 'FO-ee-yurr'. A copy of Seven Days lies in a corner.",
  { north: null, south: null, east: null, west: null},
  [paper]
);

// take-able items at end of array!
MainSt182 = new Room(
  "182 Main St.\n You are standing on Main Street between Church and South Winooski. There is a door here. A keypad sits on the handle. On the door is a handwritten sign.",
  { north: Foyer, south: null, east: null, west: null },
  [door, sign, lock],
  door
);


const user = new Player("good", MainSt182);
// { food: null, weapons: null, misc: null }



ask = questionText =>
  new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });

const startGame = async () => {
  Foyer.connections.south = MainSt182;

  console.log("You are here: " + user.location.description);
  console.log("\n");
  let input = await ask("> ");
  let inputArray = input.split(" ");

  // option to quit
  if(input === "quit" || input === "end" || input === "exit"){
    process.exit();
  }
  let item = user.location.roomInventory(inputArray) || user.playerInventory(inputArray);

/*
checks if user wants to change room -- if checkRoom is true, moves, else does not
then checks item from input, and allowed action words for item.
handles input -- item action ("open door") - display message
              -- add item ("add paper") -- add to user.inventory, drop from user.location.inventory
              -- drop item ("drop paper") -- drops from user.inventory, adds to user.location.inventory

*/

  if(user.checkRoom(inputArray)){
    console.log("checking if can change room");
//checks if input is valid, ie if action words match objects
// handles input - does appropriate action 
  } else if (user.isInputValid(inputArray)) {
      user.handleInput(item, inputArray);
      console.log("\n");
  } 
  startGame();
};

startGame();