(function(){
  var a=document.getElementById("bgm"),btn=document.getElementById("bgm-btn"),t=document.getElementById("bgm-t");
  if(!a||!btn)return;
  a.volume=.5; var wantOn=true, started=false;
  function ui(){var on=!a.paused;btn.setAttribute("aria-pressed",on?"true":"false");t.textContent=on?"Pause":"Play Music";}
  var evs=["pointerdown","touchstart","keydown","scroll","wheel"];
  function rm(){evs.forEach(function(e){window.removeEventListener(e,start,true);});}
  function start(){ if(!wantOn||started)return; var p=a.play(); if(p&&p.then){p.then(function(){started=true;ui();rm();},function(){});} }
  evs.forEach(function(e){window.addEventListener(e,start,{capture:true,passive:true});});
  btn.addEventListener("click",function(ev){ev.stopPropagation();
    if(a.paused){wantOn=true;a.play().then(function(){started=true;ui();rm();},function(){});}
    else{wantOn=false;a.pause();ui();}
  });
  a.addEventListener("play",ui);a.addEventListener("pause",ui);
  try{start();}catch(e){} ui();
})();
