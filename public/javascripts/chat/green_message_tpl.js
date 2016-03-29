var green_message_tpl = function (_swig,_ctx,_filters,_utils,_fn) {
  var _ext = _swig.extensions,
    _output = "";
_output += "<li class=\"msg green\">\n    <span class=\"time\">(";
_output += _filters["e"](_filters["date"]((((typeof _ctx.time !== "undefined" && _ctx.time !== null) ? ((typeof _ctx.time !== "undefined" && _ctx.time !== null) ? _ctx.time : "") : ((typeof time !== "undefined" && time !== null) ? time : "")) !== null ? ((typeof _ctx.time !== "undefined" && _ctx.time !== null) ? ((typeof _ctx.time !== "undefined" && _ctx.time !== null) ? _ctx.time : "") : ((typeof time !== "undefined" && time !== null) ? time : "")) : "" ), 'H:i:s'));
_output += ")</span>\n    <span class=\"username\">";
_output += _filters["e"](_filters["default"]((((typeof _ctx.username !== "undefined" && _ctx.username !== null) ? ((typeof _ctx.username !== "undefined" && _ctx.username !== null) ? _ctx.username : "") : ((typeof username !== "undefined" && username !== null) ? username : "")) !== null ? ((typeof _ctx.username !== "undefined" && _ctx.username !== null) ? ((typeof _ctx.username !== "undefined" && _ctx.username !== null) ? _ctx.username : "") : ((typeof username !== "undefined" && username !== null) ? username : "")) : "" ), 'bot'));
_output += ":</span>\n    <span class=\"says\">";
_output += _filters["e"](_filters["escape"]((((typeof _ctx.says !== "undefined" && _ctx.says !== null) ? ((typeof _ctx.says !== "undefined" && _ctx.says !== null) ? _ctx.says : "") : ((typeof says !== "undefined" && says !== null) ? says : "")) !== null ? ((typeof _ctx.says !== "undefined" && _ctx.says !== null) ? ((typeof _ctx.says !== "undefined" && _ctx.says !== null) ? _ctx.says : "") : ((typeof says !== "undefined" && says !== null) ? says : "")) : "" )));
_output += "</span>\n    ";
if (! (((typeof _ctx.system !== "undefined" && _ctx.system !== null) ? ((typeof _ctx.system !== "undefined" && _ctx.system !== null) ? _ctx.system : "") : ((typeof system !== "undefined" && system !== null) ? system : "")) !== null ? ((typeof _ctx.system !== "undefined" && _ctx.system !== null) ? ((typeof _ctx.system !== "undefined" && _ctx.system !== null) ? _ctx.system : "") : ((typeof system !== "undefined" && system !== null) ? system : "")) : "" )) { 
_output += "\n    <span class=\"msg-actions\">\n        <a href=\"#\" class=\"edit-msg\">Edit</a>&nbsp;\n        <a href=\"#\" class=\"delete-msg\">Delete</a>\n    </span>\n    ";

}_output += "\n</li>";

  return _output;

};

if(!tpl) var tpl = {};
tpl.green_message_tpl = green_message_tpl;