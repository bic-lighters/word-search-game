import WordFind from './wordfind.js';
import {drawSelection, allWords, pickWords} from './utils.js';
import { upgrades, displayUpgrades} from './upgrades.js';

const wf = new WordFind();

const charSize = 40;
const halfChar = charSize / 2;

// Global variables 
let inputWords = ['chicken', 'burrito', 'candy', 'corn', 'abdicate']
let canvasHeight;
let canvasWidth;
let letters;
let selections = [];
let highlights = [];
let solution;
let points = 0;
let autoSelectIntervalID;
let autoSelectInterval = 0;
let highlightIntervalID;
let highlightInterval = 0;
let hasColorChanger = false;

let backgroundColor = '';
let textColor = 'white';


// Load from storage
if (localStorage.getItem('points')) {
  points = parseInt(localStorage.getItem('points'));
}
document.getElementById("points").innerHTML = points;
if (localStorage.getItem('upgrades')) {
  const storedUpgrades = JSON.parse(localStorage.getItem('upgrades'));
  for (const upg in storedUpgrades) {
    upgrades[upg].level = storedUpgrades[upg].level;
  }
}
if (localStorage.getItem('text-color')) {
  textColor = localStorage.getItem('text-color');
}
if (localStorage.getItem('background-color')) {
  backgroundColor = localStorage.getItem('background-color');
}


// Snap thing to grid of elements.
const gridAlign = num => Math.ceil(num/charSize) * charSize - halfChar;
// Get the position in the array of an aligned position.
const posToIndex = num => (num - halfChar) / charSize;
// Get the aligned position of an index in the array
const indexToPos = index => index * charSize + halfChar;

const drawLetters = (ctx) => {
  ctx.fillStyle = textColor;
  for (let row = 0; row < letters.length; row++) {
    for (let column = 0;  column < letters[row].length; column += 1) {
      const xPos = halfChar/2 + charSize * column;
      const yPos = 3 * halfChar/2 + charSize * row;
      ctx.fillText(letters[row][column], xPos, yPos);
    }
  }
}

const drawHighlight = (ctx, x, y, word) => {
  if (selections.find(x => x.word === word)) {
    return;
  }
  ctx.strokeStyle = "rgba(255, 255, 255, 0)";
  ctx.lineWidth = 0;
  ctx.beginPath();
  ctx.arc(indexToPos(x), indexToPos(y), halfChar, 0, 2 * Math.PI, false);
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fill();
  ctx.stroke();
}

const draw = ctx => {
  ctx.clearRect(0, 0, canvasHeight, canvasWidth)
  ctx.font = charSize + "px serif";
  drawLetters(ctx);
  selections.forEach(selection => drawSelection(ctx, selection.mouseStart, selection.mouseEnd, halfChar));
  highlights.forEach(highlight => drawHighlight(ctx, highlight.x, highlight.y, highlight.word));
}


const makeWordlist = () => {
  const wordlist = document.getElementById("wordlist");
  wordlist.innerHTML = '';
  inputWords.forEach(word => {
    const wnode = document.createElement('div');
    wnode.id = `wordlist-${word}`;
    wnode.innerHTML = word;
    wordlist.appendChild(wnode);
  })
}


const checkBoard = () => {
  document.getElementById("points").innerHTML = points;
  if(selections.length == inputWords.length) {
    console.log("done")
    points += upgrades.finishPuzzlePointGain.upgrades[upgrades.finishPuzzlePointGain.level].val;
    document.getElementById("points").innerHTML = points;
    reset(document.getElementById("canvas"));
  }
}


const makeSelection = (word) => {
  let foundWord = solution.found.find(x => x.word === word);
  let pos1 = {x: indexToPos(foundWord.x), y:indexToPos(foundWord.y)}
  const wPos2 = wf.orientations[foundWord.orientation](foundWord.x, foundWord.y, foundWord.overlap-1);
  let pos2 = {x: indexToPos(wPos2.x), y:indexToPos(wPos2.y)};
  checkWord({pos1, pos2})
  draw(document.getElementById("canvas").getContext('2d'));
}
window.makeSelection = makeSelection;

const checkWord = (selection) => {
  const pos1 = {x: posToIndex(selection.pos1.x), y:posToIndex(selection.pos1.y)}
  const pos2 = {x: posToIndex(selection.pos2.x), y:posToIndex(selection.pos2.y)}

  solution.found.forEach(word => {
    const wPos1 = {x: word.x, y:word.y};
    const wPos2 = wf.orientations[word.orientation](word.x, word.y, word.overlap-1);

    if (pos1.x === wPos1.x && pos1.y === wPos1.y && pos2.x === wPos2.x && pos2.y === wPos2.y
      || pos1.x === wPos2.x && pos1.y === wPos2.y && pos2.x === wPos1.x && pos2.y === wPos1.y) {
      if (selections.every(s => s.word != word.word)) {
        selections.push( {mouseStart: selection.pos1, mouseEnd: selection.pos2, word:word.word} );
        document.getElementById(`wordlist-${word.word}`).style["text-decoration"] = "line-through";
        points += upgrades.pointGain.upgrades[upgrades.pointGain.level].val(word.word);
        localStorage.setItem('points', points);
        checkBoard();
      }
    }
  })
}

/**
 * Adds event listeners to the canvas.
 */
const setup = (canvas, ctx, draw, checkWord) => {
  let mouseStart;
  canvas.addEventListener('mousedown', (e) => mouseStart = {x:gridAlign(e.offsetX), y:gridAlign(e.offsetY)});

  canvas.addEventListener('mousemove', (e) => {
    if (mouseStart) {
      draw(ctx);
      const mouseEnd = {x:gridAlign(e.offsetX), y:gridAlign(e.offsetY)};
      drawSelection(ctx, mouseStart, mouseEnd, halfChar);
      checkWord({pos1: mouseStart, pos2: mouseEnd}, checkWord);
    }
  });
  canvas.addEventListener('mouseup', (e) => {
    mouseStart = null;
    draw(ctx);
  });
  document.getElementById("word-search").addEventListener('mouseleave', (e) => {
    mouseStart = null;
    draw(ctx);
  });
    document.getElementById("word-search").addEventListener('mouseup', (e) => {
    mouseStart = null;
    draw(ctx);
  });


  canvas.addEventListener('touchstart', (e) => {
    var offsetX = e.targetTouches[0].pageX - e.target.getBoundingClientRect().left;
    var offsetY = e.targetTouches[0].pageY - e.target.getBoundingClientRect().top;
    mouseStart = {x:gridAlign(offsetX), y:gridAlign(offsetY)}
  })

  canvas.addEventListener('touchmove', (e) => {
    var rect = e.target.getBoundingClientRect();
    var offsetX = e.targetTouches[0].pageX - e.target.getBoundingClientRect().left;
    var offsetY = e.targetTouches[0].pageY - e.target.getBoundingClientRect().top;
    if (mouseStart) {
      draw(ctx);
      const mouseEnd = {x:gridAlign(offsetX), y:gridAlign(offsetY)};
      drawSelection(ctx, mouseStart, mouseEnd, halfChar);
      checkWord({pos1: mouseStart, pos2: mouseEnd}, checkWord);
    }
  });

  canvas.addEventListener('touchend', (e) => {
    mouseStart = null;
    draw(ctx);
  });
}

document.getElementById('clear-storage').onclick = () => {
  if (confirm('Would you like to remove all your data and restart the game?') == true) {
    localStorage.clear();
    clearInterval(autoSelectIntervalID);
    clearInterval(highlightIntervalID);
    alert("It's all gone. Refresh the page to start over.")
  }
};

document.getElementById('reset-puzzle').onclick = () => {
  reset(document.getElementById("canvas"));
}




const reset = (canvas) => {
  selections = [];
  highlights = [];

  inputWords = pickWords(
    allWords, 
    upgrades.numWords.upgrades[upgrades.numWords.level].val, 
    upgrades.maxLength.upgrades[upgrades.maxLength.level].val);

  letters = wf.newPuzzle(inputWords);
  solution = wf.solve(letters, inputWords);
  canvasHeight = charSize * letters.length;
  canvasWidth = charSize * letters[0].length;
  const context = canvas.getContext('2d');
  canvas.width = canvasWidth;
  document.getElementById("wordlist").style.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.dispatchEvent(new Event('mouseup'));
  draw(context);

  checkUpgrades();
  makeWordlist();
}

const checkAutoSelectInterval = () => {
  if (upgrades.autoSelectInterval.upgrades[upgrades.autoSelectInterval.level].val !== autoSelectInterval) {
    clearInterval(autoSelectIntervalID);
    autoSelectInterval = upgrades.autoSelectInterval.upgrades[upgrades.autoSelectInterval.level].val;
    autoSelectIntervalID = setInterval(() => {
      makeSelection(inputWords[Math.floor(Math.random() * inputWords.length)]);
    }, upgrades.autoSelectInterval.upgrades[upgrades.autoSelectInterval.level].val);
  }
}


const checkHighlightInterval = () => {
  if (upgrades.highlightInterval.upgrades[upgrades.highlightInterval.level].val !== highlightInterval) {
    clearInterval(highlightIntervalID);
    highlightInterval = upgrades.highlightInterval.upgrades[upgrades.highlightInterval.level].val;
    highlightIntervalID = setInterval(() => {
      const highlight = solution.found.find(w => !selections.find(x => x.word === w.word) && !highlights.includes(w));
      if (highlight) {
        highlights.push(highlight);
        draw(context);
      }

    }, upgrades.highlightInterval.upgrades[upgrades.highlightInterval.level].val);
  }
}

const checkColorChanger = () => {
  if (upgrades.hasColorChanger.upgrades[upgrades.hasColorChanger.level].val !== hasColorChanger)  {
    document.getElementById("change-color").style.display = "block";
    document.getElementById("color-input").onkeypress = (e) => {
      if (e.keyCode === 13) {
        document.body.style.background = document.getElementById("color-input").value;
        localStorage.setItem('background-color', document.getElementById("color-input").value)
      }
    }

    document.getElementById("text-input").onkeypress = (e) => {
      if (e.keyCode === 13) {
        document.body.style.color = document.getElementById("text-input").value;
        document.getElementById('word-search').style.borderColor = document.getElementById("text-input").value
        textColor = document.getElementById("text-input").value;
        localStorage.setItem('text-color', document.getElementById("text-input").value);

        draw(context);
      }
    }
  }
}


const checkUpgrades = () => {
  checkAutoSelectInterval();
  checkColorChanger();
  checkHighlightInterval();
}

document.body.style.background = backgroundColor;
document.body.style.color = textColor;
const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');
setup(canvas, context, draw, checkWord);
reset(canvas);
displayUpgrades(
  upgrades, 
  (num) => {
    if (num > points) {
      return false;
    }
    points = points - num;
    localStorage.setItem('points', points);
    document.getElementById("points").innerHTML = points;
    return true;
  },
  checkUpgrades);



