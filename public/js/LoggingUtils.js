 import Utils from './Utils';
 /**
     * method to log console result/error to right side
     * @param {*} msg 
     * @param {*} className 
     */
    let log = (msg, className) => {
        var li = document.createElement('li');
        var div = document.createElement('div');
        div.innerHTML = typeof msg === 'string' ? Utils.clearConsole(msg) : msg;
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
        li.innerHTML = Utils.clearConsole(cmd) + '<a href="/?' + encodeURIComponent(cmd) + '" class="permalink" title="permalink">link</a></div>';
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
        Utils.appendLog(li, true);
    }

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


module.exports = {
    "logutils":log,
    "echo":echo,
    "whichKey":whichKey
};