import {MOODS,DEFAULT_MIX,initialMix,compose,Player,renderWav} from './engine.js';
const $=selector=>document.querySelector(selector),$$=selector=>Array.from(document.querySelectorAll(selector));
const copy=value=>JSON.parse(JSON.stringify(value));
let vibe='haze',duration=150,song=null,mix=copy(DEFAULT_MIX),exporting=false,generating=false;
const storageKey='sparkline.collection.v1';
let saved=[];
try{const value=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(value))saved=value.filter(s=>typeof s.seed==='string'&&s.seed.length===32&&MOODS[s.vibe]&&[120,150,180].includes(s.duration)&&s.mix?.volumes?.length===4).slice(0,30);}catch{}
const player=new Player(()=>{updateTransport();status('End of the line. Keep this frequency or find another.');});
const format=seconds=>`${Math.floor(seconds/60)}:${Math.floor(seconds%60).toString().padStart(2,'0')}`;
const status=message=>$('#status').textContent=message;
const params=()=>({seed:song.seed,vibe:song.vibe,duration:song.duration,bpm:song.bpm,melodyVersion:song.melodyVersion});
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(saved));return true;}catch{status('This browser cannot save more beats. Download a WAV to keep this one.');return false;}}
function updateSaved(){const i=saved.findIndex(s=>s.seed===song?.seed);if(i>=0){saved[i]={...params(),mix:copy(mix)};persist();}}
function updateFavorite(){const kept=saved.some(s=>s.seed===song?.seed);$('#favorite').textContent=kept?'♥':'♡';$('#favorite').classList.toggle('saved',kept);$('#favorite').setAttribute('aria-label',kept?'Remove this beat from your collection':'Save this beat to your collection');$('#saved-count').textContent=saved.length;}
function updateControls(){
  const off=!song||exporting;
  $$('#editor input,#editor button').forEach(el=>el.disabled=off);
  $('#download').disabled=off;$('#favorite').disabled=!song||exporting;$('#play').disabled=!song;$('#seek').disabled=!song;
  $('#generate').disabled=exporting||generating;$('#library-open').disabled=exporting;
}
function updateTransport(){document.body.classList.toggle('playing',player.playing);$('#play').textContent=player.playing?'Ⅱ':'▶';$('#play').setAttribute('aria-label',player.playing?'Pause beat':'Play beat');}
function showSong(){
  $('#track-kicker').textContent=`${MOODS[song.vibe].label.toUpperCase()} / ORIGINAL FREQUENCY`;
  $('#track-title').textContent=song.name;
  const meta=$('#track-meta');meta.replaceChildren();
  [song.bpm+' BPM',song.key,format(song.duration),song.seed.slice(0,6).toUpperCase()].forEach(text=>{const span=document.createElement('span');span.textContent=text;meta.append(span);});
  $('#cover-id').textContent=song.seed.slice(0,8).toUpperCase();
  $('#total-time').textContent=format(song.duration);$('#seek').max=song.duration;
  $('#tempo').value=song.bpm;$('#bpm-value').textContent=song.bpm+' BPM';
  $('#warmth').value=mix.warmth;$('#warmth-value').textContent=mix.warmth+'%';$('#space').value=mix.space;$('#space-value').textContent=mix.space+'%';$('#master').value=mix.master*100;
  const labels=song.palette.tracks.map(track=>[track.label,track.detail]);
  $$('.mixer-track').forEach((el,i)=>{el.querySelector('strong').textContent=labels[i][0];el.querySelector('small').textContent=labels[i][1];el.querySelector('input').setAttribute('aria-label',labels[i][0]+' volume');el.querySelector('.mute').setAttribute('aria-label','Mute '+labels[i][0]);el.querySelector('input').value=mix.volumes[i]*100;el.querySelector('output').textContent=Math.round(mix.volumes[i]*100)+'%';el.querySelector('.mute').setAttribute('aria-pressed',String(mix.muted[i]));el.querySelector('.mute').textContent=mix.muted[i]?'OFF':'ON';});
  $('#generate-label').textContent='Another universe';$('#generate-sub').textContent='REGENERATE A BRAND NEW BEAT';
  document.body.dataset.beatSeed=song.seed;document.body.dataset.eventCount=song.events.length;
  updateControls();updateFavorite();updateTransport();
}
async function generate(){
  if(generating||exporting)return;generating=true;updateControls();
  try{await player.unlock();player.stop();song=compose({vibe,duration});mix=initialMix(vibe);mix.master=Number($('#master').value)/100;player.offset=0;await player.play(song,mix,0);showSong();status(song.name+' · '+song.palette.intro.name+'. Shape it, keep it, or catch another frequency.');}
  catch(error){console.error(error);status('Audio could not start. Tap Play to try again.');if(song)showSong();}
  finally{generating=false;updateControls();}
}
$('#generate').addEventListener('click',generate);
$$('.vibe').forEach(button=>button.addEventListener('click',()=>{vibe=button.dataset.vibe;$$('.vibe').forEach(b=>{const active=b===button;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});if(song)status('Next frequency: '+MOODS[vibe].label+'. Tap Another universe to generate it.');}));
$$('.length-switch button').forEach(button=>button.addEventListener('click',()=>{duration=Number(button.dataset.duration);$$('.length-switch button').forEach(b=>{const active=b===button;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});if(!song){$('#total-time').textContent=format(duration);$('#seek').max=duration;}else status('Your next beat will be '+format(duration)+' long.');}));
$('#play').addEventListener('click',async()=>{if(!song)return;try{if(player.playing)player.pause();else await player.play(song,mix);updateTransport();}catch(e){console.error(e);status('Audio could not start. Check your browser audio settings and try again.');}});
$('#seek').addEventListener('change',async e=>{if(!song)return;const pos=Number(e.target.value),wasPlaying=player.playing;player.stop();player.offset=pos;if(wasPlaying)await player.play(song,mix,pos);updateTransport();});
$('#seek').addEventListener('input',e=>$('#current-time').textContent=format(Number(e.target.value)));
$('#master').addEventListener('input',e=>{mix.master=Number(e.target.value)/100;player.update(mix);if(song)updateSaved();});
$$('.mixer-track').forEach((el,i)=>{
  el.querySelector('input').addEventListener('input',e=>{mix.volumes[i]=Number(e.target.value)/100;el.querySelector('output').textContent=e.target.value+'%';player.update(mix);updateSaved();});
  el.querySelector('.mute').addEventListener('click',e=>{mix.muted[i]=!mix.muted[i];e.currentTarget.setAttribute('aria-pressed',String(mix.muted[i]));e.currentTarget.textContent=mix.muted[i]?'OFF':'ON';player.update(mix);updateSaved();});
});
['warmth','space'].forEach(name=>$('#'+name).addEventListener('input',e=>{mix[name]=Number(e.target.value);$('#'+name+'-value').textContent=e.target.value+'%';player.update(mix);updateSaved();}));
$('#tempo').addEventListener('input',e=>$('#bpm-value').textContent=e.target.value+' BPM');
$('#tempo').addEventListener('change',async e=>{
  if(!song)return;const wasPlaying=player.playing,pos=player.position();player.stop();song=compose({...params(),bpm:Number(e.target.value)});player.offset=pos;if(wasPlaying)await player.play(song,mix,pos);showSong();updateSaved();status('Tempo updated. Your beat stays '+format(song.duration)+' long.');
});
$('#shuffle').addEventListener('click',async()=>{
  if(!song)return;const wasPlaying=player.playing,pos=player.position();player.stop();song=compose({...params(),melodyVersion:song.melodyVersion+1});player.offset=pos;if(wasPlaying)await player.play(song,mix,pos);showSong();updateSaved();status('A fresh melody is in orbit. Your chords, bass, and drums stay with you.');
});
$('#toggle-editor').addEventListener('click',()=>{const open=$('#editor').hidden;$('#editor').hidden=!open;$('#toggle-editor').setAttribute('aria-expanded',String(open));$('#toggle-editor span').textContent=open?'↘':'↗';});
$('#favorite').addEventListener('click',()=>{
  if(!song)return;const i=saved.findIndex(s=>s.seed===song.seed);if(i>=0){saved.splice(i,1);status('Beat removed from your collection.');}else{if(saved.length>=30){status('Your collection has 30 beats. Remove one or download this beat as a WAV.');return;}saved.unshift({...params(),mix:copy(mix)});status('Saved to your collection. Your edits will be saved here too.');}persist();updateFavorite();
});
function showLibrary(){
  const list=$('#library-list');list.replaceChildren();
  if(!saved.length){const empty=document.createElement('p');empty.className='empty-library';empty.textContent='Nothing in orbit yet. Make a beat and tap the heart to keep it here.';list.append(empty);}
  saved.forEach(s=>{
    const info=compose(s),item=document.createElement('div');item.className='saved-item';
    const label=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('small');title.textContent=info.name;detail.textContent=MOODS[s.vibe].label+' · '+s.bpm+' BPM · '+format(s.duration);label.append(title,detail);
    const load=document.createElement('button');load.textContent='Load & play';load.addEventListener('click',async()=>{try{song=info;mix=copy(s.mix);await player.play(song,mix,0);showSong();$('#library').close();status('Loaded '+song.name+' with your saved mix.');}catch(e){console.error(e);status('This beat could not start. Try again.');}});
    const remove=document.createElement('button');remove.textContent='×';remove.className='remove-saved';remove.setAttribute('aria-label','Remove '+info.name);remove.addEventListener('click',()=>{saved=saved.filter(x=>x.seed!==s.seed);persist();showLibrary();updateFavorite();});
    item.append(label,load,remove);list.append(item);
  });
}
$('#library-open').addEventListener('click',()=>{showLibrary();$('#library').showModal();});$('#library-close').addEventListener('click',()=>$('#library').close());
$('#library').addEventListener('click',e=>{if(e.target===$('#library')){const rect=e.target.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)e.target.close();}});
$('#download').addEventListener('click',async()=>{
  if(!song||exporting)return;exporting=true;updateControls();const snapshot=song,mixSnapshot=copy(mix);
  try{
    status('Rendering your full beat and current mix. Keep this tab open for a moment.');
    const wav=await renderWav(snapshot,mixSnapshot,p=>$('#download-label').textContent=p<40?'Preparing '+p+'%':p<85?'Rendering…':'Finishing…');
    const url=URL.createObjectURL(wav),a=document.createElement('a');a.href=url;a.download='sparkline-'+snapshot.name.toLowerCase().replaceAll(' ','-')+'-'+snapshot.seed.slice(0,6)+'.wav';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
    status('Your '+format(snapshot.duration)+' stereo WAV is ready. It includes your current mix and effects.');
  }catch(e){console.error(e);status('WAV export could not finish. Close other heavy tabs, then try again.');}
  finally{exporting=false;$('#download-label').textContent='Download WAV';updateControls();}
});
// Real analyser values drive the display during playback; the score drives the quiet overview.
const canvas=$('#visualizer'),ctx=canvas.getContext('2d'),bins=new Uint8Array(128);
let dragging=false;$('#seek').addEventListener('pointerdown',()=>dragging=true);window.addEventListener('pointerup',()=>dragging=false);
function frame(){
  const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  ctx.clearRect(0,0,w,h);const p=player.position();
  if(!dragging){$('#seek').value=p;$('#current-time').textContent=format(p);}
  const count=80,gap=w/count;
  if(player.playing&&player.analyser)player.analyser.getByteFrequencyData(bins);
  for(let i=0;i<count;i++){
    const v=player.playing?bins[Math.floor(i*1.5)]/255:0;
    const height=Math.max(2*dpr,v*h*.83);ctx.fillStyle=player.playing?'rgba(224,156,211,'+(.25+v*.65)+')':'#91729b40';ctx.fillRect(i*gap,(h-height)/2,Math.max(dpr,gap*.48),height);
  }
  if(song){const x=p/song.duration*w;ctx.fillStyle='#f7bcdf';ctx.fillRect(x,0,1.2*dpr,h);ctx.fillStyle='#e9a1df0b';ctx.fillRect(0,0,x,h);}
  requestAnimationFrame(frame);
}
updateControls();updateFavorite();requestAnimationFrame(frame);
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','BUTTON','TEXTAREA'].includes(document.activeElement.tagName)&&!$('#library').open){e.preventDefault();if(song)$('#play').click();}});
window.addEventListener('pagehide',()=>player.stop());
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let motionActive=!reducedMotion;
function showMotion(){document.body.classList.toggle('motion-paused',!motionActive);$('#motion-toggle').setAttribute('aria-pressed',String(motionActive));$('#motion-toggle').setAttribute('aria-label',motionActive?'Pause subway animation':'Resume subway animation');$('#motion-toggle span').textContent=motionActive?'Ⅱ':'▶';}
$('#motion-toggle').addEventListener('click',()=>{motionActive=!motionActive;showMotion();});showMotion();
