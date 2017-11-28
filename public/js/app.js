console.log('Loaded app js');

let historyButton = document.getElementById('btn_get_history');

historyButton.addEventListener('click', () => {
    console.log('clicked');
    run('@history');
})


/**
 * method to set history when commands entered in console
 * @param {*} history 
 */

let setHistory = (history) => {
    if (typeof JSON == 'undefined') return;

    try {
        sessionStorage.setItem('history', JSON.stringifyContent(history));
    } catch (e) {}
}


/**
 * method to show history of console
 */
let showHistory = () => {
    var h = getHistory();
    h.shift();
    return h.join("\n");
}


/**
 * method to get history of console from browser session
 */
let getHistory = () => {
    var history = [''];
    if (typeof JSON == 'undefined') return history;
    try {
        history = JSON.parse(sessionStorage.getItem('history') || '[""]');
    } catch (e) {}
    return history;
}


/**
 * method to watch browser
 * @param {*} o 
 * @param {*} simple 
 * @param {*} visited 
 */
let stringifyContent = (o, simple, visited) => {
    var json = '',
        i, vi, type = '',
        parts = [],
        names = [],
        circular = false;
    visited = visited || [];
    try {
        type = ({}).toString.call(o);
    } catch (e) {
        type = '[object Object]';
    }


    for (vi = 0; vi < visited.length; vi++) {
        if (o === visited[vi]) {
            circular = true;
            break;
        }
    }

    if (circular) {
        json = '[circular]';
    } else if (type == '[object String]') {
        json = '"' + o.replace(/"/g, '\\"') + '"';
    } else if (type == '[object Array]') {
        visited.push(o);

        json = '[';
        for (i = 0; i < o.length; i++) {
            parts.push(stringifyContent(o[i], simple, visited));
        }
        json += parts.join(', ') + ']';
        json;
    } else if (type == '[object Object]') {
        visited.push(o);

        json = '{';
        for (i in o) {
            names.push(i);
        }
        names.sort(sortData);
        for (i = 0; i < names.length; i++) {
            parts.push(stringifyContent(names[i], undefined, visited) + ': ' + stringifyContent(o[names[i]], simple, visited));
        }
        json += parts.join(', ') + '}';
    } else if (type == '[object Number]') {
        json = o + '';
    } else if (type == '[object Boolean]') {
        json = o ? 'true' : 'false';
    } else if (type == '[object Function]') {
        json = o.toString();
    } else if (o === null) {
        json = 'null';
    } else if (o === undefined) {
        json = 'undefined';
    } else if (simple == undefined) {
        visited.push(o);

        json = type + '{\n';
        for (i in o) {
            names.push(i);
        }
        names.sort(sortData);
        for (i = 0; i < names.length; i++) {
            try {
                parts.push(names[i] + ': ' + stringifyContent(o[names[i]], true, visited));
            } catch (e) {
                if (e.name == 'NS_ERROR_NOT_IMPLEMENTED') {

                }
            }
        }
        json += parts.join(',\n') + '\n}';
    } else {
        try {
            json = o + '';
        } catch (e) {}
    }
    return json;
}


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
    return (s || '').replace(/[<&]/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;'
        }[m];
    });
}


/**
 * method to log console result/error to right side
 * @param {*} msg 
 * @param {*} className 
 */
let log = (msg, className) => {
    var li = document.createElement('li');
    var div = document.createElement('div');
    div.innerHTML = typeof msg === 'string' ? clearConsole(msg) : msg;
    prettyPrint([div]);
    li.className = className || 'log';
    li.appendChild(div);
    appendLog(li);
}



/**
 * method to print that text which entered to right side
 * @param {*} cmd 
 */
let echo = (cmd) => {
    var li = document.createElement('li');
    li.className = 'echo';
    li.innerHTML = clearConsole(cmd) + '<a href="/?' + encodeURIComponent(cmd) + '" class="permalink" title="permalink">link</a></div>';
    logAfter = null;
    if (output.querySelector) {
        logAfter = output.querySelector('li.echo') || null;
    } else {
        var lis = document.getElementsByTagName('li'),
            len = lis.length,
            i;
        for (i = 0; i < len; i++) {
            if (lis[i].className.indexOf('echo') !== -1) {
                logAfter = lis[i];
                break;
            }
        }
    }
    appendLog(li, true);
}


/**
 * access info object at window level
 * @param {*} cmd 
 */
window.info = function(cmd) {
    var li = document.createElement('li');
    li.className = 'info';
    li.innerHTML = '<span class="gutter"></span><div>' + clearConsole(cmd) + '</div>';
    appendLog(li);
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
 * method to executeCommand the remote commands from text ares
 * @param {*} cmd 
 */
let executeCommand = (cmd) => {
    console.log('command', cmd);
    var rawoutput = null,
        className = 'response',
        internalCmd = internalCommand(cmd);

    if (internalCmd) {
        return ['info', internalCmd];
    } else {
        try {
            if ('CoffeeScript' in sandboxframe.contentWindow) {
                cmd = sandboxframe.contentWindow.CoffeeScript.compile(cmd, {
                    bare: true
                });
            }
            rawoutput = sandboxframe.contentWindow.eval(cmd);
            sandboxframe.contentWindow.$_ = rawoutput;
        } catch (e) {
            console.error(e);
            rawoutput = e.message;
            className = 'error';
        }
        return [className, clearConsole(stringifyContent(rawoutput))];
    }
}


/**
 * method to post the command to console and history
 * @param {*} cmd 
 * @param {*} blind 
 * @param {*} response 
 */
let post = (cmd, blind, response) => {
    cmd = trim(cmd);
    var el = document.createElement('div');
    var li = document.createElement('li');
    var span = document.createElement('span');
    var parent = output.parentNode;
    if (blind === undefined) {
        history.push(cmd);
        setHistory(history);
        if (historySupported) {
            window.history.pushState(cmd, cmd, '?' + encodeURIComponent(cmd));
        }
    }
    if (!remoteId || response) echo(cmd);
    response = response || executeCommand(cmd);
    if (response !== undefined) {
        el.className = 'response';
        span.innerHTML = response[1];
        if (response[0] != 'info') prettyPrint([span]);
        el.appendChild(span);
        li.className = response[0];
        li.innerHTML = '<span class="gutter"></span>';
        li.appendChild(el);
        appendLog(li);
        output.parentNode.scrollTop = 0;
        if (!body.className) {
            exec.value = '';
            if (enableCC) {
                try {
                    document.getElementsByTagName('a')[0].focus();
                    cursor.focus();
                    document.execCommand('selectAll', false, null);
                    document.execCommand('delete', false, null);
                } catch (e) {}
            }
        }
    }
    pos = history.length;
}
