(function () {
  var w = window;
  function runAfterLoad(label) {
    if (typeof w.forceAfterLoad === 'function') {
      try { w.forceAfterLoad(); } catch (e) { if (console) consoleLog.error(e); }
      return true;
    }
    return false;
  }

  // Primo giro: appena DOM pronto, prova ad applicare 
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { runAfterLoad('domready'); });
  } else {
    runAfterLoad('domready');
  }

  // 3) Fallback: se Genie rimpiazza blocchi di DOM 
  if (typeof MutationObserver !== 'undefined') {
    var mo = new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].addedNodes && list[i].addedNodes.length) { runAfterLoad('mutation'); break; }
      }
    });
    mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }
})();