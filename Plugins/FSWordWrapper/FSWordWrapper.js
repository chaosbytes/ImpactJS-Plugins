ig.module('game.plugins.FSWordWrapper').requires('impact.font').defines(function() {
	FSWordWrapper = ig.Class.extend({
		font: null,
		box: null,
		init: function(f, b) {
			this.font = f;
			this.box = b;
		},
		wrapMessage: function(msg) {
			var maxLineWidth = this.box.w;
			var newMessage = '';
			var words = msg.split(' ');
			var lines = new Array();
			var line = '';
			for (var i = 0; i < words.length; i++) {
				var space = (i == 0) ? '' : ' ';
				var str = line + space + words[i];
				if (this.font.widthForString(str) <= maxLineWidth) {
					line = str;
				} else {
					lines.push(line);
					line = words[i];
				}
			}
			if (line != '') {
				lines.push(line);
			}
			for (var i = 0; i < lines.length; i++) {
				if (i != 0) {
					newMessage += "\n";
				}
				newMessage += lines[i];
			}
			return newMessage;
		}
	});
});