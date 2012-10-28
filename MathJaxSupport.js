module('apps.MathJaxSupport').requires('lively.morphic.TextCore').toRun(function() {


(function setup() {
    var url = 'http://lively-kernel.org/other/MathJax/MathJax.js?config=TeX-AMS_HTML';
    JSLoader.loadJs(url, function() {
        MathJax.Hub.Config({
            tex2jax: { inlineMath: [ ['$','$'], ['\\(','\\)'] ] },
            skipStartupTypeset: true,
            elements: [],
        });
        MathJax.Hub.Startup.onload();
    });
})();

lively.morphic.Text.subclass('lively.morphic.MathJaxSupport.Text', {
    doNotSerialize: ['lastTypeSettedString'],
    onLoad: function() {
        delete this.lastTypeSettedString;
        this.typeSet(this.textString);
    },
    fixChunks: function() { /*do nothing*/ },
    get textString() { return this._textString },
    set textString(s) {
        // should be simpel super call....
        this._textString = s;
        if (this.needsUpdate()) {
            lively.morphic.Text.prototype.__lookupSetter__('textString').getOriginal().call(
                this, s);
        }
        return s;
    },

    typeSet: function(string) {
        this.textString = string;
        lively.bindings.callWhenPathNotNull(
            Global, ['MathJax', 'isReady'], this, 'realTypeSet');
        return string;
    },

    realTypeSet: function() {
        if (!this.needsUpdate()) return;
        // without the delay the rendering would be enabled too soon
        var self = this;
        (function() {
            self.lastTypeSettedString = self.textString;
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, self.renderContext().textNode]);
        }).delay(0)
    },
    needsUpdate: function() {
        return !this.lastTypeSettedString || this.lastTypeSettedString != this.textString;
    },

});

}) // end of module