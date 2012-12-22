ig.module('game.plugins.PersistantData').requires('impact.system', 'impact.game').defines(function () {
	ig.System.inject({
		newGameClassData: null,
		setGame: function (gameClass, data) {
			if (this.running) {
				this.newGameClass = gameClass;
				this.newGameClassData = data;
			} else {
				this.setGameNow(gameClass, data);
			}
		},
		setGameNow: function (gameClass, data) {
			ig.game = new(gameClass)(data);
			ig.system.setDelegate(ig.game);
		},
		run: function () {
			ig.Timer.step();
			this.tick = this.clock.tick();

			this.delegate.run();
			ig.input.clearPressed();

			if (this.newGameClass) {
				if (this.newGameClassData) {
					this.setGameNow(this.newGameClass, this.newGameClassData);
					this.newGameClass = null;
					this.newGameClassData = null;
				} else {
					this.setGameNow(this.newGameClass);
					this.newGameClass = null;
				}
			}
		}
	});
	ig.Game.inject({
		persistantData: null,
		staticInstantiate: function (data) {
			this.persistantData = data;
			this.sortBy = this.sortBy || ig.Game.SORT.Z_INDEX;
			ig.game = this;
			return null;
		}
	});
});