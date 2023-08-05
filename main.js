const rl = require("readline");
const readline = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function coordinateToIndex(coor = "") {
  if (coor.length < 1) throw new Error("Please enter a coordinate.");
  let character = coor[0].toLowerCase();
  let num = Number(coor.slice(1, 3));
  let alpha = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];
  let index = alpha.indexOf(character) * 12 + num;
  return index;
}
function indexToCoord(index = 0) {
  if (index == 0) throw new Error("Please enter an index.");
  let alpha = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];
  let characterIndex = index <= 12 ? 0 : Math.floor(index / 12);
  let coordNum = index % 12;
  let coord = alpha[characterIndex] + coordNum.toString();
  return coord;
}
function evaluate(object = { x: [0], o: [0] }) {
  //*Validation of function input
  if (object == {}) throw new Error("Please enter the moves object");
  let moveCost = [11, 12, 13, 1];
  let threats = [];
  let score = 0;
  //* finds all the chains that are more than 1
  for (let property in object) {
    let chains = [];
    /**
     * *threats[0] == O
     * *threats[1] == X
     * *if o is better than x, lower_threat - higher_threat = neg
     * *Thus is eval is negetive, o is stronger; vice versa
     */
    let chain = new Set();
    for (let i = 0; i < object[property].length - 1; i++) {
      let cost = object[property][i] - object[property][i + 1];
      if (moveCost.includes(Math.abs(cost))) {
        chain.add(object[property][i]);
        chain.add(object[property][i + 1]);
      } else if (Array.from(chain).pop() == object[property][i]) {
        chains.push(Array.from(chain));
        chain.clear();
      }
    }
    //*threat calculation
    let threat = 0;
    for (let i = 0; i < chains.length; i++) {
      let calculatingThreat = chains[i].length;
      let highest = Math.max(chains[i]);
      let lowest = Math.min(chains[i]);
      let cost = (highest - lowest) / (chains.length - 1);
      for (let p in object) {
        if (object[p].includes(lowest - cost)) {
          calculatingThreat--;
        }
        if (object[p].includes(highest - cost)) {
          calculatingThreat--;
        }
      }
      if (calculatingThreat >= 4) {
        threat = 1000;
        break;
      } else threat += calculatingThreat;
    }
    threats.push(threat);
  }
  score = threats[0] - threats[1];
  let perspective = object.x.length > object.o.length ? 1 : -1;
  return score * perspective;
}
function search(depth = 0, object = { x: [0], o: [0] }, totalMoves = [0]) {
  if (depth == 0) return evaluate(object);
  let start = Date.now();
  let validMoves = [0, 0];
  let eval = 0;
  let bestEvalForO = 100000000000;
  let bestEvalForX = -1000000000;
  let moveCost = [11, 12, 13, 1, -1, -11, -12, -13];
  for (let i in totalMoves) {
    for (let j in moveCost) {
      if (totalMoves.includes(totalMoves[i] + moveCost[j])) continue;
      else {
        totalMoves.push(totalMoves[i] + moveCost[j]);
        let lowest = Infinity;
        let flag = "";
        for (let p in object) {
          if (object[p].length < lowest) flag = p;
        }
        object[flag].push(totalMoves[i] + moveCost[j]);
        eval = -search(depth - 1, object, totalMoves);
        let oldEvals = [bestEvalForX, bestEvalForO];
        if (oldEvals[0] < bestEvalForX) {
          validMoves[0] = totalMoves[i] + moveCost[j];
        }
        if (oldEvals[1] > bestEvalForO) {
          validMoves[1] = totalMoves[i] + moveCost[j];
        }
        bestEvalForX = Math.max(eval, bestEvalForX);
        bestEvalForO = Math.min(eval, bestEvalForO);
        totalMoves.pop();
        object[flag].pop();
      }
    }
  }
  return Math.floor((Date.now() - start) / 1000);
}
function engine(index = 0, totalMoves = { x: [0], o: [0] }) {
  //*Validation of function input
  if (index == 0) throw new Error("Please enter an index.");
  if (totalMoves == {}) throw new Error("Please enter the total moves object");
  //*engine plays first move
  if (totalMoves.length < 1) return Math.floor(Math.random() * 144);
}
function startEngine() {
  let end = false;
  let totalMoves = { x: [], o: [] };
  while (!end) {
    readline.question("What is the first coordinate?", async (ans) => {
      await totalMoves.x.push(coordinateToIndex(ans));
      const res = await engine(coordinateToIndex(ans), totalMoves);
      totalMoves.o.push(coordinateToIndex(res));
      console.log(res);
    });
  }
}
let test = {
  o: [1, 2, 19, 24, 11, 44, 23, 33, 9],
  x: [10, 12, 17, 20, 21, 30, 40, 41, 42, 43],
};
let moves = [
  10, 11, 12, 19, 20, 21, 30, 40, 1, 2, 24, 17, 44, 23, 33, 41, 42, 43,
];
console.log(search(4, test, moves));
module.exports = { coordinateToIndex, engine, indexToCoord };
