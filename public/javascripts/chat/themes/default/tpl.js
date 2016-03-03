var tpl = function (_swig,_ctx,_filters,_utils,_fn) {
  var _ext = _swig.extensions,
    _output = "";
_output += "<div id=\"chat1\">\n    <div class=\"panel\">\n        <button type=\"button\" class=\"create-btn\">create room</button>\n        <select class=\"created-rooms\"></select>\n        <button type=\"button\" class=\"enter-btn\">enter room</button>\n        <button type=\"button\" class=\"leave-btn\">leave room</button>\n    </div>\n    <div class=\"messages-container\">\n        <ul></ul>\n    </div><!-- End of messages-container -->\n\n    <textarea class=\"message-input\" works-on-enter=\"yes\"></textarea>\n\n    <div class=\"actions\">\n        <button class=\"message-submit\">Send</button>\n    </div>\n</div>";

  return _output;

};
