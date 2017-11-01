// Here is the starting point for your application code.

// Small helpers you might want to keep
import './helpers/context_menu.js';
import './helpers/external_links.js';

// All stuff below is just to show you how it works. You can delete all of it.
import { remote } from 'electron';
import jetpack from 'fs-jetpack';
import { greet } from './hello_world/hello_world';
import env from './env';
import $ from 'jquery';
import {Game} from './game/game.js';

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files form disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read('package.json', 'json');

const startButton = document.querySelector('#start');
const splash = document.querySelector('#splash');
const scores = document.querySelectorAll('.score');
const gameOver = document.querySelectorAll('#game-over');

let game;
let highScores;
let tempHighScores;

function startGame(){
  console.log("Starting game");
  hide(startButton);
  hide(splash);
  show(scores);
  $('#screen').remove();
  const screen = $('<div id="screen"/>');
  $('body').append(screen);
  game=new Game(screen,(stats)=>{gameHandler(stats);});
  tempHighScores = [...highScores];
}

function gameHandler(stats){
  console.log(stats);
  $("#score .value").text(stats.score);
  $("#level .value").text(stats.level);

  updateHighscores(stats.score);
  $("#highscore .value").text(tempHighScores[0]);
  
  const rateFmt = (stats.getRate() * 100).toFixed(0) + "%";
  $("#rate .value").text(rateFmt);
  if(stats.gameOver){
    show(gameOver);
    highScores = tempHighScores.length < 10 ? tempHighScores : tempHighScores.slice(0,10);
    console.log(highScores);
    localStorage.setItem("scores",JSON.stringify(highScores));
    showHighScores();
  }
}

function updateHighscores(score) {
  tempHighScores = [...highScores,score].sort((a,b)=>+(b)-a);
  console.log(tempHighScores);
}

function hide(elm){
  if(elm.forEach){
    elm.forEach((e)=> {
      e.setAttribute('style','display:none');
    });
  }else{
    elm.setAttribute('style','display:none');
  }
}
function show(elm){
  if(elm.forEach){
    elm.forEach((e)=> {
      e.removeAttribute('style');
    });
  }else{
    elm.removeAttribute('style');
  }
}

function init(){
  document.querySelector('#author').innerHTML = manifest.author;
  startButton.onclick= (e)=>{
    startGame();
  };
  document.querySelector('#game-over').onclick= (e)=>{
    show(startButton);
    show(splash);
    hide(scores);
    hide(gameOver);
    $('#screen').remove();
  };
  highScores = JSON.parse(localStorage.getItem("scores")) || [];
  showHighScores();
  $(document).keypress((e)=>{
    console.log(e,e.char);
    if(e.charCode==32 && (!game || game.isOver)){
      hide(scores);
      hide(gameOver);
      $('#screen').remove();
        startGame();
    }
  });
}

init();

function showHighScores(){
  const elm = $('#hiscores');
  elm.empty()
  highScores.forEach(s=>{
    const item = $('<li class="score-item"></li>');
    item.text(s);
    elm.append(item);
  });
}