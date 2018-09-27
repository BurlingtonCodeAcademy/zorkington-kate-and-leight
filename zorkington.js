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
    if (
      this.location.inventoryItem(input) &&
      inputArray.includes(this.location.inventoryItem(input).action)
    ) {
      // console.log(this.message[0]);
      return true;
    } else if (inputArray.length === 2) {
      console.log(`You can't ${inputArray.join(" this ")}.`, this.location.inventoryItem(input).error);
    } else {
      console.log("I did not understand.");
    }
    return false;
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
  isInputValid(input) {
    let inputArray = input.split(" ");
    if (
      user.location.inventoryItem(input) &&
      inputArray.includes(this.action)
    ) {
      // console.log(this.message[0]);
      return true;
    } else if (inputArray.length === 2) {
      console.log(`You can't ${inputArray.join(" this ")}.`, this.error);
    } else {
      console.log("I did not understand.");
    }
    return false;
  }
  canStatusBeChanged() {
    if ((this.dependsOn && this.dependsOn.status.length > 1)|| this.status.length ===1) {
      return false;
    } 
    return true;
  }
  updateStatus() {
    console.log(this.canStatusBeChanged());
    if(this.dependsOn){
      console.log(this.dependsOn.status);
    }

    if (this.canStatusBeChanged() === false) {
      console.log(this.message[0]);
      return;
    } else {
      // if there is a dependsOn variable and it is unlocked, shift message of this.
      if(this.dependsOn && this.dependsOn.status.length === 1 && this.message.length > 1){
        this.message.shift();
      }
      console.log(this.message[0]);
      if (this.message.length > 1) {
        this.message.shift();
        this.status.shift();
      }
    }
  }
}

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

const door = new Thing(
  "door",
  ["closed", "open"],
  "open",
  ["The door is locked.", "You opened the door!"],
  " ",
  sign
);

const MainSt182 = new Room(
  "182 Main St.\n You are standing on Main Street between Church and South Winooski. There is a door here. A keypad sits on the handle. On the door is a handwritten sign.",
  { north: null, south: null, east: null, west: null },
  [door, sign]
);

const user = new Player("good", MainSt182);
// { food: null, weapons: null, misc: null }



ask = questionText =>
  new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });


const startGame = async () => {
  console.log("You are here: " + user.location.description);
  let input = await ask("> ");
  
  if (user.isInputValid(input)) {
    user.location.inventoryItem(input).updateStatus(input);
  } else {
    user.sorry(input);
  }
  startGame();
};

startGame();
