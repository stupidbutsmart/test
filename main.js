const rl = require("readline");
const readline = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const fs = require("fs");
let bestMove = 0;
//!all of below is redundant now, try to create a working evaluation first
// let board = [" abcdefghijkl"];
// let empty = ".";
// let x = "x";
// let o = "o";
// //create board
// for (let i = 0; board.length < 13; i++) {
//   let row = [board.length];
//   for (let j = 0; row.length < 13; j++) {
//     row.push(empty);
//   }
//   board.push(row.join(""));
// }
// board = board.join("\n");
// function makeMove(move = 0, a = "") {
//   //*validation
//   if (move < 1 || move > 144)
//     throw new Error("Move is not in range or invalid type.");
//   if (a.length !== 1) throw new Error("Your a is not x or o.");
//   for (let i in board) {
//     if (move == i) {
//       board[i] = a;
//     }
//   }
// }
function findValidMoves(totalMoves = [0]) {
  let validMoves = [];
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
      validMoves.push(m);
    }
    //*repairs the move cost
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
function log(path = "", msg = "") {
  if (path.length <= 1 || msg.lengt < 1)
    throw new Error("Path or message not entered.");
  fs.appendFile(path, `${msg}\n`, (err) => {
    if (err) throw err;
    else return;
  });
}
function checkForWin(object = { x: [0], o: [0] }) {
  //*Validation of function input
  if (object == {}) throw new Error("Please enter the moves object");
  let moveCost = [11, 12, 13, 1, -1, -13, -12, -11];
  let totalMoves = [];
  for (let p in object) {
    totalMoves.concat(object[p]);
  }
  for (let property in object) {
    let chains = [];
    //* finds all the chains that are more than 1
    //* finding chains within the moves played
    let chain = new Set();
    //*sort
    let sorted = [];
    for (let i in object[property]) {
      sorted.push(object[property][i]);
    }
    sorted = sorted.sort((a, b) => a - b);
    for (let i in sorted) {
      //*considers movement issues with the left and right borders
      let right = [1, 13, -11];
      let left = [-1, -13, 11];
      let flag = 0;
      if (sorted[i] % 12 == 0) {
        moveCost = moveCost.filter((x) => !right.includes(x));
        flag = 1;
      } else if ((sorted[i] - 1) % 12 == 0) {
        moveCost = moveCost.filter((x) => !left.includes(x));
        flag = 2;
      }
      for (let j in moveCost) {
        let m = sorted[i] + moveCost[j];
        //*considers boarders (top bottom)
        if (m > 144 || m < 1) continue;
        for (let k in sorted) {
          if (m == sorted[k]) {
            chain.add(sorted[i]);
            chain.add(sorted[k]);
            m += moveCost[j];
          }
        }
        chains.push(Array.from(chain));
        chain.clear();
      }
      //*repairs the move cost
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
    for (let i in chains) {
      if (chains[i].length == 5) return true;
    }
  }
  return false;
}
function checkForTurn(object = { x: [0], o: [0] }) {
  //*Validation of function input
  if (object == {}) throw new Error("Please enter the moves object");
  let lowest = Infinity;
  let flag = "";
  for (let p in object) {
    if (object[p].length < lowest) {
      flag = p;
      lowest = object[p].length;
    }
  }
  return flag;
}
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
  let moveCost = [11, 12, 13, 1, -1, -13, -12, -11];
  let score = 0;
  let p = checkForTurn(object) == "x" ? "o" : "x";
  let lastmove = object[p][object[p].length - 1];
  let threats = []; //* x is first o is second
  for (let property in object) {
    let chains = [];
    //* finds all the chains that are more than 1
    //* finding chains within the moves played
    let chain = new Set();
    //*sort
    let sorted = [];
    for (let i in object[property]) {
      sorted.push(object[property][i]);
    }
    sorted = sorted.sort((a, b) => a - b);
    for (let i in sorted) {
      //*considers movement issues with the left and right borders
      let right = [1, 13, -11];
      let left = [-1, -13, 11];
      let flag = 0;
      if (sorted[i] % 12 == 0) {
        moveCost = moveCost.filter((x) => !right.includes(x));
        flag = 1;
      } else if ((sorted[i] - 1) % 12 == 0) {
        moveCost = moveCost.filter((x) => !left.includes(x));
        flag = 2;
      }
      for (let j in moveCost) {
        let m = sorted[i] + moveCost[j];
        //*considers boarders (top bottom)
        if (m > 144 || m < 1) continue;
        for (let k in sorted) {
          if (m == sorted[k]) {
            chain.add(sorted[i]);
            chain.add(sorted[k]);
            m += moveCost[j];
          }
        }
        chains.push(Array.from(chain));
        chain.clear();
      }
      //*repairs the move cost
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
    //*threat calculation of your position (higher threat of YOUR position == higher win potential of YOUR position)
    //!negative infinity == lose
    let threat = 0;
    for (let i in chains) {
      let calculatingThreat = chains[i].length;
      let highest = Math.max(...chains[i]);
      let lowest = Math.min(...chains[i]);
      let cost = (highest - lowest) / (chains[i].length - 1);
      for (let p in object) {
        if (p == property) continue;
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
      let len = calculatingThreat;
      if (p !== property) {
        //defending evaluation
        let topBottom = lowest - cost == lastmove || highest + cost == lastmove;
        if (topBottom) {
          switch (len) {
            case 2:
              threat += 150;
              break;
            case 3:
              threat += 4000;
              break;
            case 4:
              threat += 4000;
            default:
              break;
          }
          break;
        } else {
          switch (len) {
            case 3:
              threat -= 4000;
              break;
            default:
              break;
          }
          break;
        }
      } else {
        //attack evalutaion
        if (chains[i].includes(lastmove)) {
          switch (len) {
            case 3:
              threat += 150;
              break;
            case 4:
              threat += 300;
              break;
            case 5:
              threat += 4000;
              break;
            default:
              break;
          }
        } else {
          switch (len) {
            case 3:
              threat -= 300;
              break;
            case 4:
              threat -= 4000;
              break;
            default:
              break;
          }
        }
      }
      threat += calculatingThreat;
    }
    threats.push(threat);
  }
  let perspective = object.x.length > object.o.length ? -1 : 1;
  score = threats[1] - threats[0];
  return score * perspective;
}
function search(
  depth = 0,
  object = { x: [0], o: [0] },
  totalMoves = [0],
  maximizingPlayer = true,
  alpha,
  beta
) {
  //*maximizingPlayer == true means maximise for x. If we are searching best eval for o then we want min for x and max for o
  //!this search function uses pure minimax algoritm, try running at a lower depth to avoid long evaluations later into the game
  if (depth == 0 || checkForWin(object)) return evaluate(object);
  let eval = 0;
  let bestEvals = [-Infinity, Infinity]; //o is first
  let arr = findValidMoves(totalMoves);
  for (let i in arr) {
    let m = arr[i];
    if (maximizingPlayer) {
      totalMoves.push(m);
      let flag = checkForTurn(object);
      object[flag].push(m);
      let oldEvals = bestEvals[0];
      eval = search(depth - 1, object, totalMoves, false);
      bestEvals[0] = Math.max(eval, oldEvals);
      if (bestEvals[0] > oldEvals) bestMove = m;
      totalMoves.pop();
      object[flag].pop();
    } else {
      totalMoves.push(m);
      let flag = checkForTurn(object);
      object[flag].push(m);
      let oldEvals = bestEvals[1];
      eval = search(depth - 1, object, totalMoves, true);
      bestEvals[1] = Math.min(eval, oldEvals);
      if (bestEvals[1] < oldEvals) bestMove = m;
      totalMoves.pop();
      object[flag].pop();
    }
  }
  return bestEvals[maximizingPlayer ? 0 : 1];
}

async function engine(
  index = 0,
  totalMoves = { x: [0], o: [0] },
  moves = [],
  depth = 1
) {
  //*engine always plays second
  //*Validation of function input
  if (index == 0) throw new Error("Please enter an index.");
  if (totalMoves == {}) throw new Error("Please enter the total moves object");
  if (moves.length < 1) throw new Error("Please enter the moves array.");
  // //engine plays first move
  // // if (moves.length < 1) return Math.floor(Math.random() * 144);
  let maximizingPlayer = depth % 2 == 1;
  let searching = await search(depth, totalMoves, moves, maximizingPlayer);
  return searching;
}
async function prompt(totalMoves, moves, a, depth) {
  const path = "./runLogs";
  await readline.question(`What is your #${a} move? `, async (ans) => {
    await totalMoves.x.push(coordinateToIndex(ans));
    moves.push(coordinateToIndex(ans));
    if (checkForWin(totalMoves)) {
      await console.log("You Win!");
      return readline.pause();
    }
    let start = Date.now();
    const res = await engine(coordinateToIndex(ans), totalMoves, moves, depth); //* the response provides evaluations not move.
    totalMoves.o.push(bestMove);
    moves.push(bestMove);
    log(
      path,
      `Iteration result: ${indexToCoord(bestMove)}\tEvalutaion: ${res}`
    );

    console.log(totalMoves);
    console.log(
      `The engine plays ${indexToCoord(
        bestMove
      )} with an evalutaion score of ${res} and took ${
        (Date.now() - start) / 1000
      }s to run`
    );
    if (checkForWin(totalMoves)) {
      await console.log("Computer Wins!");
      return readline.pause();
    }

    prompt(totalMoves, moves, a + 1, depth);
  });
}
(function startEngine() {
  //*runs in console
  let totalMoves = { x: [], o: [] };
  let moves = [];
  let coordMoves = [];
  let a = 1;
  readline.question("What depth would you like to play at? ", (ans) => {
    log("./runLogs", `[${new Date()}] The bot runs at depth ${ans}`);
    prompt(totalMoves, moves, a, ans);
  });
  readline.on("pause", () => {
    readline.resume();
    for (let i = 0; i < moves.length; i++) {
      let count = Math.ceil(moves.indexOf(moves[i]) + 1 / 2);
      coordMoves.push(`#${count} ${indexToCoord(moves[i])}`);
    }
    log("./runLogs", `Game end. Moves :${JSON.stringify(totalMoves)}`);
    console.log(`The total moves are ${coordMoves}\n`);
    readline.question("Play again?(Y/N)", (ans) => {
      if (ans == "Y") startEngine();
      else process.exit(1);
    });
  });
  return;
})();
module.exports = { coordinateToIndex, engine, indexToCoord };
