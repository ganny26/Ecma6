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
