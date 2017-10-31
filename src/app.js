// Here is the starting point for your application code.

// Small helpers you might want to keep
import './helpers/context_menu.js';
import './helpers/external_links.js';

// All stuff below is just to show you how it works. You can delete all of it.
import { remote } from 'electron';
import jetpack from 'fs-jetpack';
import { greet } from './hello_world/hello_world';
import env from './env';

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files form disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read('package.json', 'json');

const startButton = document.querySelector('#start');
const splash = document.querySelector('#splash');
const scores = document.querySelector('.score');



function startGame(){
  console.log("Starting game");
  hide(startButton);
  hide(splash);
  show(scores);
}

function hide(elm){
  elm.setAttribute('style','display:none');
}
function show(elm){
  elm.removeAttribute('style');
}

function init(){
  document.querySelector('#author').innerHTML = manifest.author;
  startButton.onclick= (e)=>{
    startGame();
  };
}

init();