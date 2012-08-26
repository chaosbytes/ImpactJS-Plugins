ImpactJS-Plugins
================
FSWordWrapper

A custom text-formatting class for ImpactJS.

Current Applications:
	- Word-Wrap Functionality:
		- Instantiate the class as such: var fsWordWrapper = new FSWordWrapper(font, box);
		- Takes two parameters: 
			font: a user defined ig.Font,
			box: an object containing at minimum a width variable defined as 'w', like so {w: 100},
				Support will be added later for a height variable ('h') to support text 
				overflow and scrollable text areas.
		- Next: var newMessage = fsWordWrapper.wrapMessage(msg); The function .wrapMessage(msg)
			is used to return a new string with line breaks ('\n') inserted in proper positions.
			This can be stored in a variable or used in place of the variable in the next step.
		- Finally: Display text as you would any other text in ImpactJS, through ig.Font.
			i.e. font.draw(newMessage, x, y);
			
		- All together:
			var font = new ig.Font("/pathtofont");
			var fsWordWrapper = new FSWordWrapper(font, {w: 250});
			var msg = "This message should be longer than 250 pixels, causing it to wrap to the next line."
			var newMessage = fsWordWrapper.wrapMessage(msg);
			font.draw(newMessage, x, y);
			
Future Releases:
	- Height limitations, longer than specified height will result in a scrollable text area
	- Overflow options
	- A more encapsulated plugin (ability to instantiate it, pass it a font, box, and msg,
	 then have it do all the work including displaying text in just one or two method calls).
	- More to come!