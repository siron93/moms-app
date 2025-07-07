// Images we have
const imageFiles = [
  'Bears Weight on Legs.png',
  'Brings Hands to Mouth.png',
  'Claps Hands.png',
  'Combines Two Words.png',
  'Crawls.png',
  'Discovers Feet.png',
  'Draws a Circle.png',
  'Feeds Self Finger Foods.png',
  'First Haircut.png',
  'First Laugh.png',
  'First Smile.png',
  'First Steps.png',
  'First Tooth.png',
  'First Word.png',
  'Gets Dressed by Self.png',
  'Grasps Finger.png',
  'Hops on One Foot.png',
  'Imitates Sounds.png',
  'Jumps with Two Feet.png',
  'Kicks a Ball.png',
  'Lifts Head.png',
  'Makes Babbling Sound.png',
  'Makes Cooing Sounds.png',
  'Passes Object Between Hands.png',
  'Plays Peek-a-Boo.png',
  'Pulls to a Stand.png',
  'Pushes Up on Arms.png',
  'Reaches for Toys.png',
  'Recognizes Caregiver.png',
  'Responds to Own Name.png',
  'Rides a Tricycle.png',
  'Rolls Over.png',
  'Says Several Single Words.png',
  'Scribbles with a Crayon.png',
  'Sings a Song.png',
  'Sits With Support.png',
  'Sits Without Support.png',
  'Stacks Several Blocks.png',
  'Starts to Run.png',
  'Tries Solid Food.png',
  'Uses Scissors.png',
  'Walks Confidently.png',
  'Waves "Bye-Bye".png',
  'crawling.png' // duplicate of Crawls.png
];

// Currently mapped
const currentlyMapped = [
  'Lifts Head',
  'Pushes Up on Arms',
  'Brings Hands to Mouth',
  'Grasps Finger',
  'First Smile',
  'Recognizes Caregiver',
  'Makes Cooing Sounds',
  'Rolls Over',
  'Sits With Support',
  'Sits Without Support',
  'Bears Weight on Legs',
  'Reaches for Toys',
  'Passes Object Between Hands',
  'First Laugh',
  'Responds to Own Name',
  'Makes Babbling Sounds',
  'Discovers Feet',
  'Tries Solid Food',
  'First Tooth',
  'Crawls',
  'Pulls to a Stand',
  'First Steps',
  'Feeds Self Finger Foods',
  'Plays Peek-a-Boo',
  'Claps Hands',
  'Waves "Bye-Bye"',
  'Imitates Sounds',
  'First Word',
  'Walks Confidently',
  'Kicks a Ball',
  'Starts to Run',
  'Scribbles with a Crayon',
  'Stacks Several Blocks',
  'Says Several Single Words',
  'Combines Two Words',
  'First Haircut',
  'Jumps with Two Feet',
  'Rides a Tricycle/Scooter',
  'Hops on One Foot',
  'Draws a Circle',
  'Uses Scissors',
  'Gets Dressed by Self',
  'Sings a Song'
];

console.log("Total images:", imageFiles.length);
console.log("Currently mapped:", currentlyMapped.length);
console.log("\nAll images normalized:");
const normalizedImages = imageFiles.map(f => f.replace('.png', '').toLowerCase()).filter(f => f !== 'crawling');
console.log(normalizedImages);

console.log("\nAll mapped normalized:");
const normalizedMapped = currentlyMapped.map(m => m.toLowerCase().replace('/', ''));
console.log(normalizedMapped);

console.log("\nImages not mapped:");
normalizedImages.forEach(img => {
  const found = normalizedMapped.some(mapped => 
    mapped === img || 
    mapped === img.replace(' ', '') ||
    (mapped === 'rides a tricyclescooter' && img === 'rides a tricycle')
  );
  if (!found) {
    console.log("-", img);
  }
});