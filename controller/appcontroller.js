
/**
 * get commands and send to console
 * @param {*} req 
 * @param {*} res 
 */
function getResult(req,res){
    const commands = req.query.commands ;
    res.jsonp(commands);
}

module.exports = {
    "getResult":getResult
}