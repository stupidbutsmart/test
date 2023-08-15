const rl = require("readline");
const readline = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});
let validMoves = [1, 1];
// let board = [' abcdefghijkl'];
// let empty = ".";
// let x = "x";
// let o = "o";
// //create board
// for (let i = 0; board.length < 13; i++) {
//   let row = [board.length];
//   for (let j = 0; row.length < 13; j++) {
//     row.push(empty);
//   }
//   board.push(row.join(''));
// }
// console.log(board.join('\n'));
function coordinateToIndex(coor = "") {
  //*Validation of function input
  if (coor.length < 1) throw new Error("Please enter a coordinate.");
  let character = coor[0].toLowerCase();
  let num = Number(coor.slice(1, 3));
  let alpha = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];
  let index = alpha.indexOf(character) * 12 + num;
  return index;
}
function indexToCoord(index = 0) {
  //*Validation of function input
  if (index == 0) throw new Error("Please enter an index.");
  let alpha = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];
  let characterIndex = index <= 12 ? 0 : Math.floor(index / 12);
  let coordNum = index % 12 == 0 ? 12 : index % 12;
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
    //* finding chains within the moves played
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
        if (object[p].includes(highest + cost)) {
          calculatingThreat--;
        }
      }
      //*considers borders of the board
      if (highest % 12 == 0 || Math.floor(highest / 12) == 11) {
        calculatingThreat--;
      }
      if ((lowest - 1) % 12 == 0 || lowest < 12) {
        calculatingThreat--;
      }
      if (calculatingThreat >= 4) {
        threat = 1000;
        break;
      }
      threat += calculatingThreat;
    }
    threats.push(threat);
  }
  score = threats[0] - threats[1];
  // let perspective = object.x.length > object.o.length ? 1 : -1;
  return score 
}
function search(depth = 0, object = { x: [0], o: [0] }, totalMoves = [0]) {
  if (depth == 0) return evaluate(object);
  let eval = 0;
  let bestEvalForO = Infinity;
  let bestEvalForX = -Infinity;
  let moveCost = [11, 12, 13, 1, -1, -11, -12, -13];
  for (let i in totalMoves) {
    //*considers movement issues with the left and right borders
    let right = [1, 13, -11];
    let left = [-1, -13, 11];
    let flag = 0;
    if (totalMoves[i] % 12 == 0) {
      moveCost = moveCost.filter((x) => !right.includes(x));
      flag = 1;
    } else if ((totalMoves[i] - 1) % 12 == 0) {
      moveCost = moveCost.filter((x) => !left.includes(x));
      flag = 2;
    }
    for (let j in moveCost) {
      let m = totalMoves[i] + moveCost[j];
      //*considers boarders (top bottom)
      if (m > 144 || m < 1) continue;
      if (totalMoves.includes(m)) continue;
      else {
        totalMoves.push(m);
        let lowest = Infinity;
        let flag = "";
        for (let p in object) {
          if (object[p].length < lowest) flag = p;
        }
        object[flag].push(m);
        let oldEvals = [bestEvalForX, bestEvalForO];
        eval = -search(depth - 1, object, totalMoves);
        bestEvalForX = Math.max(eval, bestEvalForX);
        bestEvalForO = Math.min(eval, bestEvalForO);
        if (oldEvals[0] < bestEvalForX) {
          validMoves[0] = m;
        }
        if (oldEvals[1] > bestEvalForO) {
          validMoves[1] = m;
        }
        totalMoves.pop();
        object[flag].pop();
      }
    }
    switch (flag) {
      case 1:
        moveCost.concat(right);
        break;
      case 2:
        moveCost.concat(left);
      default:
        break;
    }
  }
  return validMoves;
}
async function engine(
  index = 0,
  totalMoves = { x: [0], o: [0] },
  moves = [],
  depth = 1
) {
  //*engine always plays second */
  //*Validation of function input
  if (index == 0) throw new Error("Please enter an index.");
  if (totalMoves == {}) throw new Error("Please enter the total moves object");
  if (moves.length < 1) throw new Error("Please enter the moves array.");
  //*engine plays first move
  // if (moves.length < 1) return Math.floor(Math.random() * 144);
  let searching = await search(depth, totalMoves, moves);
  console.log(searching);
  return searching[0];
}
async function prompt(totalMoves, moves, a, depth) {
  await readline.question(`What is your #${a} move? `, async (ans) => {
    await totalMoves.x.push(coordinateToIndex(ans));
    moves.push(coordinateToIndex(ans));
    let start = Date.now();
    const res = await engine(coordinateToIndex(ans), totalMoves, moves, depth);
    totalMoves.o.push(indexToCoord(res));
    moves.push(res);
    console.log(
      `The engine plays ${indexToCoord(res)} and took ${
        (Date.now() - start) / 1000
      }s to run`
    );
    prompt(totalMoves, moves, a + 1, depth);
  });
}
async function startEngine() { //runs in console
  let totalMoves = { x: [], o: [] };
  let moves = [];
  let coordMoves = [];
  let a = 1;
  readline.question("What depth would you like to play at? ", (ans) => {
    prompt(totalMoves, moves, a, ans);
  });
  readline.on("close", () => {
    for (let i = 0; i < moves.length; i++) {
      let count = Math.ceil(moves.indexOf(moves[i]) + 1 / 2);
      coordMoves.push(`#${count} ${indexToCoord(moves[i])}`);
    }
    console.log(`The total moves are ${coordMoves}`);
  });
  return;
}
startEngine();
module.exports = { coordinateToIndex, engine, indexToCoord };
