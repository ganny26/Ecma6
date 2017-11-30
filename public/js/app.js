import Utils from './Utils';
import HistoryUtils from './HistoryUtils';
import LoggingUtil from './LoggingUtils';
import StringifyUtils from './StringifyUtils';
import TabKeyPress from './TabKeyPress';


((window) => {
    console.log('Loaded app js');
    /**
     * access info object at window level
     * @param {*} cmd 
     */
    window.info = function (cmd) {
        var li = document.createElement('li');
        li.className = 'info';
        li.innerHTML = '<span></span><div>' + Utils.clearConsole(cmd) + '</div>';
        Utils.appendLog(li);
    }

    /**
     * method to executeCommand the remote commands from text ares
     * @param {*} cmd 
     */
    let executeCommand = (cmd) => {
        console.log('command', cmd);
        var rawoutput = null,
            className = 'response',
            internalCmd = Utils.internalCommand(cmd);

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
            return [className, Utils.clearConsole(StringifyUtils.stringifyContent(rawoutput))];
        }
    }

    /**
  * method to post the command to console and history
  * @param {*} cmd 
  * @param {*} blind 
  * @param {*} response 
  */
    let post = (cmd, blind, response) => {
        cmd = Utils.trim(cmd);
        var el = document.createElement('div');
        var li = document.createElement('li');
        var span = document.createElement('span');
        var parent = output.parentNode;
        if (blind === undefined) {
            history.push(cmd);
            HistoryUtils.setHistory(history);
            if (historySupported) {
                window.history.pushState(cmd, cmd, '?' + encodeURIComponent(cmd));
            }
        }
        if (!remoteId || response) LoggingUtils.echo(cmd);
        response = response || executeCommand(cmd);
        if (response !== undefined) {
            el.className = 'response';
            span.innerHTML = response[1];
            if (response[0] != 'info') prettyPrint([span]);
            el.appendChild(span);
            li.className = response[0];
            li.innerHTML = '<span></span>';
            li.appendChild(el);
            Utils.appendLog(li);
            output.parentNode.scrollTop = 0;
            if (!body.className) {
                exec.value = '';
                if (enableCC) {
                    try {
                        document.getElementsByTagName('a')[0].focus();
                        cursor.focus();
                        document.execCommand('selectAll', false, null);
                        document.execCommand('delete', false, null);
                    } catch (e) {
                        console.log('error in posting data')
                    }
                }
            }
        }
        pos = history.length;
    }

    function noop() { }
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
                sandboxframe.contentWindow.alert = function () { };
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
        log: function () {
            var l = arguments.length,
                i = 0;
            for (; i < l; i++) {
                log(stringifyContent(arguments[i], true));
            }
        },
        dir: function () {
            var l = arguments.length,
                i = 0;
            for (; i < l; i++) {
                log(stringifyContent(arguments[i]));
            }
        },
        props: function (obj) {
            var props = [],
                realObj;
            try {
                for (var p in obj) props.push(p);
            } catch (e) { }
            return props;
        }
    };

    /**
     * event listener for command messages
     */
    document.addEventListener ?
        console.log('stared to get commands from console') :
        window.attachEvent('onmessage', function () {
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
        history = HistoryUtils.getHistory(),
        liveHistory = (window.history.pushState !== undefined),
        pos = 0,
        remoteId = null,
        body = document.getElementsByTagName('body')[0],
        logAfter = null,
        historySupported = !!(window.history && window.history.pushState),
        codeCompleteTimer = null,
        keypressTimer = null,
        commands = {
            history: showHistory,
            clear: () => {
                setTimeout(function () {
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
        body.appendChild(sandboxframe);
        sandboxframe.setAttribute('id', 'sandbox');
    }


    sandbox = sandboxframe.contentDocument || sandboxframe.contentWindow.document;

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
     * key press auto suggesstion
     * @param {*} event 
     */
    exec.onkeyup = function (event) {
        var which = LoggingUtils.whichKey(event);

        if (enableCC && which != 9 && which != 16) {
            clearTimeout(codeCompleteTimer);
            codeCompleteTimer = setTimeout(function () {
                codeComplete(event);
            }, 200);
        }
    };


    /**
    * set cursor to text area
    */
    if (enableCC) {
        cursor.__onpaste = function (event) {
            setTimeout(function () {
                cursor.innerHTML = cursor.innerText;
            }, 10);
        };
    }

    /**
    * get browser cache from window
    */
    getProps('window');

    try {
        if (!!(localStorage.large * 1)) {
            document.body.className = 'large';
        }
    } catch (e) {
        console.log('failed to store command');
    }

    /**
     * initiate cursor focus on load
     */
    if (document.addEventListener) document.addEventListener('deviceready', function () {
        cursor.focus();
    }, false);

    /**
* range
* @param {*} focus 
*/
    function completeCode(focus) {
        var tmp = exec.textContent,
            l = tmp.length;
        removeSuggestion();

        cursor.innerHTML = tmp;
        ccPosition = false;

        document.getElementsByTagName('a')[0].focus();
        cursor.focus();

        var range, selection;
        if (document.createRange) {
            range = document.createRange();
            range.selectNodeContents(cursor);
            range.collapse(false);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        } else if (document.selection) {
            range = document.body.createTextRange();
            range.moveToElementText(cursor);
            range.collapse(false);
            range.select();
        }
    }

    /**
   * method to identify key down events
   * @param {*} event 
   */
    exec.onkeydown = function (event) {
        event = event || window.event;
        var keys = {
            38: 1,
            40: 1
        },
            wide = body.className == 'large',
            which = LoggingUtils.whichKey(event);

        if (typeof which == 'string') which = which.replace(/\/U\+/, '\\u');
        if (keys[which]) {
            if (event.shiftKey) {
                TabKeyPress.changeView(event);
            } else if (!wide) { // history cycle
                if (enableCC && window.getSelection) {
                    window.selObj = window.getSelection();
                    var selRange = selObj.getRangeAt(0);

                    cursorPos = Utils.findNode(selObj.anchorNode.parentNode.childNodes, selObj.anchorNode) + selObj.anchorOffset;
                    var value = exec.value,
                        firstnl = value.indexOf('\n'),
                        lastnl = value.lastIndexOf('\n');

                    if (firstnl !== -1) {
                        if (which == 38 && cursorPos > firstnl) {
                            return;
                        } else if (which == 40 && cursorPos < lastnl) {
                            return;
                        }
                    }
                }

                if (which == 38) {
                    pos--;
                    if (pos < 0) pos = 0;
                } else if (which == 40) {
                    pos++;
                    if (pos >= history.length) pos = history.length;
                }
                if (history[pos] != undefined && history[pos] !== '') {
                    removeSuggestion();
                    Utils.setCursorTo(history[pos])
                    return false;
                } else if (pos == history.length) {
                    removeSuggestion();
                    Utils.setCursorTo('');
                    return false;
                }
            }
        } else if ((which == 13 || which == 10) && event.shiftKey == false) {
            removeSuggestion();
            if (event.shiftKey == true || event.metaKey || event.ctrlKey || !wide) {
                var command = exec.textContent || exec.value;
                if (command.length) post(command);
                return false;
            }
        } else if ((which == 13 || which == 10) && !enableCC && event.shiftKey == true) {

            var rows = exec.value.match(/\n/g);
            rows = rows != null ? rows.length + 2 : 2;
            exec.setAttribute('rows', rows);
        } else if (which == 9 && wide) {
            TabKeyPress.checkTab(event);
        } else if (event.shiftKey && event.metaKey && which == 8) {
            output.innerHTML = '';
        } else if ((which == 39 || which == 35) && ccPosition !== false) { // complete code
            completeCode();
        } else if (event.ctrlKey && which == 76) {
            output.innerHTML = '';
        } else if (enableCC) { // try code completion
            if (ccPosition !== false && which == 9) {
                codeComplete(event); // cycles available completions
                return false;
            } else if (ccPosition !== false && cursor.nextSibling) {
                removeSuggestion();
            }
        }
    };


    /**
   * method to handle auto complete based on key press
   */
    if (enableCC && iOSMobile) {
        fakeInput.onkeydown = function (event) {
            removeSuggestion();
            var which = LoggingUtils.whichKey(event);

            if (which == 13 || which == 10) {
                post(this.value);
                this.value = '';
                cursor.innerHTML = '';
                return false;
            }
        };

        /**
         * 
         * @param {*} event 
         */
        fakeInput.onkeyup = function (event) {
            cursor.innerHTML = Utils.clearConsole(this.value);
            var which = LoggingUtils.whichKey(event);
            if (enableCC && which != 9 && which != 16) {
                clearTimeout(codeCompleteTimer);
                codeCompleteTimer = setTimeout(function () {
                    codeComplete(event);
                }, 200);
            }
        };

        var fakeInputFocused = false;
        var dblTapTimer = null,
            taps = 0;

    }

    /**
   * key down event
   * @param {*} event 
   */
    document.onkeydown = (event) => {
        event = event || window.event;
        var which = event.which || event.keyCode;

        if (event.shiftKey && event.metaKey && which == 8) {
            output.innerHTML = '';
            cursor.focus();
        } else if (event.target == output.parentNode && which == 32) {
            output.parentNode.scrollTop += 5 + output.parentNode.offsetHeight * (event.shiftKey ? -1 : 1);
        }
        return TabKeyPress.changeView(event);
    };
    exec.onclick = function () {
        cursor.focus();
    }

})(this);