// Sparkline's original procedural composition and synthesis engine.
// Every generation uses cryptographic entropy. No songs or audio samples are used.
export const MOODS = {
  haze: { label: 'Hazy indie', min: 82, max: 106, scale: [0,2,3,5,7,8,10], swing: .08, type: 'haze' },
  ocean: { label: 'Night swim', min: 68, max: 86, scale: [0,2,3,5,7,8,10], swing: .14, type: 'ocean' },
  soul: { label: 'Velvet soul', min: 76, max: 98, scale: [0,2,4,5,7,9,11], swing: .18, type: 'soul' }
};
export const DEFAULT_MIX = { volumes:[.8,.8,.82,.65], muted:[false,false,false,false], warmth:55, space:40, master:.75 };
export function randomSeed() { return Array.from(crypto.getRandomValues(new Uint32Array(4))).map(n=>n.toString(16).padStart(8,'0')).join(''); }
export function rngFor(seed, salt=0) {
  let x=2166136261 ^ salt;
  for (const char of seed) x=Math.imul(x ^ char.charCodeAt(0),16777619);
  return ()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
}
const choose=(r,arr)=>arr[Math.floor(r()*arr.length)];
export function compose({seed=randomSeed(), vibe='haze', duration=150, bpm:tempo, melodyVersion=0}={}) {
  const mood=MOODS[vibe] || MOODS.haze, r=rngFor(seed,1);
  const generatedTempo=Math.round(mood.min+r()*(mood.max-mood.min));
  const bpm=tempo || generatedTempo;
  const beat=60/bpm, bar=beat*4, bars=Math.ceil(duration/bar);
  const root=choose(r,[45,47,48,50,52,53,55]);
  const scale=mood.scale;
  const progression=choose(r,vibe==='soul'?[[0,5,1,4],[3,2,1,4],[0,2,5,3]]:[[0,5,2,6],[0,3,5,4],[5,6,0,2],[0,6,5,3]]);
  const degreeNote=(d,oct=0)=>root+scale[((d%7)+7)%7]+Math.floor(d/7)*12+oct*12;
  const chordLength=vibe==='soul'?1:2;
  const events=[];
  const sectionFor=b=>b<3?'Intro':b>=bars-4?'Outro':b>=Math.floor(bars*.48)&&b<Math.floor(bars*.61)?'Drift':b>=Math.floor(bars*.22)&&b<Math.floor(bars*.46)||b>=Math.floor(bars*.66)&&b<bars-4?'Lift':'Ride';
  const sections=[];
  for(let b=0;b<bars;b++) {
    const name=sectionFor(b);
    if(!sections.length || sections.at(-1).name!==name) sections.push({name,start:b*bar});
  }
  const add=(track,time,dur,note,velocity,kind,pan=0)=>{
    if(time>=0&&time<duration-.5)events.push({track,time,dur:Math.min(dur,duration-time-.1),note,velocity,kind,pan});
  };
  // Track-specific random streams keep melody edits from changing the groove.
  const keysR=rngFor(seed,2),bassR=rngFor(seed,3),drumR=rngFor(seed,4),melR=rngFor(seed,5+melodyVersion*131);
  const chordRoots=[];
  for(let b=0;b<bars;b++) {
    const d=progression[Math.floor(b/chordLength)%4], time=b*bar;
    const section=sectionFor(b), intensity=section==='Lift'?1:section==='Drift'?.57:section==='Intro'?.55:section==='Outro'?.62:.8;
    chordRoots.push(degreeNote(d));
    if(b%chordLength===0) {
      const voicing=[degreeNote(d,1),degreeNote(d+2,1),degreeNote(d+4,0),degreeNote(d+6,0)];
      if(vibe==='soul')voicing.push(degreeNote(d+8,0));
      voicing.forEach((note,i)=>add(0,time+i*.018,chordLength*bar*.87,note,.20*intensity,'keys',(i-1.5)*.15));
      if(vibe!=='haze' && section!=='Intro') {
        voicing.slice(0,3).forEach((note,i)=>add(0,time+beat*2.5+i*.015,beat*.6,note,.09*intensity,'bell',(i-1)*.25));
      }
    }
    if(section==='Lift' && keysR()<.45)add(0,time+beat*3.5,beat*.8,degreeNote(d+8,1),.09,'bell',-.4);
    if(section!=='Intro') {
      const rhythm=section==='Drift'?[0,2.75]:vibe==='soul'?[0,1.5,2.75,3.5]:[0,1.75,2.5];
      rhythm.forEach((p,i)=>{
        let note=degreeNote(d,-1);
        if(i===rhythm.length-1 && bassR()<.4)note=degreeNote(d+4,-1);
        add(1,time+p*beat,beat*(i===0?1.3:.65),note,.35*intensity,'bass');
      });
    }
    if(b>=2 && b<bars-2) {
      if(section!=='Drift') {
        [0,...(drumR()<.65?[6]:[]),...(drumR()<.55?[10]:[8]),...(section==='Lift'?[14]:[])].forEach(step=>add(2,time+step*beat/4,.45,0,.64*intensity,'kick'));
        [4,12].forEach(step=>add(2,time+step*beat/4+.012,.22,0,.42*intensity,'snare',.08));
        if(drumR()<.35)add(2,time+15*beat/4,.11,0,.12,'snare',-.08);
      }
      for(let step=0;step<16;step++) {
        if(step%2===0 || section==='Lift'&&drumR()<.24) {
          const swing=(step%4===2?mood.swing*beat:0), vel=(step%4===0?.22:.12)*intensity*(.8+drumR()*.4);
          add(2,time+step*beat/4+swing,.055,0,vel,'hat',step%4===0?-.32:.38);
        }
      }
      if(section==='Lift'&&b%4===3)add(2,time+beat*3.5,.35,0,.16,'openhat',.35);
      if(vibe==='soul'&&drumR()<.5)add(2,time+beat*2.75,.1,0,.14,'rim',-.28);
    }
  }
  // A recurring motif with chord-aware variations makes a song, not an endless random loop.
  const motif=Array.from({length:8},()=>choose(melR,[0,2,4,6,8]));
  const motifRhythm=Array.from({length:8},()=>choose(melR,[.5,1,1.5,2.5,3]));
  for(let b=0;b<bars;b++) {
    const section=sectionFor(b),d=progression[Math.floor(b/chordLength)%4],time=b*bar;
    if(section==='Intro'&&b<1 || section==='Outro'&&b>=bars-2)continue;
    const pos=b%8,degree=d+motif[pos];
    const high=section==='Lift'?1:0;
    const note=degreeNote(degree,1+high);
    add(3,time+motifRhythm[pos]*beat,beat*choose(melR,[.6,1,1.5]),note,section==='Lift'?.20:.14,'lead',choose(melR,[-.38,.25,.4]));
    if(section==='Lift' || section==='Drift' || melR()<.3) {
      add(3,time+(motifRhythm[pos]+.75)*beat,beat*.5,degreeNote(d+choose(melR,[2,4,6]),2),.10,'bell',-.3);
    }
  }
  events.sort((a,b)=>a.time-b.time);
  const nameA=['Lavender','Velvet','Pink','Midnight','Soft','Violet','Stardust','Afterhours','Moonlit','Cosmic'];
  const nameB=['Transfer','Platform','Orbit','Window','Frequency','Daydream','Arrival','Signal','Local','Echo'];
  const name=choose(r,nameA)+' '+choose(r,nameB);
  const key=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][root%12]+(vibe==='soul'?' major':' minor');
  return {seed,vibe,duration,bpm,melodyVersion,name,key,events,sections,bar,root};
}
const hz=n=>440*Math.pow(2,(n-69)/12);
function noiseBuffer(ctx,seed,length=2) {
  const buf=ctx.createBuffer(1,Math.ceil(length*ctx.sampleRate),ctx.sampleRate),data=buf.getChannelData(0),r=rngFor(seed,99);
  for(let i=0;i<data.length;i++)data[i]=r()*2-1;
  return buf;
}
export function createGraph(ctx,song,mix,destination=ctx.destination,offset=0) {
  const compressor=ctx.createDynamicsCompressor();
  compressor.threshold.value=-15;compressor.knee.value=16;compressor.ratio.value=3;compressor.attack.value=.008;compressor.release.value=.2;
  const master=ctx.createGain(),fade=ctx.createGain();master.gain.value=mix.master;
  compressor.connect(master);master.connect(fade);fade.connect(destination);
  const tracks=mix.volumes.map((volume,i)=>{
    const gain=ctx.createGain(),filter=ctx.createBiquadFilter();
    gain.gain.value=mix.muted[i]?0:volume;
    filter.type='lowpass';filter.frequency.value=12000-mix.warmth*95;filter.Q.value=.35;
    gain.connect(filter);filter.connect(compressor);return {gain,filter};
  });
  const verb=ctx.createConvolver(),verbGain=ctx.createGain();
  const ir=ctx.createBuffer(2,Math.ceil(ctx.sampleRate*1.7),ctx.sampleRate),r=rngFor(song.seed,73);
  for(let channel=0;channel<2;channel++) {
    const data=ir.getChannelData(channel);
    for(let i=0;i<data.length;i++)data[i]=(r()*2-1)*Math.pow(1-i/data.length,3.2)*.3;
  }
  verb.buffer=ir;verbGain.gain.value=mix.space/100*.65;
  verb.connect(verbGain);verbGain.connect(compressor);
  [0,3].forEach(i=>tracks[i].filter.connect(verb));
  const delay=ctx.createDelay(1),feedback=ctx.createGain(),delayGain=ctx.createGain();
  delay.delayTime.value=60/song.bpm*.75;feedback.gain.value=.24;delayGain.gain.value=.16;
  tracks[3].filter.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(delayGain);delayGain.connect(compressor);
  const noise=noiseBuffer(ctx,song.seed);
  fade.gain.setValueAtTime(Math.min(1,offset/1.5+.05),ctx.currentTime);
  fade.gain.linearRampToValueAtTime(1,ctx.currentTime+Math.max(.01,1.5-offset));
  const remain=song.duration-offset;
  fade.gain.setValueAtTime(1,ctx.currentTime+Math.max(0,remain-4));
  fade.gain.linearRampToValueAtTime(0,ctx.currentTime+remain);
  return {tracks,master,verbGain,noise,fade,compressor,delay,feedback,verb,delayGain,
    update(next){const t=ctx.currentTime;next.volumes.forEach((v,i)=>{tracks[i].gain.gain.setTargetAtTime(next.muted[i]?0:v,t,.03);tracks[i].filter.frequency.setTargetAtTime(12000-next.warmth*95,t,.05);});master.gain.setTargetAtTime(next.master,t,.02);verbGain.gain.setTargetAtTime(next.space/100*.65,t,.05);},
    dispose(){[master,fade,compressor,verb,verbGain,delay,feedback,delayGain,...tracks.flatMap(t=>[t.gain,t.filter])].forEach(n=>{try{n.disconnect();}catch{}});}
  };
}
export function scheduleEvent(ctx,graph,event,time,vibe,remaining) {
  const e=event,duration=Math.max(.03,remaining ?? e.dur);
  const gain=ctx.createGain(),pan=ctx.createStereoPanner();pan.pan.value=e.pan;
  gain.connect(pan);pan.connect(graph.tracks[e.track].gain);
  const nodes=[gain,pan],sources=[];
  const osc=(type,freq,detune=0)=>{const o=ctx.createOscillator();o.type=type;o.frequency.value=freq;o.detune.value=detune;sources.push(o);nodes.push(o);return o;};
  let stop=time+duration+.5;
  if(e.kind==='kick') {
    const o=osc('sine',155);o.frequency.setValueAtTime(155,time);o.frequency.exponentialRampToValueAtTime(43,time+.12);o.connect(gain);
    gain.gain.setValueAtTime(.001,time);gain.gain.linearRampToValueAtTime(e.velocity,time+.003);gain.gain.exponentialRampToValueAtTime(.001,time+.42);stop=time+.45;
  } else if(['snare','hat','openhat','rim'].includes(e.kind)) {
    const source=ctx.createBufferSource();source.buffer=graph.noise;sources.push(source);nodes.push(source);
    const filter=ctx.createBiquadFilter();nodes.push(filter);filter.type=e.kind==='snare'?'bandpass':'highpass';filter.frequency.value=e.kind==='snare'?1800:e.kind==='rim'?2600:7600;filter.Q.value=e.kind==='rim'?8:.7;
    source.connect(filter);filter.connect(gain);
    const decay=e.kind==='snare'?.19:e.kind==='openhat'?.30:e.kind==='rim'?.07:.045;
    gain.gain.setValueAtTime(e.velocity,time);gain.gain.exponentialRampToValueAtTime(.0001,time+decay);stop=time+decay+.03;
    if(e.kind==='snare'){const body=osc('triangle',190);const g=ctx.createGain();nodes.push(g);g.gain.value=.28;body.connect(g);g.connect(gain);}
  } else {
    const frequency=hz(e.note),filter=ctx.createBiquadFilter();nodes.push(filter);filter.type='lowpass';filter.Q.value=.6;filter.connect(gain);
    let attack=.03,release=.35;
    if(e.kind==='keys') {
      attack=vibe==='haze'?.16:.025;release=vibe==='haze'?.8:.5;
      filter.frequency.setValueAtTime(vibe==='haze'?2400:3600,time);filter.frequency.exponentialRampToValueAtTime(650,time+duration+.3);
      const a=osc(vibe==='haze'?'sawtooth':'triangle',frequency,-5),b=osc('sine',frequency,4);
      const ga=ctx.createGain(),gb=ctx.createGain();nodes.push(ga,gb);ga.gain.value=.42;gb.gain.value=.58;a.connect(ga);b.connect(gb);ga.connect(filter);gb.connect(filter);
    } else if(e.kind==='bass') {
      attack=.015;release=.16;filter.frequency.value=650;
      const a=osc('sine',frequency),b=osc('triangle',frequency);
      const g=ctx.createGain();g.gain.value=.25;nodes.push(g);a.connect(filter);b.connect(g);g.connect(filter);
    } else {
      attack=e.kind==='bell'?.008:.045;release=.65;filter.frequency.value=4300;
      const a=osc('sine',frequency),b=osc('sine',frequency*(e.kind==='bell'?2.001:1.005));
      const g=ctx.createGain();g.gain.value=e.kind==='bell'?.35:.45;nodes.push(g);a.connect(filter);b.connect(g);g.connect(filter);
    }
    gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(e.velocity,time+attack);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001,e.velocity*.45),time+Math.max(attack+.01,duration*.85));
    gain.gain.setTargetAtTime(.0001,time+duration,release/5);stop=time+duration+release;
  }
  sources.forEach(s=>{s.start(time);s.stop(stop);});
  sources[0].onended=()=>nodes.forEach(n=>{try{n.disconnect();}catch{}});
}
export class Player {
  constructor(onEnd=()=>{}){this.ctx=null;this.graph=null;this.song=null;this.mix=null;this.playing=false;this.offset=0;this.timer=null;this.onEnd=onEnd;this.analyser=null;}
  async unlock(){if(!this.ctx)this.ctx=new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')await this.ctx.resume();}
  position(){return this.playing?Math.min(this.song.duration,this.ctx.currentTime-this.origin):this.offset;}
  async play(song,mix,offset=this.offset){
    await this.unlock();this.stop();this.song=song;this.mix=mix;this.offset=offset>=song.duration?0:Math.max(0,offset);
    this.origin=this.ctx.currentTime+.05-this.offset;
    this.analyser=this.ctx.createAnalyser();this.analyser.fftSize=256;this.analyser.smoothingTimeConstant=.8;this.analyser.connect(this.ctx.destination);
    this.graph=createGraph(this.ctx,song,mix,this.analyser,this.offset);this.playing=true;
    this.cursor=song.events.findIndex(e=>e.time>=this.offset);
    if(this.cursor<0)this.cursor=song.events.length;
    // Restore sustained chords/bass when seeking into an existing note.
    song.events.filter(e=>e.time<this.offset&&e.time+e.dur>this.offset&&e.track!==2).forEach(e=>scheduleEvent(this.ctx,this.graph,e,this.ctx.currentTime+.05,song.vibe,e.time+e.dur-this.offset));
    const tick=()=>{
      if(!this.playing)return;
      const until=this.ctx.currentTime-this.origin+.25;
      while(this.cursor<song.events.length&&song.events[this.cursor].time<until){const e=song.events[this.cursor++];scheduleEvent(this.ctx,this.graph,e,Math.max(this.ctx.currentTime+.003,this.origin+e.time),song.vibe);}
      if(this.position()>=song.duration){this.stop();this.offset=0;this.onEnd();}
    };
    tick();this.timer=setInterval(tick,70);
  }
  pause(){const p=this.position();this.stop();this.offset=p;}
  stop(){clearInterval(this.timer);this.playing=false;if(this.graph){this.graph.dispose();this.graph=null;}if(this.analyser){try{this.analyser.disconnect();}catch{}}}
  update(mix){this.mix=mix;this.graph?.update(mix);}
}
export async function renderWav(song,mix,onProgress=()=>{}) {
  const sampleRate=44100,ctx=new OfflineAudioContext(2,Math.round(song.duration*sampleRate),sampleRate),graph=createGraph(ctx,song,mix);
  // Yield between batches so controls/status can repaint while the graph is constructed.
  for(let i=0;i<song.events.length;i++){const e=song.events[i];scheduleEvent(ctx,graph,e,e.time+.02,song.vibe);if(i%150===0){onProgress(Math.round(i/song.events.length*35));await new Promise(r=>setTimeout(r,0));}}
  onProgress(40);const buffer=await ctx.startRendering();onProgress(85);
  const blob=await encodeWav(buffer);graph.dispose();onProgress(100);return blob;
}
function encodeWav(buffer) {
  return new Promise((resolve,reject)=>{
    const worker=new Worker(new URL('wav-worker.js',import.meta.url));
    worker.onmessage=({data})=>{worker.terminate();resolve(new Blob([data],{type:'audio/wav'}));};
    worker.onerror=error=>{worker.terminate();reject(error);};
    const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
    worker.postMessage({left,right,sampleRate:buffer.sampleRate},[left.buffer,right.buffer]);
  });
}
