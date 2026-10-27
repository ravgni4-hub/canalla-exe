(()=>{
"use strict";
const byId=id=>document.getElementById(id);
function init(c,workerLogic){
 const layout=String.raw;
 document.body.innerHTML=
 '<div class="wrap">'+
 '<header class="top"><a class="logo" href="./index.html" aria-label="Главное меню"><span class="logoicon">C&gt;_</span><span><b>CANALLA<em>.EXE</em></b><small>OBJECT-ORIENTED CATASTROPHE</small></span></a><nav class="topnav"><a href="./index.html">← МЕНЮ</a><a href="./level'+(c.num-1)+'.html">LEVEL '+String(c.num-1).padStart(2,"0")+'</a>'+(c.next?'<a href="./level'+(c.num+1)+'.html">LEVEL '+String(c.num+1).padStart(2,"0")+' →</a>':'')+'</nav></header>'+
 '<section class="hero"><div class="eyebrow">LEVEL '+String(c.num).padStart(2,"0")+' / '+c.topic+'</div><h1>'+c.title+'</h1><p>'+c.description+'</p></section>'+
 '<main class="layout"><div class="stack">'+
 '<section class="panel"><div class="panelhead"><b>LIVE SCENE / '+c.sceneTitle+'</b><span class="minor" id="phase">READY</span></div><canvas id="scene" class="scene" width="900" height="470" role="img" aria-label="'+c.sceneAlt+'"></canvas><div class="scenestatus" id="scenestatus" aria-live="polite">'+c.sceneMessages[0]+'</div></section>'+
 '<section class="panel"><div class="panelhead"><b>MISSION OBJECTIVES</b><span class="minor" id="score">0 / 3</span></div><div class="objectives">'+
 '<div class="objective" id="obj1"><span class="check">○</span><div><b>01. '+c.objectives[0][0]+'</b><p>'+c.objectives[0][1]+'</p></div></div>'+
 '<div class="objective" id="obj2"><span class="check">○</span><div><b>02. '+c.objectives[1][0]+'</b><p>'+c.objectives[1][1]+'</p></div></div>'+
 '<div class="objective" id="obj3"><span class="check">○</span><div><b>03. '+c.objectives[2][0]+'</b><p>'+c.objectives[2][1]+'</p></div></div>'+
 '</div><div class="buttons"><button class="btn primary" type="button" id="action1">'+c.actions[0]+'</button><button class="btn secondary" type="button" id="action2" disabled>'+c.actions[1]+'</button><button class="btn" type="button" id="restart">↺ СБРОС</button></div><div class="snapshot" id="snapshot">'+c.snapshot[0]+'</div></section></div>'+
 '<div class="stack"><section class="panel"><div class="panelhead"><b>CODE EDITOR</b><span class="minor">'+c.file+'</span></div><div class="intro"><span class="pill">JAVASCRIPT</span>'+c.editorIntro+'</div><div class="codebox"><div class="codewrap"><span class="comment">'+c.codeTop+'</span></div><textarea id="editor" class="editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Редактор JavaScript"></textarea><div class="codewrap"><span class="comment">'+c.codeBottom+'</span></div></div><details class="api"><summary>Публичный API и контракты — раскрыть</summary><ul>'+c.api.map(x=>'<li>'+x+'</li>').join("")+'</ul></details><div class="buttons"><button class="btn primary" type="button" id="run">▶ ЗАПУСТИТЬ ТЕСТЫ</button><button class="btn" type="button" id="hints">ПОДСКАЗКА · 0/4</button></div><div id="hint" class="hintbox" hidden role="status"></div></section>'+
 '<section class="panel"><div class="panelhead"><b>TEST RUNNER</b><span class="minor">'+c.testCount+' ASSERTIONS</span></div><div class="terminal" id="terminal" role="log" aria-live="polite"></div></section>'+
 '<section class="panel"><div class="panelhead"><b>OBJECT EXPLORER</b><span class="minor">LIVE MODEL</span></div><div class="explorer" id="tree"></div></section></div></main>'+
 '<footer class="foot"><span>© CANALLA GAMES • РЕТРО БИТ • BUILD 0.4</span><span>КОД ИГРОКА ВЫПОЛНЯЕТСЯ В ИЗОЛИРОВАННОЙ ПЕСОЧНИЦЕ</span></footer></div>'+
 '<div class="winlayer" id="win" hidden><section class="win" role="dialog" aria-modal="true" aria-labelledby="win-title"><div id="achievement" class="winlabel"></div><h2 id="win-title">'+c.winTitle+'</h2><p>'+c.winDescription+'</p><div class="quote">'+c.quote+'</div><div class="buttons"><button type="button" class="btn primary" id="replay">↺ СЫГРАТЬ ЕЩЁ</button><button type="button" class="btn" id="close">ПОСМОТРЕТЬ КОД</button><a class="btn" href="./index.html">← МЕНЮ</a>'+(c.next?'<a class="btn secondary" href="./level'+(c.num+1)+'.html">LEVEL '+String(c.num+1).padStart(2,"0")+' →</a>':'')+'</div></section></div>';
 const state={action1:false,action2:false,won:false,busy:false,hints:0,frame:0};
 const editor=byId("editor"),term=byId("terminal"),canvas=byId("scene"),ctx=canvas.getContext("2d");
 let ready=false,pending=null,deadline=null;
 function log(t,kind=""){const d=document.createElement("div");d.className="log "+kind;d.textContent=t;term.append(d);term.scrollTop=term.scrollHeight;}
 function clear(){term.replaceChildren();}
 function status(){
  const vals=[state.action1,state.action2,state.won];
  ["obj1","obj2","obj3"].forEach((id,i)=>{const el=byId(id);el.classList.toggle("done",vals[i]);el.querySelector(".check").textContent=vals[i]?"✓":"○";});
  byId("score").textContent=vals.filter(Boolean).length+" / 3";
  byId("action1").disabled=state.action1||state.busy;
  byId("action2").disabled=!state.action1||state.action2||state.busy;
  byId("run").disabled=state.busy;
  const idx=state.won?3:state.action2?2:state.action1?1:0;
  byId("phase").textContent=c.phase[idx];
  byId("scenestatus").textContent=c.sceneMessages[idx];
  byId("snapshot").textContent=c.snapshot[idx];
  byId("tree").textContent=c.tree[idx];
 }
 function reset(){
  if(deadline)clearTimeout(deadline);
  deadline=null;pending=null;state.busy=false;state.action1=false;state.action2=false;state.won=false;state.hints=0;
  editor.value=c.starter;byId("hints").textContent="ПОДСКАЗКА · 0/4";byId("hint").hidden=true;byId("hint").replaceChildren();byId("win").hidden=true;
  clear();log("CANALLA QA / READY","dim");log("> "+c.readyNote);status();
 }
 byId("action1").onclick=()=>{state.action1=true;log("> "+c.actionLogs[0],"ok");status();};
 byId("action2").onclick=()=>{state.action2=true;log("> "+c.actionLogs[1],"ok");status();};
 byId("restart").onclick=reset;byId("replay").onclick=()=>{reset();window.scrollTo({top:0,behavior:"smooth"});};
 byId("close").onclick=()=>{byId("win").hidden=true;};
 byId("win").addEventListener("click",e=>{if(e.target===byId("win"))byId("win").hidden=true;});
 document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();run();}if(e.key==="Escape")byId("win").hidden=true;});
 editor.addEventListener("keydown",e=>{if(e.key==="Tab"){e.preventDefault();editor.setRangeText("  ",editor.selectionStart,editor.selectionEnd,"end");}});
 byId("hints").onclick=()=>{
  state.hints=Math.min(4,state.hints+1);
  byId("hints").textContent="ПОДСКАЗКА · "+state.hints+"/4";
  const hint=byId("hint");hint.hidden=false;hint.replaceChildren();const txt=document.createElement("div");txt.textContent=c.hints[state.hints-1];hint.append(txt);
  if(state.hints===4){const b=document.createElement("button");b.className="btn";b.type="button";b.textContent="ВСТАВИТЬ РЕШЕНИЕ";b.onclick=()=>{editor.value=c.solution;editor.focus();};hint.append(b);}
 };
 function runner(codeSource){
  let active=null;
  window.parent.postMessage({kind:"challenge-ready"},"*");
  window.addEventListener("message",ev=>{
   if(ev.source!==window.parent||!ev.data||ev.data.kind!=="challenge-run")return;
   const {id,code,action1,action2}=ev.data;
   if(typeof id!=="string"||typeof code!=="string"||code.length>12000){
    window.parent.postMessage({kind:"challenge-result",id,error:"Превышен лимит в 12 000 символов.",tests:[]},"*");return;
   }
   if(active)active.terminate();
   try{
    const url=URL.createObjectURL(new Blob([codeSource],{type:"text/javascript"}));
    const w=new Worker(url);URL.revokeObjectURL(url);active=w;
    w.onmessage=m=>{
     if(active!==w||!m.data||m.data.id!==id)return;
     window.parent.postMessage({kind:"challenge-result",id,error:m.data.error||null,tests:m.data.tests},"*");
     w.terminate();active=null;
    };
    w.onerror=err=>{if(active!==w)return;window.parent.postMessage({kind:"challenge-result",id,error:"Ошибка песочницы: "+err.message,tests:[]},"*");w.terminate();active=null;};
    w.postMessage({id,code,action1:!!action1,action2:!!action2});
    setTimeout(()=>{if(active===w){w.terminate();active=null;window.parent.postMessage({kind:"challenge-result",id,error:"Тайм-аут выполнения (3 секунды).",tests:[]},"*");}},3000);
   }catch(e){window.parent.postMessage({kind:"challenge-result",id,error:String(e),tests:[]},"*");}
  });
 }
 const frame=document.createElement("iframe");frame.sandbox="allow-scripts";frame.hidden=true;frame.title="Изолированный исполнитель";
 frame.srcdoc='<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; script-src &#39;unsafe-inline&#39; &#39;unsafe-eval&#39; blob:; worker-src blob:; connect-src &#39;none&#39;;"><scr'+'ipt>('+runner.toString()+')('+JSON.stringify('('+workerLogic.toString()+')()')+')<\/scr'+'ipt>';
 window.addEventListener("message",e=>{
  if(e.source!==frame.contentWindow||!e.data)return;
  if(e.data.kind==="challenge-ready"){ready=true;return;}
  if(e.data.kind==="challenge-result"&&e.data.id===pending)finish(e.data);
 });
 document.body.append(frame);
 function finish(data){
  if(!state.busy)return;
  if(deadline)clearTimeout(deadline);deadline=null;pending=null;state.busy=false;
  clear();log("CANALLA QA / TEST RUNNER","dim");
  if(data.error)log("✕ "+data.error,"fail");
  const tests=Array.isArray(data.tests)?data.tests:[];
  tests.forEach(t=>log((t.ok?"✓ ":"✕ ")+String(t.label).slice(0,130),t.ok?"ok":"fail"));
  state.won=!data.error&&tests.length===c.testCount&&tests.every(t=>t.ok);
  if(state.won){
   log("> "+c.testCount+"/"+c.testCount+" TESTS PASSED","ok");
   log("> CANALLA APPROVED","ok");
   byId("achievement").textContent=state.hints===0?"CANALLA APPROVED — NO HINTS":"CANALLA APPROVED — ALL TESTS GREEN";
   setTimeout(()=>{byId("win").hidden=false;byId("close").focus();},550);
  }else log("> Ошибка в контракте. Проверь результаты тестов.","warn");
  status();
 }
 function run(){
  if(state.busy)return;
  if(!ready){log("> Песочница ещё загружается. Повтори запуск.","warn");return;}
  state.busy=true;state.won=false;status();clear();log("CANALLA QA / RUNNING","dim");log("> Проверяю контракты и поведение объектов...");
  pending=Date.now()+"-"+Math.random();deadline=setTimeout(()=>finish({error:"Проверка не ответила за 3,5 секунды.",tests:[]}),3500);
  frame.contentWindow.postMessage({kind:"challenge-run",id:pending,code:editor.value,action1:state.action1,action2:state.action2},"*");
 }
 byId("run").onclick=run;
 const rectangle=(x,y,w,h,col)=>{ctx.fillStyle=col;ctx.fillRect(x|0,y|0,w|0,h|0);};
 const write=(s,x,y,size=18,color="#284352")=>{ctx.fillStyle=color;ctx.font="900 "+size+"px monospace";ctx.fillText(s,x,y);};
 function cat(x,y,t){
  const bob=Math.round(Math.sin(t/30)*2);y+=bob;
  rectangle(x+6,y+62,102,64,"#1b232d");rectangle(x+18,y+73,98,55,"#303b48");
  rectangle(x+18,y+117,17,34,"#171f29");rectangle(x+91,y+117,19,34,"#171f29");
  rectangle(x+77,y+20,75,72,"#212a35");rectangle(x+76,y+8,21,29,"#212a35");rectangle(x+133,y+8,18,29,"#212a35");
  rectangle(x+79,y+15,10,18,"#b17c90");rectangle(x+138,y+14,8,19,"#b17c90");
  rectangle(x+91,y+46,13,17,"#d9ec91");rectangle(x+127,y+46,14,17,"#d9ec91");
  rectangle(x+98,y+50,4,11,"#14252e");rectangle(x+133,y+50,4,11,"#14252e");
  rectangle(x+111,y+72,12,8,"#b27c8b");
  rectangle(x+81,y+79,24,2,"#a9bbb8");rectangle(x+128,y+79,23,2,"#a9bbb8");
  rectangle(x-15,y+102,28,14,"#202934");rectangle(x-19,y+78,14,33,"#273340");
 }
 function draw(){
  state.frame++;
  ctx.imageSmoothingEnabled=false;
  rectangle(0,0,900,470,"#b9d6c9");rectangle(0,0,900,67,"#83b2ad");
  rectangle(0,325,900,145,"#d2a984");rectangle(0,325,900,7,"#829d98");
  for(let i=0;i<900;i+=58)rectangle(i,332,3,138,"#b68f73");
  if(c.scene==="keyboard"){
   rectangle(30,83,246,242,"#567b82");rectangle(41,97,222,213,"#dfebdc");
   rectangle(52,109,200,92,"#c2d5ca");rectangle(52,205,200,7,"#889e9b");
   rectangle(335,84,235,171,"#c6bba5");rectangle(347,95,211,147,"#6d8086");
   rectangle(365,110,176,110,"#142f40");write("RETRO OS 1984",378,138,18,"#d9f090");write("FEEDER STATUS",374,165,17,"#8bd6cb");
   write(state.won?"FOOD: DISPENSED":"FOOD: LOCKED",373,194,15,state.won?"#d4f08c":"#f2c77c");
   rectangle(321,261,277,24,"#7a5848");rectangle(339,286,21,98,"#735540");rectangle(563,286,21,98,"#735540");
   rectangle(355,238,231,23,"#c2c8b5");
   for(let i=0;i<13;i++)for(let j=0;j<3;j++)rectangle(363+i*16+j*3,242+j*6,13,4,(i+j)%2?"#5b7780":"#73908d");
   rectangle(670,111,193,173,"#5c8989");rectangle(690,132,152,140,"#b8c9a2");
   rectangle(705,153,121,77,"#6e8f7e");rectangle(717,161,97,56,"#2d4a43");
   rectangle(716,236,99,24,"#d7d5a6");write("FEEDER",726,95,19,"#264d58");
   if(state.won){rectangle(736,204,45,25,"#e7c17d");rectangle(744,196,27,12,"#f0ce88");}
   cat(state.won?355:403,state.won?209:191,state.frame);
   if(state.action2)write("CTRL + ALT + F",606,63,21,"#214a58");
  }else{
   rectangle(24,72,288,257,"#557d83");rectangle(40,89,255,222,"#dbe1cc");
   rectangle(52,106,230,90,"#8db9ad");write("SMART HOME",72,154,25,"#254e5e");
   rectangle(84,213,149,102,"#bca27e");rectangle(112,206,94,11,"#80654c");
   rectangle(352,121,278,193,"#677e7e");rectangle(369,137,244,153,"#e6e2ca");
   rectangle(392,152,194,128,"#253b49");write("EVENT BUS",408,180,22,"#d9ef94");
   write(state.won?"ALERT: OPEN":"ALERT: STANDBY",402,214,17,state.won?"#efa3a9":"#91cbba");
   write("listeners: "+(state.action1?6:0),405,245,17,"#a8cfba");
   rectangle(674,93,170,219,"#746251");rectangle(688,105,142,196,"#9b7b58");rectangle(705,121,112,161,"#c09c73");
   rectangle(769,207,11,15,"#5c463c");
   cat(state.won?647:536,state.won?253:221,state.frame);
   if(state.action2)write("TEST EVENTS...",656,64,20,"#1f4d55");
  }
  rectangle(28,396,520,45,"#273f50");
  write(state.won?c.hudAfter:c.hudBefore,42,424,19,"#d9ef96");
  rectangle(593,396,267,45,"#273f50");write("CANALLA.EXE",610,424,21,"#bfeadd");
  requestAnimationFrame(draw);
 }
 reset();requestAnimationFrame(draw);
}
window.CANALLA_CHALLENGE={init};
})();