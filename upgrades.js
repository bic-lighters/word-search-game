

const pointGain = {'upgrades': [], 'level':0};
pointGain.upgrades.push({'val': (word) => 1, 'cost': 0, 'text': 'Earn 1 point for each word found'});
pointGain.upgrades.push({'val': (word) => word.length, 'cost': 12, 'text': 'Earn the length of the word for each word found'});
pointGain.upgrades.push({'val': (word) => 2 * word.length, 'cost': 30, 'text': 'Earn double the length of the word for each word found'});
pointGain.upgrades.push({'val': (word) => 3 * word.length, 'cost': 60, 'text': 'Earn 3x the length of the word for each word found'});
pointGain.upgrades.push({'val': (word) => 4 * word.length, 'cost': 120, 'text': 'Earn 4x the length of the word for each word found'});
pointGain.upgrades.push({'val': (word) => word.length * word.length, 'cost': 1000, 'text': 'Earn the length squared of the word for each word found'});

const finishPuzzlePointGain = {'upgrades': [], 'level':0};
finishPuzzlePointGain.upgrades.push({'val': 2, 'cost': 0, 'text': 'Gain two points per finished puzzle'});
finishPuzzlePointGain.upgrades.push({'val': 5, 'cost': 15, 'text': 'Gain five points per finished puzzle'});
finishPuzzlePointGain.upgrades.push({'val': 10, 'cost': 30, 'text': 'Gain ten points per finished puzzle'});

const maxLength = {'upgrades': [], 'level':0};
maxLength.upgrades.push({'val': 3, 'cost': 0, 'text': 'Words of up to length 3'});
maxLength.upgrades.push({'val': 4, 'cost': 10, 'text': 'Words of up to length 4'});
maxLength.upgrades.push({'val': 5, 'cost': 20, 'text': 'Words of up to length 5'});
maxLength.upgrades.push({'val': 6, 'cost': 40, 'text': 'Words of up to length 6'});
maxLength.upgrades.push({'val': 7, 'cost': 60, 'text': 'Words of up to length 7'});
maxLength.upgrades.push({'val': 8, 'cost': 100, 'text': 'Words of up to length 8'});

const numWords = {'upgrades': [], 'level':0};
numWords.upgrades.push({'val': 10, 'cost': 0, 'text': '10 words in the puzzle'});
numWords.upgrades.push({'val': 15, 'cost': 40, 'text': '15 words in the puzzle'});
numWords.upgrades.push({'val': 20, 'cost': 60, 'text': '20 words in the puzzle'});
numWords.upgrades.push({'val': 25, 'cost': 90, 'text': '25 words in the puzzle'});
numWords.upgrades.push({'val': 30, 'cost': 130, 'text': '30 words in the puzzle'});
numWords.upgrades.push({'val': 35, 'cost': 180, 'text': '35 words in the puzzle'});
numWords.upgrades.push({'val': 40, 'cost': 240, 'text': '40 words in the puzzle'});
numWords.upgrades.push({'val': 45, 'cost': 310, 'text': '45 words in the puzzle'});
numWords.upgrades.push({'val': 50, 'cost': 400, 'text': '50 words in the puzzle'});


const autoSelectInterval = {'upgrades': [], 'level':0};
autoSelectInterval.upgrades.push({'val': 0, 'cost': 0, 'text': 'Does not automatically select things'});
autoSelectInterval.upgrades.push({'val': 10000, 'cost': 30, 'text': 'Select random (with repeats) word every 10 seconds'});
autoSelectInterval.upgrades.push({'val': 5000, 'cost': 100, 'text': 'Select random (with repeats) word every 5 seconds'});
autoSelectInterval.upgrades.push({'val': 3000, 'cost': 300, 'text': 'Select random (with repeats) word every 3 seconds'});
autoSelectInterval.upgrades.push({'val': 2000, 'cost': 500, 'text': 'Select random (with repeats) word every 2 seconds'});
autoSelectInterval.upgrades.push({'val': 1000, 'cost': 750, 'text': 'Select random (with repeats) word every 1 seconds'});
autoSelectInterval.upgrades.push({'val': 500, 'cost': 1500, 'text': 'Select random (with repeats) word every .5 seconds'});
autoSelectInterval.upgrades.push({'val': 100, 'cost': 3000, 'text': 'Select random (with repeats) word every .1 seconds'});
autoSelectInterval.upgrades.push({'val': 10, 'cost': 10000, 'text': 'Select random (with repeats) word every .01 seconds'});

const hasColorChanger = {'upgrades': [], 'level': 0};
hasColorChanger.upgrades.push({'val': false, 'cost': 0, 'text': 'No color change option.'});
hasColorChanger.upgrades.push({'val': true, 'cost': 30, 'text': 'Change colors.'});


const highlightInterval = {'upgrades': [], 'level':0};
highlightInterval.upgrades.push({'val': 0, 'cost': 0, 'text': 'Does not automatically hightlight things'});
highlightInterval.upgrades.push({'val': 10000, 'cost': 25, 'text': 'Highlight beginning letter every 10 seconds'});
highlightInterval.upgrades.push({'val': 5000, 'cost': 60, 'text': 'Highlight beginning letter every 5 seconds'});
highlightInterval.upgrades.push({'val': 1000, 'cost': 200, 'text': 'Highlight beginning letter every 1 seconds'});


let upgrades = {
  pointGain, 
  finishPuzzlePointGain, 
  maxLength, 
  numWords, 
  highlightInterval, 
  autoSelectInterval, 
  hasColorChanger
};


const displayUpgrades = (upgrades, subtractPoints, callback) => {

  const upgradeList = document.getElementById("upgrades-display");
  upgradeList.innerHTML = '';

  for (const upg in upgrades) {
    const u = upgrades[upg];
    if (u.upgrades.length <= u.level + 1) {
      continue;
    }

    const updiv = document.createElement('div');
    const upnode = document.createElement('button');
    upnode.innerHTML =  upg + " cost: " + u.upgrades[u.level + 1].cost;
    upnode.onclick = () => {
      if (subtractPoints(u.upgrades[u.level + 1].cost)) {
        u.level += 1;
        displayUpgrades(upgrades, subtractPoints, callback);
        localStorage.setItem('upgrades', JSON.stringify(upgrades));
        callback();
      }
    };
    const upText = document.createElement('span');
    upText.innerHTML = u.upgrades[u.level + 1].text;

    updiv.appendChild(upnode);
    updiv.appendChild(upText);
    upgradeList.appendChild(updiv);
  }
}

export {upgrades, displayUpgrades};