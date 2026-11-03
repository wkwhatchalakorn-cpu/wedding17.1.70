/* Backend adapter: sends RSVPs to a Google Apps Script web app (see backend/apps-script.gs and README).
   Set the URL in js/config.js. With no URL the card still opens, but replies cannot be saved. */
(function () {
  var cfg = window.WEDDING_CONFIG || {};
  var url = cfg.rsvpEndpoint || "";

  function guestId() {
    try {
      var id = localStorage.getItem("wedding_guest_id");
      if (!id) { id = "g_" + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("wedding_guest_id", id); }
      return id;
    } catch (e) { return "g_" + Math.random().toString(36).slice(2); }
  }

  window.Backend = {
    enabled: !!url,
    saveRsvp: function (r) {
      if (!url) return Promise.reject(new Error("rsvpEndpoint is not set in js/config.js"));
      var body = Object.assign({ action: "rsvp", id: guestId() }, r);
      // text/plain keeps this a "simple" request, so the browser sends no CORS preflight to Apps Script
      return fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) })
        .then(function (res) { return res.json(); })
        .then(function (j) { if (!j || !j.ok) throw new Error((j && j.error) || "save failed"); return j; });
    },
    loadWishes: function () {
      if (!url) return Promise.resolve([]);
      return fetch(url + "?action=wishes").then(function (res) { return res.json(); }).then(function (j) { return (j && j.wishes) || []; });
    }
  };
})();
