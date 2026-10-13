// Sparkline's original procedural composition and synthesis engine.
// Every generation uses cryptographic entropy. No songs or audio samples are used.
export const MOODS = {
  haze: { label: 'Hazy indie', min: 82, max: 106, scale: [0,2,3,5,7,8,10], swing: .08, type: 'haze' },
  ocean: { label: 'Night swim', min: 68, max: 86, scale: [0,2,3,5,7,8,10], swing: .14, type: 'ocean' },
  soul: { label: 'Velvet soul', min: 76, max: 98, scale: [0,2,4,5,7,9,11], swing: .18, type: 'soul' },
  ghost: { label: 'Ghost circuit', min: 78, max: 99, scale: [0,2,3,5,7,9,10], swing: .06, type: 'ghost' },
  chrome: { label: 'Chrome pop', min: 105, max: 138, scale: [0,2,3,5,7,8,10], swing: .03, type: 'chrome' },
  fusion: { label: 'Fusion lab', min: 86, max: 132, scale: [0,2,3,5,7,9,10], swing: .11, type: 'fusion' }
};
export const DEFAULT_MIX = { volumes:[.8,.8,.82,.65], muted:[false,false,false,false], warmth:55, space:40, master:.75 };
export const GHOST_MIX = { volumes:[.95,.72,.78,.56], muted:[false,false,false,false], warmth:66, space:68, master:.75 };
export function initialMix(vibe){const preset=vibe==='ghost'?GHOST_MIX:vibe==='chrome'?{...DEFAULT_MIX,volumes:[.72,.95,.88,.64],warmth:35,space:44}:vibe==='fusion'?{...DEFAULT_MIX,volumes:[.78,.94,.85,.66],warmth:48,space:56}:DEFAULT_MIX;return JSON.parse(JSON.stringify(preset));}
export function randomSeed() { return Array.from(crypto.getRandomValues(new Uint32Array(4))).map(n=>n.toString(16).padStart(8,'0')).join(''); }
export function rngFor(seed, salt=0) {
  let x=2166136261 ^ salt;
  for (const char of seed) x=Math.imul(x ^ char.charCodeAt(0),16777619);
  return ()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
}
const choose=(r,arr)=>arr[Math.floor(r()*arr.length)];
const SOUNDS={
  'fm-keys':['Dusty Rhodes','Soft electric piano & bell tines'],
  organ:['Night organ','Warm tonewheels & held harmonies'],
  'string-pad':['String clouds','Slow, wide string ensemble'],
  'analog-pad':['Analog bloom','Detuned synth chords & soft resonance'],
  glass:['Glass keys','Crystalline FM bells & drifting echoes'],
  vibes:['Velvet vibes','Long, shimmering metal mallets'],
  marimba:['Wooden stars','Round, percussive wooden mallets'],
  'brass-keys':['Amber brass','Warm synth brass & swelling chords'],
  guitar:['Chorus guitar','Plucked strings & drifting stereo chorus'],
  'nylon-guitar':['Nylon strings','Warm, rounded acoustic string plucks'],
  'muted-guitar':['Tape guitar','Short, dusky muted string plucks'],
  'vhs-lead':['VHS synth','Detuned analog pads & dusk melodies'],
  flute:['Air flute','Breathy, soft melodic phrases'],
  'round-bass':['Low gravity','A round, warm synth bass'],
  'sub-bass':['Deep orbit','Pure sine sub bass'],
  'analog-bass':['Analog low end','Filtered saw bass & soft resonance'],
  'pluck-bass':['Pocket bass','Short, punchy plucked synth bass'],
  'fretless-bass':['Fretless dusk','Plucked low strings & gentle pitch slides'],
  '808-bass':['Orbit 808','Deep sub tails, saturation & pitch slides'],
  'rubber-bass':['Rubber bass','Elastic FM bends & round low-end punches'],
  'grunge-guitar':['Grunge strings','Fuzzy, distorted strings & dark overtones'],
  bubble:['Bubble synth','Rubbery plucks & resonant pitch bends'],
  'metallic-keys':['Liquid metal','Bright, inharmonic FM clangs'],
  acid:['Acid signal','Squishy resonant synth phrases']
};
const KIT_LABELS={dusty:['Dusty drums','Soft hats & dry vinyl-style snares'],machine:['Neon drums','Punchy vintage drum-machine tones'],brush:['Brush pocket','Soft noise brushes & light percussion'],gated:['Gated drums','Vintage snare rooms & spacious grooves'],plastic:['Plastic drums','Rubber hits, metallic ticks & hard snaps'],baile:['Baile percussion','Syncopated kicks, rims & rolling shakers']};
function soundPalette(seed,vibe){
  const r=rngFor(seed,2400);
  const choices={
    haze:[['analog-pad','guitar','string-pad','organ','fm-keys','nylon-guitar'],['round-bass','analog-bass','pluck-bass','808-bass'],['dusty','machine','brush'],['glass','flute','guitar','vibes','vhs-lead']],
    ocean:[['fm-keys','nylon-guitar','glass','string-pad','vibes'],['sub-bass','fretless-bass','round-bass','808-bass'],['dusty','brush','machine'],['marimba','flute','glass','vibes','vhs-lead']],
    soul:[['organ','fm-keys','brass-keys','vibes','nylon-guitar'],['fretless-bass','pluck-bass','round-bass','analog-bass','808-bass'],['brush','dusty','machine'],['vibes','marimba','flute','brass-keys','organ']],
    ghost:[['guitar','muted-guitar'],['round-bass','analog-bass','fretless-bass','808-bass'],['gated','machine','dusty'],['vhs-lead','glass','flute']],
    chrome:[['bubble','metallic-keys','fm-keys','grunge-guitar','analog-pad'],['808-bass','rubber-bass','analog-bass'],['plastic','machine','gated'],['bubble','acid','metallic-keys','glass','vhs-lead']],
    fusion:[['grunge-guitar','nylon-guitar','fm-keys','organ','vibes','string-pad'],['808-bass','808-bass','rubber-bass','fretless-bass'],['baile','plastic','dusty','machine'],['flute','bubble','guitar','marimba','acid','vibes']]
  }[vibe]||choicesForDefault();
  const kinds=choices.map(options=>choose(r,options));
  const tracks=kinds.map((kind,i)=>{const [label,detail]=i===2?KIT_LABELS[kind]:SOUNDS[kind];return {kind,label: vibe==='ghost'&&i===0?(kind==='guitar'?'Ghost guitar':'Tape guitar'):label,detail};});
  const chordStyle=['string-pad','analog-pad'].includes(kinds[0])?'sustain':['guitar','nylon-guitar','muted-guitar','grunge-guitar','marimba','vibes','bubble','metallic-keys'].includes(kinds[0])?'arpeggio':choose(r,['sustain','stabs','arpeggio']);
  const intro=choose(r,[{name:'Chord glow',entrances:[0,2,2,1]},{name:'Melody first',entrances:[2,2,2,0]},{name:'Bass arrival',entrances:[2,0,1,1]},{name:'Drum entrance',entrances:[2,1,0,1]},{name:'Midnight duet',entrances:[0,2,2,0]}]);
  const experimental=vibe==='chrome'||vibe==='fusion';
  const grooves=experimental?choose(r,[['baile','halftime','broken','indie'],['broken','soul','baile','halftime'],['halftime','baile','indie','broken']]):[choose(r,['indie','soul','broken'])];
  return {tracks,chordStyle,intro,introBars:choose(r,[2,3,4]),kickPattern:choose(r,[[0,6,10],[0,7,10,14],[0,8],[0,3,10],[0,8,11]]),halfTime:r()<.18,experimental,grooves,rotation:choose(r,[1,2,3]),dropBar:choose(r,[3,5,7])};
}
function choicesForDefault(){return [['fm-keys'],['round-bass'],['dusty'],['glass']];}
export function compose({seed=randomSeed(), vibe='haze', duration=150, bpm:tempo, melodyVersion=0}={}) {
  const mood=MOODS[vibe] || MOODS.haze, r=rngFor(seed,1);
  const palette=soundPalette(seed,vibe);
  const generatedTempo=Math.round(mood.min+r()*(mood.max-mood.min));
  const bpm=tempo || generatedTempo;
  const beat=60/bpm, bar=beat*4, bars=Math.ceil(duration/bar);
  const root=choose(r,[45,47,48,50,52,53,55]);
  const scale=mood.scale;
  const progression=choose(r,vibe==='soul'?[[0,5,1,4],[3,2,1,4],[0,2,5,3]]:vibe==='ghost'?[[0,3,1,5],[0,5,3,1],[3,0,5,4],[0,1,5,3]]:[[0,5,2,6],[0,3,5,4],[5,6,0,2],[0,6,5,3]]);
  const degreeNote=(d,oct=0)=>root+scale[((d%7)+7)%7]+Math.floor(d/7)*12+oct*12;
  const chordLength=vibe==='soul'?1:2;
  const events=[];
  const sectionFor=b=>b<palette.introBars?'Intro':b>=bars-4?'Outro':b>=Math.floor(bars*.48)&&b<Math.floor(bars*.61)?'Drift':b>=Math.floor(bars*.22)&&b<Math.floor(bars*.46)||b>=Math.floor(bars*.66)&&b<bars-4?'Lift':'Ride';
  const active=(track,b)=>b>=palette.introBars||b>=palette.intro.entrances[track];
  const degreeFor=b=>progression[(Math.floor(b/chordLength)+(sectionFor(b)==='Drift'&&palette.experimental?palette.rotation:0))%4];
  const sections=[];
  for(let b=0;b<bars;b++) {
    const name=sectionFor(b);
    if(!sections.length || sections.at(-1).name!==name) sections.push({name,start:b*bar});
  }
  const add=(track,time,dur,note,velocity,kind,pan=0,extra={})=>{
    if(time>=0&&time<duration-.5)events.push({track,time,dur:Math.min(dur,duration-time-.1),note,velocity,kind,pan,...extra});
  };
  // Track-specific random streams keep melody edits from changing the groove.
  const keysR=rngFor(seed,2),bassR=rngFor(seed,3),drumR=rngFor(seed,4),melR=rngFor(seed,5+melodyVersion*131);
  const chordRoots=[];
  for(let b=0;b<bars;b++) {
    const d=degreeFor(b), time=b*bar,groove=palette.grooves[Math.floor(b/8)%palette.grooves.length];
    const section=sectionFor(b), intensity=section==='Lift'?1:section==='Drift'?.57:section==='Intro'?.55:section==='Outro'?.62:.8;
    chordRoots.push(degreeNote(d));
    if(active(0,b)&&['guitar','nylon-guitar','muted-guitar','grunge-guitar'].includes(palette.tracks[0].kind)) {
      // Open, suspended voicings picked through a chorus guitar, with rests between phrases.
      const voicing=[degreeNote(d,1),degreeNote(d+4,1),degreeNote(d+6,1),degreeNote(d+8,1)];
      const pickPattern=section==='Intro'||section==='Drift'?[0,1.75,3]:section==='Lift'?[0,.5,1.25,2,2.75,3.5]:[0,.75,1.75,2.5,3.5];
      pickPattern.forEach((p,i)=>{
        const voice=(i+b%2)%voicing.length;
        add(0,time+p*beat+.012*voice,beat*(i===0?2.2:1.4),voicing[voice],(.18+keysR()*.055)*intensity,palette.tracks[0].kind,voice%2===0?-.26:.24);
        if(section==='Lift'&&i===0)add(0,time+p*beat+.035,beat*2,voicing[2],.12,palette.tracks[0].kind,.4);
      });
      if(vibe==='ghost'&&active(3,b)&&b%chordLength===0) {
        [degreeNote(d,1),degreeNote(d+2,1),degreeNote(d+6,0)].forEach((note,i)=>add(3,time+.08+i*.025,chordLength*bar*.86,note,.075*intensity,'vhs-pad',(i-1)*.36));
      }
    } else if(active(0,b)&&palette.chordStyle==='arpeggio') {
      const voicing=[degreeNote(d,1),degreeNote(d+4,1),degreeNote(d+2,1),degreeNote(d+6,1)];
      const steps=section==='Intro'?[0,1.5,3]:[0,.75,1.5,2.5,3.25];
      steps.forEach((p,i)=>add(0,time+p*beat,beat*.85,voicing[(i+b)%4],.17*intensity,palette.tracks[0].kind,(i%2===0?-.24:.28)));
    } else if(active(0,b)&&b%chordLength===0) {
      const voicing=[degreeNote(d,1),degreeNote(d+2,1),degreeNote(d+4,0),degreeNote(d+6,0)];
      if(vibe==='soul')voicing.push(degreeNote(d+8,0));
      voicing.forEach((note,i)=>add(0,time+i*.018,palette.chordStyle==='stabs'?beat*.8:chordLength*bar*.87,note,.18*intensity,palette.tracks[0].kind,(i-1.5)*.15));
      if(palette.chordStyle==='stabs' && section!=='Intro') {
        voicing.slice(0,3).forEach((note,i)=>add(0,time+beat*2.5+i*.015,beat*.6,note,.13*intensity,palette.tracks[0].kind,(i-1)*.25));
      }
    }
    if(vibe!=='ghost'&&section==='Lift' && keysR()<.45)add(0,time+beat*3.5,beat*.8,degreeNote(d+8,1),.09,palette.tracks[0].kind,-.4);
    if(active(1,b)) {
      const bassKind=palette.tracks[1].kind;
      const rhythm=section==='Drift'?[0,2.75]:groove==='baile'?[0,.75,1.5,2.25,3.5]:groove==='halftime'?[0,1.75,3.25]:vibe==='soul'?[0,1.5,2.75,3.5]:[0,1.75,2.5];
      rhythm.forEach((p,i)=>{
        let note=degreeNote(d,-1);
        if(i===rhythm.length-1 && bassR()<.4)note=degreeNote(d+4,-1);
        if(['808-bass','rubber-bass'].includes(bassKind)&&note>40)note-=12;
        const slide=bassKind==='808-bass'&&i===rhythm.length-1&&bassR()<.55?note+choose(bassR,[2,3,7]):null;
        add(1,time+p*beat,beat*(bassKind==='808-bass'?Math.min(1.75,(rhythm[i+1]??4)-p+.2):i===0?1.3:.65),note,.35*intensity,bassKind,0,{slide});
      });
    }
    if(active(2,b) && b<bars-2 && !(palette.experimental&&section==='Lift'&&b%8===palette.dropBar)) {
      if(section!=='Drift') {
        const kickSteps=groove==='baile'?[0,3,6,8,11,14]:groove==='halftime'?[0,7,10]:groove==='broken'?[0,5,10,13]:palette.kickPattern;
        kickSteps.filter((_,i)=>i===0||drumR()<.8).forEach(step=>add(2,time+step*beat/4,.45,0,.64*intensity,'kick'));
        (palette.halfTime||groove==='halftime'?[8]:[4,12]).forEach(step=>add(2,time+step*beat/4+.012,.22,0,.42*intensity,'snare',.08));
        if(drumR()<.35)add(2,time+15*beat/4,.11,0,.12,'snare',-.08);
      }
      for(let step=0;step<16;step++) {
        if((vibe==='ghost'?step%4===0||step===6||step===14&&section==='Lift':step%2===0) || section==='Lift'&&drumR()<.24) {
          const swing=(step%4===2?mood.swing*beat:0), vel=(step%4===0?.22:.12)*intensity*(.8+drumR()*.4);
          add(2,time+step*beat/4+swing,.055,0,vel,'hat',step%4===0?-.32:.38);
        }
      }
      if(section==='Lift'&&b%4===3)add(2,time+beat*3.5,.35,0,.16,'openhat',.35);
      if(vibe==='soul'&&drumR()<.5)add(2,time+beat*2.75,.1,0,.14,'rim',-.28);
      if(palette.tracks[2].kind==='brush'&&drumR()<.7)add(2,time+beat*1.5,.18,0,.14,'shaker',-.4);
      if(palette.tracks[2].kind==='machine'&&section==='Lift'&&b%4===3)[2.5,3,3.5].forEach((p,i)=>add(2,time+beat*p,.2,43-i*3,.19,'tom',i*.2));
      if(groove==='baile'){[2,7,10,15].forEach(step=>add(2,time+step*beat/4,.11,0,.21*intensity,'rim',step%2?.38:-.4));[1,5,9,13].forEach(step=>add(2,time+step*beat/4,.13,0,.12,'shaker',-.25));}
      if(palette.experimental&&drumR()<.65)add(2,time+beat*choose(drumR,[.75,1.25,2.75,3.25]),.35,choose(drumR,[55,62,67]),.16,'metal',choose(drumR,[-.6,.6]));
      if(palette.experimental&&section==='Lift'&&b%4===3)[3.25,3.5,3.75].forEach((p,i)=>add(2,time+beat*p,.12,38+i*3,.13,'tom',-.4+i*.4));
    }
  }
  // A recurring motif with chord-aware variations makes a song, not an endless random loop.
  const motif=Array.from({length:8},()=>choose(melR,[0,2,4,6,8]));
  const motifRhythm=Array.from({length:8},()=>choose(melR,[.5,1,1.5,2.5,3]));
  for(let b=0;b<bars;b++) {
    const section=sectionFor(b),d=degreeFor(b),time=b*bar;
    if(!active(3,b) || section==='Outro'&&b>=bars-2)continue;
    const pos=b%8,degree=d+motif[pos];
    const high=section==='Lift'&&vibe!=='ghost'?1:0;
    const note=degreeNote(degree,1+high);
    add(3,time+(b===0?0:motifRhythm[pos])*beat,beat*choose(melR,[.6,1,1.5]),note,vibe==='ghost'?.12:section==='Lift'?.20:.14,palette.tracks[3].kind,choose(melR,[-.38,.25,.4]));
    if(section==='Lift' || section==='Drift' || melR()<.3) {
      add(3,time+(motifRhythm[pos]+.75)*beat,beat*.5,degreeNote(d+choose(melR,[2,4,6]),vibe==='ghost'?1:2),vibe==='ghost'?.07:.10,palette.tracks[3].kind,-.3);
    }
  }
  events.sort((a,b)=>a.time-b.time);
  const nameA=['Lavender','Velvet','Pink','Midnight','Soft','Violet','Stardust','Afterhours','Moonlit','Cosmic'];
  const nameB=['Transfer','Platform','Orbit','Window','Frequency','Daydream','Arrival','Signal','Local','Echo'];
  const name=choose(r,nameA)+' '+choose(r,nameB);
  const key=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][root%12]+(vibe==='soul'?' major':vibe==='ghost'?' Dorian':' minor');
  return {seed,vibe,duration,bpm,melodyVersion,name,key,events,sections,bar,root,palette};
}
const hz=n=>440*Math.pow(2,(n-69)/12);
function noiseBuffer(ctx,seed,length=2) {
  const buf=ctx.createBuffer(1,Math.ceil(length*ctx.sampleRate),ctx.sampleRate),data=buf.getChannelData(0),r=rngFor(seed,99);
  for(let i=0;i<data.length;i++)data[i]=r()*2-1;
  return buf;
}
function guitarBuffer(ctx,graph,note,kind='guitar') {
  const cacheKey=kind+':'+note;
  if(graph.guitarBuffers.has(cacheKey))return graph.guitarBuffers.get(cacheKey);
  // Karplus–Strong: a short excitation travels around a damped string loop.
  // The pitch comes from the string length, rather than a prerecorded guitar sample.
  const period=Math.max(8,Math.round(ctx.sampleRate/hz(note)-.5));
  const ring=new Float32Array(period),random=rngFor(graph.seed,200+note);
  let previous=0;
  const soften=kind==='nylon-guitar'?.52:kind==='muted-guitar'?.58:.28;
  for(let i=0;i<period;i++){const excitation=(random()*2-1)*.65;ring[i]=excitation*(1-soften)+previous*soften+Math.sin(i/period*Math.PI*2)*(kind==='fretless-bass'?.45:.22)+Math.sin(i/period*Math.PI*4)*.07;previous=excitation;}
  const average=ring.reduce((sum,n)=>sum+n,0)/period;for(let i=0;i<period;i++)ring[i]-=average;
  const buffer=ctx.createBuffer(1,Math.round(ctx.sampleRate*4),ctx.sampleRate),data=buffer.getChannelData(0);
  const damping=kind==='nylon-guitar'?.4973:kind==='muted-guitar'?.4925:kind==='fretless-bass'?.4997:.4994;
  for(let i=0;i<data.length;i++){const index=i%period;data[i]=ring[index];ring[index]=damping*(ring[index]+ring[(index+1)%period]);}
  let peak=.001;for(let i=0;i<data.length;i++)peak=Math.max(peak,Math.abs(data[i]));
  for(let i=0;i<data.length;i++)data[i]=data[i]/peak*.85;
  graph.guitarBuffers.set(cacheKey,buffer);return buffer;
}
function driveCurve(amount){const curve=new Float32Array(2048);for(let i=0;i<curve.length;i++){const x=i/(curve.length-1)*2-1;curve[i]=Math.tanh(x*amount)/Math.tanh(amount);}return curve;}
export function createGraph(ctx,song,mix,destination=ctx.destination,offset=0) {
  const extraNodes=[],lfos=[];
  const kit=song.palette.tracks[2].kind;
  const compressor=ctx.createDynamicsCompressor();
  compressor.threshold.value=-15;compressor.knee.value=16;compressor.ratio.value=3;compressor.attack.value=.008;compressor.release.value=.2;
  const master=ctx.createGain(),fade=ctx.createGain();master.gain.value=mix.master;
  compressor.connect(master);master.connect(fade);fade.connect(destination);
  const tracks=mix.volumes.map((volume,i)=>{
    const gain=ctx.createGain(),filter=ctx.createBiquadFilter();
    gain.gain.value=mix.muted[i]?0:volume;
    filter.type='lowpass';filter.frequency.value=12000-mix.warmth*95;filter.Q.value=.35;
    if(['guitar','muted-guitar','grunge-guitar'].includes(song.palette.tracks[i].kind)){
      const amp=ctx.createWaveShaper();amp.curve=driveCurve(song.palette.tracks[i].kind==='grunge-guitar'?5:1.65);amp.oversample='2x';gain.connect(amp);amp.connect(filter);extraNodes.push(amp);
    }else gain.connect(filter);
    const duck=ctx.createGain();filter.connect(duck);duck.connect(compressor);extraNodes.push(duck);return {gain,filter,duck};
  });
  const verb=ctx.createConvolver(),verbGain=ctx.createGain();
  const ir=ctx.createBuffer(2,Math.ceil(ctx.sampleRate*(song.vibe==='ghost'?2.4:1.7)),ctx.sampleRate),r=rngFor(song.seed,73);
  for(let channel=0;channel<2;channel++) {
    const data=ir.getChannelData(channel);
    for(let i=0;i<data.length;i++)data[i]=(r()*2-1)*Math.pow(1-i/data.length,song.vibe==='ghost'?2.4:3.2)*.3;
  }
  verb.buffer=ir;verbGain.gain.value=mix.space/100*.65;
  verb.connect(verbGain);verbGain.connect(compressor);
  [0,3].forEach(i=>tracks[i].filter.connect(verb));
  const delay=ctx.createDelay(1),feedback=ctx.createGain(),delayGain=ctx.createGain();
  delay.delayTime.value=60/song.bpm*.75;feedback.gain.value=.24;delayGain.gain.value=.16;
  tracks[3].filter.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(delayGain);delayGain.connect(compressor);
  const electricTracks=song.palette.tracks.map((t,i)=>['guitar','muted-guitar','grunge-guitar'].includes(t.kind)?i:-1).filter(i=>i>=0);
  if(electricTracks.length){
    const guitarSend=ctx.createGain();guitarSend.gain.value=.32;electricTracks.forEach(i=>tracks[i].filter.connect(guitarSend));guitarSend.connect(delay);extraNodes.push(guitarSend);
    // Two drifting short delays create the wide, unstable chorus guitar texture.
    [-1,1].forEach((side,i)=>{
      const chorus=ctx.createDelay(.1),mod=ctx.createOscillator(),depth=ctx.createGain(),wet=ctx.createGain(),pan=ctx.createStereoPanner();
      chorus.delayTime.value=.022+i*.005;mod.frequency.value=.43+i*.18;depth.gain.value=.0036;wet.gain.value=.25;pan.pan.value=side*.8;
      electricTracks.forEach(i=>tracks[i].filter.connect(chorus));mod.connect(depth);depth.connect(chorus.delayTime);chorus.connect(wet);wet.connect(pan);pan.connect(compressor);pan.connect(verb);
      mod.start(ctx.currentTime);mod.stop(ctx.currentTime+song.duration-offset+.1);lfos.push(mod);extraNodes.push(chorus,mod,depth,wet,pan);
    });
  }
  if(kit==='gated'||kit==='machine'){
    // A short, abruptly gated room gives the snare its vintage drum-machine bloom.
    const room=ctx.createConvolver(),roomGain=ctx.createGain(),roomBuffer=ctx.createBuffer(2,Math.round(ctx.sampleRate*.24),ctx.sampleRate),roomRandom=rngFor(song.seed,88);
    for(let ch=0;ch<2;ch++){const data=roomBuffer.getChannelData(ch);for(let i=0;i<data.length;i++)data[i]=(roomRandom()*2-1)*Math.pow(1-i/data.length,.45)*.32;}
    room.buffer=roomBuffer;roomGain.gain.value=.23;tracks[2].filter.connect(room);room.connect(roomGain);roomGain.connect(compressor);extraNodes.push(room,roomGain);
  }
  const noise=noiseBuffer(ctx,song.seed);
  fade.gain.setValueAtTime(Math.min(1,offset/1.5+.05),ctx.currentTime);
  fade.gain.linearRampToValueAtTime(1,ctx.currentTime+Math.max(.01,1.5-offset));
  const remain=song.duration-offset;
  fade.gain.setValueAtTime(1,ctx.currentTime+Math.max(0,remain-4));
  fade.gain.linearRampToValueAtTime(0,ctx.currentTime+remain);
  return {tracks,master,verbGain,noise,fade,compressor,delay,feedback,verb,delayGain,seed:song.seed,kit,experimental:song.palette.experimental,guitarBuffers:new Map(),
    update(next){const t=ctx.currentTime;next.volumes.forEach((v,i)=>{tracks[i].gain.gain.setTargetAtTime(next.muted[i]?0:v,t,.03);tracks[i].filter.frequency.setTargetAtTime(12000-next.warmth*95,t,.05);});master.gain.setTargetAtTime(next.master,t,.02);verbGain.gain.setTargetAtTime(next.space/100*.65,t,.05);},
    dispose(){lfos.forEach(lfo=>{try{lfo.stop();}catch{}});[master,fade,compressor,verb,verbGain,delay,feedback,delayGain,...extraNodes,...tracks.flatMap(t=>[t.gain,t.filter])].forEach(n=>{try{n.disconnect();}catch{}});}
  };
}
export function scheduleEvent(ctx,graph,event,time,vibe,remaining) {
  const voiceLevel={guitar:1.8,'nylon-guitar':2.4,'muted-guitar':2.6,'fretless-bass':1.7,vibes:1.4,marimba:1.4,'metallic-keys':1.3};
  const e={...event,velocity:event.velocity*(voiceLevel[event.kind]||1)},duration=Math.max(.03,remaining ?? e.dur),frequency=hz(e.note);
  const gain=ctx.createGain(),pan=ctx.createStereoPanner();pan.pan.value=e.pan;
  gain.connect(pan);pan.connect(graph.tracks[e.track].gain);
  const nodes=[gain,pan],sources=[];
  const osc=(type,freq,detune=0)=>{const o=ctx.createOscillator();o.type=type;o.frequency.value=freq;o.detune.value=detune;sources.push(o);nodes.push(o);return o;};
  const volume=(input,target,amount)=>{const g=ctx.createGain();g.gain.value=amount;input.connect(g);g.connect(target);nodes.push(g);return g;};
  let stop=time+duration+.5;
  if(['guitar','nylon-guitar','muted-guitar','grunge-guitar','fretless-bass'].includes(e.kind)) {
    const source=ctx.createBufferSource();source.buffer=guitarBuffer(ctx,graph,e.note,e.kind);source.detune.value=e.pan*9;sources.push(source);nodes.push(source);
    const cabinet=ctx.createBiquadFilter();cabinet.type='lowpass';cabinet.frequency.value=e.kind==='fretless-bass'?950:e.kind==='nylon-guitar'?2300:e.kind==='grunge-guitar'?2800:4100;cabinet.Q.value=.5;source.connect(cabinet);cabinet.connect(gain);nodes.push(cabinet);
    if(e.kind==='fretless-bass'){source.playbackRate.setValueAtTime(.975,time);source.playbackRate.exponentialRampToValueAtTime(1,time+.06);}
    gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(e.velocity,time+.006);gain.gain.setTargetAtTime(e.velocity*.55,time+.02,.12);gain.gain.setTargetAtTime(.0001,time+duration,.2);stop=time+duration+1;
  } else if(e.kind==='kick'||e.kind==='tom') {
    const isTom=e.kind==='tom',end=isTom?frequency:graph.kit==='plastic'?51:graph.kit==='brush'?58:43;
    const o=osc('sine',isTom?frequency*1.7:graph.kit==='plastic'?230:155);o.frequency.setValueAtTime(isTom?frequency*1.7:graph.kit==='plastic'?230:155,time);o.frequency.exponentialRampToValueAtTime(end,time+(isTom?.075:.11));o.connect(gain);
    const decay=isTom?.23:graph.kit==='brush'?.25:.40;
    gain.gain.setValueAtTime(.001,time);gain.gain.linearRampToValueAtTime(e.velocity,time+.003);gain.gain.exponentialRampToValueAtTime(.001,time+decay);stop=time+decay+.03;
    if(!isTom&&graph.experimental)[0,3].forEach(i=>{const duck=graph.tracks[i].duck.gain;duck.setValueAtTime(.64,time);duck.linearRampToValueAtTime(1,time+.16);});
  } else if(['snare','hat','openhat','rim','shaker'].includes(e.kind)) {
    const source=ctx.createBufferSource();source.buffer=graph.noise;sources.push(source);nodes.push(source);
    const filter=ctx.createBiquadFilter();nodes.push(filter);
    filter.type=e.kind==='snare'||e.kind==='shaker'?'bandpass':'highpass';
    filter.frequency.value=e.kind==='snare'?(graph.kit==='brush'?1100:graph.kit==='plastic'?3200:1800):e.kind==='rim'?2600:e.kind==='shaker'?5100:graph.kit==='brush'?5800:7600;
    filter.Q.value=e.kind==='rim'?8:e.kind==='shaker'?1.3:.7;source.connect(filter);filter.connect(gain);
    const decay=e.kind==='snare'?(graph.kit==='brush'?.25:graph.kit==='gated'||graph.kit==='plastic'?.12:.19):e.kind==='openhat'?.30:e.kind==='rim'?.07:e.kind==='shaker'?.1:.045;
    gain.gain.setValueAtTime(e.velocity*(graph.kit==='brush'?.8:1),time);gain.gain.exponentialRampToValueAtTime(.0001,time+decay);stop=time+decay+.03;
    if(e.kind==='snare'){const body=osc('triangle',graph.kit==='plastic'?235:190);volume(body,gain,graph.kit==='brush'?.13:.28);}
    if(e.kind==='rim'){const body=osc('sine',graph.kit==='baile'?760:1100);volume(body,gain,.4);}
  } else {
    const filter=ctx.createBiquadFilter();nodes.push(filter);filter.type='lowpass';filter.Q.value=.6;filter.connect(gain);
    let attack=.025,release=.35,sustain=.45;
    const tone=(type,multiple=1,weight=1,detune=0)=>{const o=osc(type,frequency*multiple,detune);volume(o,filter,weight);return o;};
    const fm=(ratio,index,decay)=>{const carrier=osc('sine',frequency),modulator=osc('sine',frequency*ratio),depth=ctx.createGain();nodes.push(depth);modulator.connect(depth);depth.connect(carrier.frequency);depth.gain.setValueAtTime(frequency*index,time);depth.gain.exponentialRampToValueAtTime(Math.max(.1,frequency*.025),time+decay);carrier.connect(filter);return carrier;};
    if(['fm-keys','glass','metallic-keys','metal'].includes(e.kind)) {
      attack=.006;release=e.kind==='metal'?.22:.75;sustain=e.kind==='fm-keys'?.3:e.kind==='glass'?.20:.08;
      filter.frequency.value=e.kind==='fm-keys'?3500:6800;
      fm(e.kind==='fm-keys'?2:e.kind==='glass'?2.71:2.414,e.kind==='fm-keys'?1.4:e.kind==='glass'?2.2:5,e.kind==='fm-keys'?.38:e.kind==='glass'?.65:.16);
      if(e.kind==='fm-keys')tone('sine',1,.2,-4);
    } else if(e.kind==='organ') {
      attack=.012;release=.14;sustain=.85;filter.frequency.value=4200;
      [[1,.48],[2,.25],[3,.16],[4,.08],[6,.03]].forEach(([multiple,weight])=>tone('sine',multiple,weight));
    } else if(e.kind==='vibes'||e.kind==='marimba') {
      attack=.004;release=e.kind==='vibes'?.8:.18;sustain=e.kind==='vibes'?.24:.10;filter.frequency.value=e.kind==='vibes'?5200:2700;
      tone('sine',1,.8);const overtone=osc('sine',frequency*(e.kind==='vibes'?4:3.99)),partial=volume(overtone,filter,.24);
      partial.gain.setValueAtTime(.24,time);partial.gain.exponentialRampToValueAtTime(.001,time+(e.kind==='vibes'?.45:.1));
      if(e.kind==='vibes'){const tremolo=osc('sine',5.7),depth=ctx.createGain();depth.gain.value=.012;tremolo.connect(depth);depth.connect(gain.gain);nodes.push(depth);}
    } else if(['vhs-pad','vhs-lead','analog-pad','string-pad','brass-keys'].includes(e.kind)) {
      const pad=['vhs-pad','analog-pad','string-pad'].includes(e.kind),strings=e.kind==='string-pad',brass=e.kind==='brass-keys';
      attack=strings?.5:pad?.30:brass?.075:.04;release=pad?1.1:.7;sustain=pad?.72:.5;filter.Q.value=brass?1.8:.8;
      filter.frequency.setValueAtTime(brass?380:pad?1600:2200,time);
      if(brass)filter.frequency.exponentialRampToValueAtTime(2800,time+.10);
      filter.frequency.exponentialRampToValueAtTime(brass?900:700,time+duration+.4);
      tone('sawtooth',1,strings?.38:.32,-(strings?14:9));tone(strings?'sawtooth':'triangle',1,strings?.38:.68,strings?13:8);
      if(strings)tone('sine',2,.12,-2);
    } else if(e.kind==='flute') {
      attack=.10;release=.25;sustain=.65;filter.frequency.value=1900;filter.Q.value=.45;
      tone('sine',1,.8);tone('triangle',1,.18,3);
      const breath=ctx.createBufferSource();breath.buffer=graph.noise;sources.push(breath);nodes.push(breath);const breathFilter=ctx.createBiquadFilter();breathFilter.type='bandpass';breathFilter.frequency.value=frequency*3;breathFilter.Q.value=2;nodes.push(breathFilter);breath.connect(breathFilter);volume(breathFilter,filter,.025);
    } else if(e.kind==='bubble'||e.kind==='rubber-bass') {
      attack=.009;release=.20;sustain=.28;filter.Q.value=2.2;
      filter.frequency.setValueAtTime(4700,time);filter.frequency.exponentialRampToValueAtTime(e.kind==='rubber-bass'?550:950,time+.22);
      const carrier=fm(.5,e.kind==='rubber-bass'?3.8:2.5,.20);carrier.frequency.setValueAtTime(frequency*.82,time);carrier.frequency.exponentialRampToValueAtTime(frequency,time+.055);
      if(e.kind==='rubber-bass')tone('sine',1,.32);
    } else if(e.kind==='acid') {
      attack=.005;release=.18;sustain=.35;filter.Q.value=6;
      filter.frequency.setValueAtTime(230,time);filter.frequency.exponentialRampToValueAtTime(3900,time+.045);filter.frequency.exponentialRampToValueAtTime(390,time+Math.max(.08,duration));
      tone('sawtooth',1,.55);tone('square',1,.23,-3);
    } else if(e.kind==='808-bass') {
      attack=.007;release=.24;sustain=.8;filter.frequency.value=1600;
      const carrier=osc('sine',frequency),shape=ctx.createWaveShaper();shape.curve=driveCurve(2.7);shape.oversample='2x';nodes.push(shape);carrier.connect(shape);volume(shape,filter,.75);tone('triangle',1,.12);
      carrier.frequency.setValueAtTime(frequency*1.21,time);carrier.frequency.exponentialRampToValueAtTime(frequency,time+.055);
      if(e.slide!==null&&e.slide!==undefined){carrier.frequency.setValueAtTime(frequency,time+duration*.5);carrier.frequency.exponentialRampToValueAtTime(hz(e.slide),time+duration*.86);}
    } else if(['round-bass','sub-bass','analog-bass','pluck-bass','bass'].includes(e.kind)) {
      attack=.012;release=.16;sustain=e.kind==='pluck-bass'?.23:.65;
      filter.frequency.setValueAtTime(e.kind==='analog-bass'?1800:e.kind==='pluck-bass'?2200:700,time);
      if(e.kind==='analog-bass'||e.kind==='pluck-bass')filter.frequency.exponentialRampToValueAtTime(350,time+.15);
      tone(e.kind==='analog-bass'?'sawtooth':e.kind==='pluck-bass'?'triangle':'sine',1,.8);if(e.kind!=='sub-bass')tone('sine',1,.2);
    } else {
      // Compatible fallback for legacy event types.
      attack=.03;release=.5;filter.frequency.value=3000;tone('triangle',1,.65,-4);tone('sine',1,.35,4);
    }
    gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(e.velocity,time+attack);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001,e.velocity*sustain),time+Math.max(attack+.01,duration*.85));
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
