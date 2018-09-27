const colors = require('colors');

const wrap = (original, width) => {
  const words = original.split(" ");
  const lengths = words.map(word => word.length);
  const newString = [];
  let col = 0;
  let i = 0;
  while (i < words.length) {
    col += lengths[i];
    if (col > width) {
      newString.push("\n");
      col = words[i].length;
    } else {
      newString.push(" ");
    }
    newString.push(words[i]);
    i += 1;
  }
  return newString.join("").trim();
};



const assert = (value, why) => {
  if (value) {
    console.log('Success: '.green + why);
  } else {
    console.error(new Error('Failure: '.red + why));
  }
};

assert(wrap("") === "", "empty string");
assert(
  wrap("avocado toast", 20) === "avocado toast",
  "string is less than the width"
);

assert(
  wrap("avocado toast", 10) === "avocado\ntoast",
  "with two words, if the second crosses boundary"
);

assert(
  wrap("steel cut oats", 10) === "steel cut\noats",
  "three words over the width"
);

assert(
  wrap("steel cut oats", 5) === "steel\ncut\noats",
  "three words on three lines"
);

assert(
  wrap(
    "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit",
    10
  ) ===
    "Neque porro\nquisquam\nest qui\ndolorem\nipsum quia\ndolor sit\namet,\nconsectetur,\nadipisci\nvelit",
  "paragraph"
);
