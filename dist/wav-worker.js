// 16-bit stereo PCM encoding happens off the UI thread.
self.onmessage=({data:{left,right,sampleRate}})=>{
  const frames=left.length,buffer=new ArrayBuffer(44+frames*4),view=new DataView(buffer);
  const str=(offset,value)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};
  str(0,'RIFF');view.setUint32(4,36+frames*4,true);str(8,'WAVE');str(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,2,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*4,true);view.setUint16(32,4,true);view.setUint16(34,16,true);str(36,'data');view.setUint32(40,frames*4,true);
  let peak=0;for(let i=0;i<frames;i++)peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
  // Only attenuate clipping. Preserve relative mix levels and master volume.
  const scale=peak>.98?.98/peak:1;
  for(let i=0;i<frames;i++){const a=Math.max(-1,Math.min(1,left[i]*scale)),b=Math.max(-1,Math.min(1,right[i]*scale));view.setInt16(44+i*4,a*(a<0?32768:32767),true);view.setInt16(46+i*4,b*(b<0?32768:32767),true);}
  self.postMessage(buffer,[buffer]);
};
