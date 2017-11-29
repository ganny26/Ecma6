
/**
  * method to sort data
  * @param {*} a 
  * @param {*} b 
  */
let sortData = (a, b) => {
    return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
}


/**
* method to clean the console
* @param {*} s 
*/
let clearConsole = (s) => {
    s = s instanceof Array ? s.join(', ') : s;
    return (s || '').replace(/[<&]/g, function (m) {
        return {
            '&': '&amp;',
            '<': '&lt;'
        }[m];
    });
}

/**
 * method to append logs to right side
 * @param {*} el 
 * @param {*} echo 
 */
let appendLog = (el, echo) => {
    if (echo) {
        if (!output.firstChild) {
            output.appendChild(el);
        } else {
            output.insertBefore(el, output.firstChild);
        }
    } else {
        output.insertBefore(el, logAfter ? logAfter : output.lastChild.nextSibling);
    }
}


/**
* method to trim white spaces
* @param {*} s 
*/
let trim = (s) => {
    return (s || "").replace(/^\s+|\s+$/g, "");
}


/**
* method to split executeCommand command by shorcut by '@' symbol
* @param {*} cmd 
*/
let internalCommand = (cmd) => {
    var parts = [],
        c;
    if (cmd.substr(0, 1) == '@') {
        parts = cmd.substr(1).split(' ');
        c = parts.shift();
        return (commands[c] || noop).apply(this, parts);
    }
}

/**
* method to return node of DOM
* @param {*} list 
* @param {*} node 
*/
function findNode(list, node) {
    var pos = 0;
    for (var i = 0; i < list.length; i++) {
        if (list[i] == node) {
            return pos;
        }
        pos += list[i].nodeValue.length;
    }
    return -1;
}


  /**
     * method to set cursor
     * @param {*} str 
     */
    let setCursorTo = (str) => {
        str = enableCC ? clearConsole(str) : str;
        exec.value = str;

        if (enableCC) {
            document.execCommand('selectAll', false, null);
            document.execCommand('delete', false, null);
            document.execCommand('insertHTML', false, str);
        } else {
            var rows = str.match(/\n/g);
            exec.setAttribute('rows', rows !== null ? rows.length + 1 : 1);
        }
        cursor.focus();
        window.scrollTo(0, 0);
    }




module.exports = {
    "sortData":sortData,
    "clearConsole":clearConsole,
    "appendLog":appendLog,
    "trim":trim,
    "internalCommand":internalCommand,
    "findNode":findNode,
    "setCursorTo":setCursorTo
};