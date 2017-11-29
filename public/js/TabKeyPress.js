/**
    * method to identify tab spacing based on key code
    * @param {*} evt 
    */
let checkTab = (evt) => {
    var t = evt.target,
        ss = t.selectionStart,
        se = t.selectionEnd,
        tab = "  ";
    if (evt.keyCode == 9) {
        evt.preventDefault();
        if (ss != se && t.value.slice(ss, se).indexOf("\n") != -1) {
            var pre = t.value.slice(0, ss);
            var sel = t.value.slice(ss, se).replace(/\n/g, "\n" + tab);
            var post = t.value.slice(se, t.value.length);
            t.value = pre.concat(tab).concat(sel).concat(post);

            t.selectionStart = ss + tab.length;
            t.selectionEnd = se + tab.length;
        } else {
            t.value = t.value.slice(0, ss).concat(tab).concat(t.value.slice(ss, t.value.length));
            if (ss == se) {
                t.selectionStart = t.selectionEnd = ss + tab.length;
            } else {
                t.selectionStart = ss + tab.length;
                t.selectionEnd = se + tab.length;
            }
        }
    } else if (evt.keyCode == 8 && t.value.slice(ss - 4, ss) == tab) {
        evt.preventDefault();
        t.value = t.value.slice(0, ss - 4).concat(t.value.slice(ss, t.value.length));
        t.selectionStart = t.selectionEnd = ss - tab.length;
    } else if (evt.keyCode == 46 && t.value.slice(se, se + 4) == tab) {
        evt.preventDefault();
        t.value = t.value.slice(0, ss).concat(t.value.slice(ss + 4, t.value.length));
        t.selectionStart = t.selectionEnd = ss;
    } else if (evt.keyCode == 37 && t.value.slice(ss - 4, ss) == tab) {
        evt.preventDefault();
        t.selectionStart = t.selectionEnd = ss - 4;
    } else if (evt.keyCode == 39 && t.value.slice(ss, ss + 4) == tab) {
        evt.preventDefault();
        t.selectionStart = t.selectionEnd = ss + 4;
    }
}

/**
   * method to provide shift+enter feature
   * @param {*} event 
   */
let changeView = (event) => {
    if (false && enableCC) return;
    var which = event.which || event.keyCode;
    if (which == 38 && event.shiftKey == true) {
        body.className = '';
        cursor.focus();
        try {
            localStorage.large = 0;
        } catch (e) { }
        return false;
    } else if (which == 40 && event.shiftKey == true) {
        body.className = 'large';
        try {
            localStorage.large = 1;
        } catch (e) { }
        cursor.focus();
        return false;
    }
}

module.exports = {
    "checkTab": checkTab,
    "changeView": changeView
}