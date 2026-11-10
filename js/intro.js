/* ===== envelope opening + calendar ===== */
(function(){
  var $=function(i){return document.getElementById(i);};
  var intro=$("intro"),env=$("env"),sheet=document.querySelector(".sheet");
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  var opened=false;
  function enter(){
    intro.classList.add("leaving");document.body.classList.remove("locked");
    sheet.classList.add("entering");
    setTimeout(function(){intro.hidden=true;sheet.classList.remove("entering");},1100);
    try{window.scrollTo(0,0);}catch(e){}
  }
  function open(){
    if(opened)return;opened=true;
    intro.classList.add("opening");
    setTimeout(enter,reduce?250:2300);
  }
  if(intro&&env&&sheet){
    intro.hidden=false;document.body.classList.add("locked");
    env.addEventListener("click",open);
    env.focus&&env.focus({preventScroll:true});
    var rp=$("replay");
    if(rp)rp.addEventListener("click",function(){
      try{window.scrollTo(0,0);}catch(e){}
      opened=false;
      intro.classList.remove("opening","leaving");
      intro.hidden=false;document.body.classList.add("locked");
      env.focus&&env.focus({preventScroll:true});
    });
  }

  /* calendar: start 17 Jan 2027 16:30 (UTC+7) = 09:30 UTC; end time is an assumption (21:00) */
  var title="Wedding of Sirinporn & Whatchalakorn",loc="La Chapelle",
      det="Vow Ceremony 16.30 / Photos 18.00 / Reception 18.30";
  var g="https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(title)+
        "&dates=20270117T093000Z/20270117T140000Z&details="+encodeURIComponent(det)+"&location="+encodeURIComponent(loc);
  if($("cal-g"))$("cal-g").href=g;
  var ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Wedding//ECard//EN","BEGIN:VEVENT","UID:wedding-20270117@ecard",
    "DTSTAMP:20261103T000000Z","DTSTART:20270117T093000Z","DTEND:20270117T140000Z","SUMMARY:"+title,"LOCATION:"+loc,
    "DESCRIPTION:"+det,"END:VEVENT","END:VCALENDAR"].join("\r\n");
  var icsBtn=$("cal-ics");
  if(icsBtn){
    icsBtn.hidden=false;
    icsBtn.onclick=function(){
      var url=URL.createObjectURL(new Blob([ics],{type:"text/calendar"}));
      var a=document.createElement("a");a.href=url;a.download="wedding-17-jan-2027.ics";
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(url);},1000);
    };
  }
})();
