# ImpactJS-Plugins by Joe Rice
* * *
* * *

##PersistantData
* * *

A plugin to maintain data between separate instances of ig.Game for ImpactJS.

By injecting into `ig.System` and `ig.Game` this plugin will allow you to pass a data object
between instances of `ig.Game`. 

Simply require 'game.plugins.PersistantData' in your module, then load your `ig.Game` class 
like normal, but instead pass an optional object as a an additional parameter to the 
`ig.system.setGame()` function.

Example:

    ig.module('game.example').require('game.plugins.PersistantData').defines(function(){  
    	Game1 = ig.Game.extend({  
    	    	// Put your game code here as you normally would  
    		someData: {  
    			x: 100,  
    			y: 150  
    		},  
    		init: function(){  
    			ig.system.setGame(Game2, {  
    				passedData: this.someData  
    			});  
    		}  
    	});  
    	Game2 = ig.Game.extend({  
    		// Put your game code here as you normally would  
    		passedData: null,  
    		init: function(){  
    			// Now you can access the object passed through ig.system.setGame through this.persistantData  
    			this.passedData = this.persistantData.passedData;  
    		}  
    	});  
    }); 

And its as simple as that. If anyone encounters any bugs, errors, or problems with the plugin
you can shoot me an email [HERE](mailto:joerice@foursquaregames.com).
