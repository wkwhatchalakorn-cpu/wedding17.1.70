(function () {
  var CONFIG = {
    eventISO: "2027-01-17T16:30:00+07:00",
    dateShort: "17 Jan 2027",
    couple: "Sirinporn & Whatchalakorn",
    venue: "La Chapelle ประเทศไทย"
  };
  var $ = function (id) { return document.getElementById(id); };
  var guests = 1;

  $("map").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.venue);

  // countdown
  var days = Math.ceil((new Date(CONFIG.eventISO).getTime() - Date.now()) / 86400000);
  if (days > 0) { $("count").textContent = days + (days === 1 ? " day to go" : " days to go"); $("count").hidden = false; }

  // stepper
  function setGuests(n) { guests = Math.max(1, Math.min(6, n)); $("gcount").textContent = guests; }
  $("dec").onclick = function () { setGuests(guests - 1); };
  $("inc").onclick = function () { setGuests(guests + 1); };

  function attend() { return document.querySelector('input[name="attend"]:checked').value; }
  function syncExtras() { $("extras").style.display = attend() === "yes" ? "grid" : "none"; }
  Array.prototype.forEach.call(document.querySelectorAll('input[name="attend"]'), function (r) { r.onchange = syncExtras; });

  function sessions() {
    return Array.prototype.map.call(document.querySelectorAll('input[name="sess"]:checked'), function (c) { return c.value; });
  }
  function readForm() {
    var yes = attend() === "yes";
    return {
      name: $("name").value.trim(),
      phone: $("phone").value.trim(),
      attending: yes,
      guests: yes ? guests : 0,
      sessions: yes ? sessions() : [],
      diet: $("diet").value.trim(),
      note: $("note").value.trim(),
      updatedAt: new Date().toISOString()
    };
  }
  function message(r) {
    var t = "Dear " + CONFIG.couple.replace(" & ", " and ") + ",\n";
    if (r.attending) {
      t += r.name + " joyfully accepts your invitation to the wedding on " + CONFIG.dateShort + ". Guests: " + r.guests;
      if (r.sessions.length) t += " (" + r.sessions.join(", ") + ")";
      t += ".";
      if (r.diet) t += "\nDietary needs: " + r.diet;
    } else {
      t += r.name + " thanks you for the invitation to the wedding on " + CONFIG.dateShort + " and regrets being unable to attend.";
    }
    if (r.phone) t += "\nPhone: " + r.phone;
    if (r.note) t += "\n" + r.note;
    return t;
  }

  function showResult(r, scroll) {
    // the Confirm button is replaced by the thank-you sentence; nothing else to do
    $("send").hidden = true;
    $("err").textContent = "";
    $("thanks-inline").hidden = false;
    if (scroll) setTimeout(function () { try { $("thanks-inline").scrollIntoView({ behavior: "smooth", block: "center" }); } catch (x) {} }, 60);
  }

  function fillForm(r) {
    $("name").value = r.name || "";
    $("phone").value = r.phone || "";
    var radio = document.querySelector('input[name="attend"][value="' + (r.attending ? "yes" : "no") + '"]');
    if (radio) radio.checked = true;
    setGuests(r.guests || 1);
    Array.prototype.forEach.call(document.querySelectorAll('input[name="sess"]'), function (c) { c.checked = (r.sessions || []).indexOf(c.value) > -1; });
    $("diet").value = r.diet || "";
    $("note").value = r.note || "";
    syncExtras();
  }

  $("form").addEventListener("submit", function (e) {
    e.preventDefault();
    var r = readForm();
    if (!r.name) { $("err").textContent = "Please enter your full name."; $("name").focus(); return; }
    $("err").textContent = "";
    $("send").disabled = true;
    Backend.saveRsvp(r).then(function () {
      try { localStorage.setItem("wedding_rsvp_done", "1"); } catch (x) {}
      $("send").disabled = false;
      showResult(r, true);
    }, function (err) {
      $("send").disabled = false;
      $("err").textContent = "Sorry, your reply could not be saved just now (" + ((err && err.message) || "error") + "). Please try again in a moment.";
    });
  });


})();
