const readline = require("readline");
const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
class Room {
  constructor(name, description, connections, inventory, dependsOn = null) {
    this.name = name;
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
};
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
    } else {
      for (let item of this.inventory) {
        console.log(item.description);
      }
    }
    console.log("\n");
  }
  displayStatus(){
    console.log(`You are feeling ${this.status}`);
  };
  // returns true if user can move in a given direction and updates user's location
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
  // checks if input contains item and action associated with that item
  // returns true if both item and action are entered, else error message
  // definitely need to refactor this..
  isInputValid(input) {
    if(input.includes("inventory")){
      this.displayInventory();
      return false;
    };
    if(input.includes("status")){
      this.displayStatus();
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
  // outputs message to user depending on user's action on item
  // shifts message associated with item, and updates status of item
  handleInput(item, array){   
    if(!item.canStatusBeChanged()){
      console.log(item.message[0])
    } else {
      if(item.dependsOn && !item.dependsOn.isLocked() && item.message.length>1){
        item.message.shift();
        if(item.userStatus){
          item.changeUserStatus();
        }
      }
      console.log(item.message[0]);
      if(item.message.length >1){
        item.updateStatus(item);
      }
    }
  }
  // adds item to user's inventory, removes item from room, updates allowed words 
  addToInventory(item){
    item.action.splice(0, 2, 'drop', 'leave');
    this.inventory.push(this.location.inventory.pop());
    //let index = this.location.inventory.indexOf(item);
    //this.inventory.push(this.location.inventory.splice(index, 1));
    item.message.unshift("Now in inventory");
    console.log(`${item.name} added to your inventory`);
  }
  // drops item from user's inventory, adds item to room, updates allowed words, shifts status
  dropFromInventory(item){
    item.action.splice(0, 2, 'add', 'take');
    this.location.inventory.push(this.inventory.pop());
    //let index = this.inventory.indexOf(item);
    //this.location.inventory.push(this.inventory.splice(index, 1));
    console.log(`${item.name} dropped from your inventory.`);
    item.message.unshift(`in ${this.location.name}`);
  }
  // error message when doesn't recognize input "Sorry...!"
  sorry(verb) {
    console.log(`Sorry, I don't know how to ${verb}.`);
  }
};

class Thing {
  constructor(name, status, action, message, error, otherThing = null, userStatus = null) {
    this.name = name;
    this.status = status;
    this.action = action;
    this.message = message;
    this.error = error;
    this.dependsOn = otherThing;
    this.userStatus = userStatus;
  }
  actionWord(inputArray) {
    for (let i = 0; i < this.action.length; i++) {
      if (inputArray.includes(this.action[i])) {
        return this.action[i];
      }
    }
  }
  // if an item is locked, user has not interacted with it yet (or it has been dropped from inventory)
  isLocked() {
    if (this.status.length === 1){
      return false;
    } else {
      return true;
    }
  }
  // returns true if the item's dependsOn item is unlocked, false if locked
  canStatusBeChanged() {
    if(this.isLocked()){
      if(this.dependsOn && this.dependsOn.isLocked()){
        return false;
      } 
      return true;
    }
    return false;
  }
  // shifts status and message of item
  updateStatus() {
    this.status.shift();
    this.message.shift();
  }
  changeUserStatus(){
    user.status = this.userStatus;
  }
};

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
["enter", "code", "key"],
["Bzzzzt! The door is still locked!", "Success! The door unlocks!.", "It is already unlocked!"], 
"Bzzzzt! The door is still locked.",
sign);

const door = new Thing(
  "door",
  ["closed", "opened"],
  ["open"],
  ["The door is locked. There is a keypad on the door handle", "Success! The door opens. There's a foyer ahead of you just inside.", "The door is already open!"],
  " ",
  lock
);

const paper = new Thing(
  "paper",
  ["not picked up", "picked up"],
  ["take", "add", "read"],
  ["You pick up the paper and leaf through it looking for comics and ignoring the articles, just like everybody else does.", "You've read today's paper."],
  " ",
);
const coffee = new Thing(
  "coffee",
  ["in Muddy's", "with Alex"],
  ["add", "take", "buy", "get"],
  ["Alex says Thank You :)", "The coffee at Muddy's was worth the $4.00"],
  "Coffffeeeeeeeee",
);
const alexC = new Thing(
  "alex",
  ["speaking gibberish", "speaking clearly"],
  ["caffeinate", "give", "coffee", "help"],
  ["Loopeu doopeu shoopeu loo. Alex C really needs coffee. You don't have any coffee", "Alex feels so much better after drinking coffee! You finally understand him. Now you can enjoy the lecture and feel less confused. (Maybe).", "Alex has had plenty of coffee."],
  " ",
  coffee,
);
const lecture = new Thing(
  "lecture",
  ["not attended", "attended"],
  ["attend", "sit", "stand", "listen", "enjoy"],
  ["Loopeu doopeu shoopeu loo. Alex is still speaking gibberish.", "Welcome to the lecture on how to write your own tests in Javascript!", "Are you learning anything?"],
  " ",
  alexC,
  "hungry. Grrrrowl."
);

const pizza = new Thing(
  "pizza",
  ["not eaten", "eaten"],
  ["add", "take", "buy", "eat", "order"],
  ["The smell is intoxicating, but you aren't hungry yet.", "Good choice! Yum yum in your tum tum.", "Yummy yummy yum yum"],
  " ",
  lecture,
  "good"
);


Foyer = new Room(
  "Foyer. \n",
  "You are in a foyer. Or maybe it's an antechamber. Or a vestibule. Or an entryway. Or an atrium. Or a narthex. But let's forget all that fancy flatlander vocabulary, and just call it a foyer. In Vermont, this is pronounced 'FO-ee-yurr'. A copy of Seven Days lies in a corner. There are stairs ahead.",
  { },
  [paper]
);

// Note: put take-able items at end of array!
MainSt182 = new Room(
  "182 Main St.\n",
  "You are standing on Main Street between Church and South Winooski. There is a door here. A keypad sits on the handle. On the door is a handwritten sign.",
  {inside : Foyer},
  [door, sign, lock],
  door
);

BurlingtonCodeAcademy = new Room(
  "Burlington Code Academy.\n",
  "Alex C. speaks gibberish until he has a coffee from Muddy's",
  {downstairs : Foyer },
  [alexC, lecture],
);

MuddyWaters = new Room(
  "Muddy Waters.\n",
  "The local hub for a deliciously strong brew. Exposed beams and rustic wood floors make this funky coffeehouse feel more like a tree house. \n ",
  {west : MainSt182},
  [coffee],
);

MrMikesPizza = new Room(
  "Mr. Mike's Pizza.\n", 
  "Longtime pizza place offering daily specials and craft beer. On the corner of Main St and South Winooski Ave. \n ",
  {west : MuddyWaters},
  [pizza],
);

const user = new Player("good", MainSt182);

ask = questionText =>
  new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });

const startGame = async () => {
  Foyer.connections.outside = MainSt182;
  Foyer.connections.upstairs = BurlingtonCodeAcademy;
  MainSt182.connections.east = MuddyWaters;
  MuddyWaters.connections.east = MrMikesPizza;
  paper.description = "A copy of Seven Days, Vermont's Alt-Weekly"
  coffee.description = "A hot, aromatic brew of locally roasted dark-roast coffee"
  pizza.description = "A slice of pizza from the local pizzeria"

  if (user.status != "good"){
    user.displayStatus();
  }
  console.log("You are here: " + user.location.name + user.location.description);
  console.log("\n");
  let input = await ask("> ");
  let inputArray = input.split(" ");

  // option to quit
  if(input === "quit" || input === "end" || input === "exit"){
    process.exit();
  }
  let item = user.location.roomInventory(inputArray) || user.playerInventory(inputArray);

  if(user.checkRoom(inputArray)){
  } else if (user.isInputValid(inputArray)) {
      user.handleInput(item, inputArray);
      console.log("\n");
  } 
  startGame();
};

startGame();