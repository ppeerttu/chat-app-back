const bcrypt = require('bcrypt');
const saltRounds = 12;
const abcs = 'abcdefghijklmnopqrstuvwxyzåäöABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ0123456789';
const size = abcs.length;
let passwords = [];

for (let i = 0; i < 10; i++) {
  let word = '';
  for (let j = 0; j < 6; j++) {
    word = word + abcs[Math.floor(Math.random() * size)];
  }
  passwords.push(word);
}

console.log('Passwords: ' + passwords);

console.log('\n\nEncrypting test--------------------------------------------\n\n\n');
let startTime = Date.now();

const hashWords = passwords.map(word => {
  let hash = bcrypt.hashSync(word, saltRounds);
  console.log(hash);
  return hash;
});

let endTime = Date.now();
let overallTime = endTime - startTime;

console.log('Overall time: ' + overallTime + 'ms');
let avgTime = overallTime / passwords.length;
console.log('Average time for hashing with ' + saltRounds + ' rounds: ' + avgTime + 'ms');

console.log('\n\nComparing test--------------------------------------------------\n\n\n');
startTime = Date.now();

for (let i = 0; i < passwords.length; i++) {
  console.log(bcrypt.compareSync(passwords[i], hashWords[i]));
}

endTime = Date.now();
overallTime = endTime - startTime;

console.log('Overall time: ' + overallTime + 'ms');
avgTime = overallTime / passwords.length;
console.log('Average time for comparing a word with a hash: ' + avgTime + 'ms');
