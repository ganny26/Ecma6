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
 * method to trim white spaces
 * @param {*} s 
 */
let trim = (s) => {
    return (s || "").replace(/^\s+|\s+$/g, "");
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
        } catch (e) {}
        return false;
    } else if (which == 40 && event.shiftKey == true) {
        body.className = 'large';
        try {
            localStorage.large = 1;
        } catch (e) {}
        cursor.focus();
        return false;
    }
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

function noop() {}
var ccCache = {};
var ccPosition = false;

/**
 * method to print console command properties
 * @param {*} cmd 
 * @param {*} filter 
 */
let getProps = (cmd, filter) => {
    var surpress = {},
        props = [];

    if (!ccCache[cmd]) {
        try {
            surpress.alert = sandboxframe.contentWindow.alert;
            sandboxframe.contentWindow.alert = function() {};
            ccCache[cmd] = sandboxframe.contentWindow.eval('console.props(' + cmd + ')').sort();
            delete sandboxframe.contentWindow.alert;
        } catch (e) {
            ccCache[cmd] = [];
        }
        if (ccCache[cmd][0] == 'undefined') ccOptions[cmd] = [];
        ccPosition = 0;
        props = ccCache[cmd];
    } else if (filter) {
        for (var i = 0, p; i < ccCache[cmd].length, p = ccCache[cmd][i]; i++) {
            if (p.indexOf(filter) === 0) {
                if (p != filter) {
                    props.push(p.substr(filter.length, p.length));
                }
            }
        }
    } else {
        props = ccCache[cmd];
    }

    return props;
}


/**
 * method to remove autocomplete
 */
let removeSuggestion = () => {
    if (!enableCC) exec.setAttribute('rows', 1);
    if (enableCC && cursor.nextSibling) cursor.parentNode.removeChild(cursor.nextSibling);
}




/**
 * method to perform code autocomplete
 * @param {*} event 
 */
let codeComplete = (event) => {
    var cmd = cursor.textContent.split(/[;\s]+/g).pop(),
        parts = cmd.split('.'),
        which = whichKey(event),
        cc,
        props = [];

    if (cmd) {
        if (cmd.substr(-1) == '.') {
            cmd = cmd.substr(0, cmd.length - 1);
            props = getProps(cmd);
        } else {
            props = getProps(parts.slice(0, parts.length - 1).join('.') || 'window', parts[parts.length - 1]);
        }
        if (props.length) {
            if (which == 9) {
                if (props.length === 1) {
                    ccPosition = false;
                } else {
                    if (event.shiftKey) {
                        ccPosition = ccPosition == 0 ? props.length - 1 : ccPosition - 1;
                    } else {
                        ccPosition = ccPosition == props.length - 1 ? 0 : ccPosition + 1;
                    }
                }
            } else {
                ccPosition = 0;
            }

            if (ccPosition === false) {
                completeCode();
            } else {
                if (!cursor.nextSibling) {
                    cc = document.createElement('span');
                    cc.className = 'suggest';
                    exec.appendChild(cc);
                }

                cursor.nextSibling.innerHTML = props[ccPosition];
                exec.value = exec.textContent;
            }

            if (which == 9) return false;
        } else {
            ccPosition = false;
        }
    } else {
        ccPosition = false;
    }

    if (ccPosition === false && cursor.nextSibling) {
        removeSuggestion();
    }

    exec.value = exec.textContent;
}


/**
 * print all logs based on properties
 */
window._console = {
    log: function() {
        var l = arguments.length,
            i = 0;
        for (; i < l; i++) {
            log(stringifyContent(arguments[i], true));
        }
    },
    dir: function() {
        var l = arguments.length,
            i = 0;
        for (; i < l; i++) {
            log(stringifyContent(arguments[i]));
        }
    },
    props: function(obj) {
        var props = [],
            realObj;
        try {
            for (var p in obj) props.push(p);
        } catch (e) {}
        return props;
    }
};


/**
 * event listener for command messages
 */
document.addEventListener ?
    console.log('stared to get commands from console') :
    window.attachEvent('onmessage', function() {
        post(window.event.data);
    });


/**
 * method to execute command shell
 */
var exec = document.getElementById('exec'),
    form = exec.form || {},
    output = document.getElementById('output'),
    cursor = document.getElementById('exec'),
    injected = typeof window.top['selva_c'] !== 'undefined',
    sandboxframe = injected ? window.top['selva_c'] : document.createElement('iframe'),
    sandbox = null,
    fakeConsole = 'window.top._console',
    history = getHistory(),
    liveHistory = (window.history.pushState !== undefined),
    pos = 0,
    body = document.getElementsByTagName('body')[0],
    logAfter = null,
    historySupported = !!(window.history && window.history.pushState),
    codeCompleteTimer = null,
    keypressTimer = null,
    commands = {
        history: showHistory,
        clear: () => {
            setTimeout(function() {
                output.innerHTML = '';
            }, 10);
            return 'clear';
        },
        close: () => {
            if (injected) {
                selva_c.console.style.display = 'none';
                return 'hidden';
            } else {
                return 'noop';
            }
        },
        listen: (id) => {
            var script = document.createElement('script'),
                callback = '_cb' + +new Date;
            script.src = '/api/' + (id || '') + '?callback=' + callback;
            body.appendChild(script);
            return 'working';
        }
    },
    fakeInput = null,
    iOSMobile = false,
    enableCC = true;

if (enableCC) {
    exec.parentNode.innerHTML = '<div autofocus id="exec" autocapitalize="off" spellcheck="false">\
    <span id="cursor" spellcheck="false" autocapitalize="off" autocorrect="off"  contenteditable>\
    </span></div>';
    exec = document.getElementById('exec');
    cursor = document.getElementById('cursor');
}


/**
 * adding script to console
 */
if (!injected) {
    sandbox.open();
    sandbox.write('<script>var copy = window.top.copy; (function () { var fakeConsole = ' + fakeConsole + '; if (console != undefined) { for (var k in fakeConsole) { console[k] = fakeConsole[k]; } } else { console = fakeConsole; } })();</script>');
    sandbox.close();
} else {
    sandboxframe.contentWindow.eval('copy = window.top.copy; (function () { var fakeConsole = ' + fakeConsole + '; if (console != undefined) { for (var k in fakeConsole) { console[k] = fakeConsole[k]; } } else { console = fakeConsole; } })();');
}


cursor.focus();
output.parentNode.tabIndex = 0;

/**
 * dynamically identify input and set attribute to console text area
 */
if (enableCC && iOSMobile) {
    fakeInput = document.createElement('input');
    fakeInput.className = 'fakeInput';
    fakeInput.setAttribute('spellcheck', 'false');
    fakeInput.setAttribute('autocorrect', 'off');
    fakeInput.setAttribute('autocapitalize', 'off');
    exec.parentNode.appendChild(fakeInput);
}

/**
 * adding script to console
 */
if (!injected) {
    body.appendChild(sandboxframe);
    sandboxframe.setAttribute('id', 'sandbox');
}


sandbox = sandboxframe.contentDocument || sandboxframe.contentWindow.document;


/**
 * method to identify key press events based on key code
 * @param {*} event 
 */
let whichKey = (event) => {
    var keys = {
        38: 1,
        40: 1,
        Up: 38,
        Down: 40,
        Enter: 10,
        'U+0009': 9,
        'U+0008': 8,
        'U+0190': 190,
        'Right': 39,
        'U+0028': 57,
        'U+0026': 55
    };
    return event.which || event.keyCode || keys[event.keyIdentifier];
}


/**
 * key press auto suggesstion
 * @param {*} event 
 */
exec.onkeyup = function(event) {
    var which = whichKey(event);

    if (enableCC && which != 9 && which != 16) {
        clearTimeout(codeCompleteTimer);
        codeCompleteTimer = setTimeout(function() {
            codeComplete(event);
        }, 200);
    }
};
