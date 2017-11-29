
/**
    * method to set history when commands entered in console
    * @param {*} history 
    */

let setHistory = (history) => {
    if (typeof JSON == 'undefined') return;

    try {
        sessionStorage.setItem('history', JSON.stringifyContent(history));
    } catch (e) { }
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
    } catch (e) { }
    return history;
}


module.exports = {
    "setHistory":setHistory,
    "showHistory":showHistory,
    "getHistory":getHistory

};