import $ from 'jquery';
function pick(set){
    const n = set.length;
    const i = n * Math.random();
    return set[Math.floor(i)];
}

const BASE_SET_ITALIAN= 'napolidiqualcheorafalanotiziadiunuomonelnapoletanorimastovittimadiungraveinc'+
                        'identesecondounaprimaricostruzionedeifattituttoaccadutoieripomeriggioallalte'+
                        'zzadiviaduomoadiacenzedelchioscoperemussoditoninoscardadettomappinaunuomodia'+
                        'nniresidentenelrionedonguanellaascampiaavevadecisodifareunviaggioallesterode'+
                        'stinazionenapolicentrocgcoschiameremoilprotagonistadiquestavicendaperchilsuo'+
                        'nomerealeportasfortunastavaguidandonormalmenteimmersonellaletturadelsuosmart'+
                        'phoneoggettodellasuaprimitivacuriositdaanalfabetafunzionaleuntrattatosuiluog'+
                        'hicomuniacaricodeinapoletaniintitolatooradivolarealtoncoppjammejamanoinonsia'+
                        'mocosavrebbeesclamatopivolteluomobevendolasuatazzulellaecafpreparatanellacaf'+
                        'fettieracustoditanellalettaparasoleladevonosmettereconquestipregiudizisuinap'+
                        'oletani'.split('');
   
const LEVELS = [
    {
        next: 10,
        min:1,
        freq: 5,
        eta: 15,
        hit: 1,
        miss: 2,
    },
    {
        next: 50,
        min:2,
        freq: 4,
        eta: 14,
        hit: 2,
        miss: 5,
    },
    {
        next: 200,
        min:2,
        freq: 3.7,
        eta: 13,
        hit: 5,
        miss: 10,
    },
    {
        next: 500,
        min:3,
        freq: 3.5,
        eta: 12,
        hit: 10,
        miss: 25,
    },
    {
        next: 100000,
        min:6,
        freq: 3,
        eta: 10,
        hit: 50,
        miss: 100,
    }

]


function now(){
    return new Date().getTime();
}

class GameStats {
    constructor(hits, miss, level, score,gameOver){
        this.hits=hits||0;
        this.miss=miss||0;
        this.level=level||0;
        this.score=score||0;
        this.gameOver=gameOver;
    }

    getRate(){
        const total = this.hits+this.miss;
        return total ? this.hits / total : 1;
    }
}

export class Game{
    constructor(screen, statsHandler){
        this.gameScreen = screen;
        this.statsHandler = statsHandler;

        this.isOver = false;
        
        this.hits = 0;
        this.miss = 0;


        this.score=0;
        this.level=0;
        this.lastEmission=0;
        
        this.char_set=[];
        this.averageSpeed = 1/10000.0;
        this.genFactor = 1/5000.0;
        // this.startTime = new Date().getTime();
        this.fallingLetters=[];
        this.lastFrame= new Date().getTime();

        for(let i='a'.charCodeAt(0);i<='z'.charCodeAt(0);i++){
            this.char_set.push(String.fromCharCode(i));
        }

        this.char_set = [...this.char_set, ...BASE_SET_ITALIAN];

        this.keyHandler = (evt)=>{
            const chr = String.fromCharCode(evt.which).toLowerCase();
            (()=>this.checkKey(chr))();
        };


        $(document).keypress(this.keyHandler);

        window.requestAnimationFrame((t)=>this.step(t));
    }

    fireStats(){
        if(this.statsHandler){
            this.statsHandler(new GameStats(this.hits,this.miss,this.level,this.score));
        }
    }

    updateRate(){
        const total = this.hits+this.miss;
        const rate = total ? ((this.hits / total)*100).toFixed(0) :  0;
        const rateFmt = rate ? rate + '%': 'n/a';
        this.fireStats();
    }

    checkKey(chr){
        const opt_letter = this.fallingLetters.find(l=>l.char==chr && !l.hitTime);
        if(opt_letter){
            opt_letter.hit();
            this.hit();
            this.updateRate();
        } else {
            const {next,freq,eta,hit,miss,min} = LEVELS[this.level];
            this.miss++;
            this.updateRate();
            $('#missSound')[0].play();
            this.score-=miss;
        }
    }

    hit(){
        this.hits++;
        const {next,freq,eta,hit,miss,min} = LEVELS[this.level];
        this.score=this.score+hit;
        // this.averageSpeed = this.averageSpeed * 1.001;
        // this.genFactor = this.genFactor * 1.03;
        $('#hitSound')[0].play();
        if(this.score > next){
           this.level++; 
        }
    }

    step(t){
        const delta = t-this.lastFrame;
        
        this.fallingLetters.forEach(l=>{
            l.move(delta);
        });

        this.checkStop();

        this.getLetter(delta);

        this.cleanUp();



        this.lastFrame = t;
        if(!this.stop){
            window.requestAnimationFrame((t)=>this.step(t));
        }
    }

    cleanUp(){
        this.fallingLetters = this.fallingLetters.filter(l=>!l.isDecayed());
    }

    checkStop(){
        this.fallingLetters.forEach(l=>{
            if(l.isOut()){
                this.stop=true;
                $(document).unbind('keypress',this.keyHandler);
                this.isOver = true;
                this.statsHandler(new GameStats(this.hits,this.miss,this.level,this.score,true));
            }
        });
    }


    getLetter(delta){
        const {next,freq,eta,hit,miss,min} = LEVELS[this.level];
        const t = now();
        const falling= (this.fallingLetters || []).filter(l=>!l.hitTime).length;

        
        if( falling < min || (t-this.lastEmission)/1000 > freq){    

            const c = pick(this.char_set);
            const randmoness = ( (Math.random()-0.5) / 4 + 1);
            const speed = 1/eta / 1000;



            const letter = new FallingLetter(c,speed,this.gameScreen);
            this.fallingLetters.push(letter);
            this.lastEmission = t;
        }
        

        /*
        if(!this.fallingLetters.length || Math.random()<this.genFactor * delta){
            const c = pick(this.char_set);
            const speed = this.averageSpeed * ( (Math.random()-0.5) / 4 + 1);
            const letter = new FallingLetter(c,speed,this.gameScreen);
            this.fallingLetters.push(letter);
        }
        */
    }


    
}

class FallingLetter{
    constructor(chr,speed,screen){
        this.decay = 800;
        this.char=chr;
        this.speed=speed;
        this.screen=screen;
        this.hitTime;
        this.position={
            x:Math.random(),
            y:0
        }
        this.elm = $("<div class='letter'><div class='inner'>"+chr+"</div></div>");
        this.move(0);
        this.screen.append(this.elm);
    }

    move(delta){
        if(!this.hitTime){
            let {x,y} = this.position;
            y = this.position.y = y + this.speed * delta;
            const px = x*100;
            const py = y*100;
            this.elm.attr("style",`top:${py}%;left:${px}%`);
        }
    }
    
    
    
    hit(){
        this.elm.addClass('_hit_letter');
        this.hitTime = new Date().getTime();
    }

    isOut(){
        if(this.position.y>=1){
            this.elm.addClass('_out_letter');
            return true;
        }
        return false;
    }
    isDecayed(){
        const t = new Date().getTime()
        if(t-this.hitTime>this.decay){
            this.elm.remove();
            return true;
        }else{
            return false;
        }
    }
}


export default Game;