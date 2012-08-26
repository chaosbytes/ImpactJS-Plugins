ig.module('game.plugins.FSHUD').requires('impact.game', 'impact.system', 'impact.font').defines(function() {
	FSHUD = ig.Class.extend({
		images: {
			battery: new ig.Image('media/battery.png'),
			coin: new ig.Image('media/coin.png'),
			health: new ig.Image('media/health.png'),
			life: new ig.Image('media/life.png')
		},
		stats: {
			energy: null,
			health: null,
			lives: null,
			coins: null
		},
		pos: null,
		drawHud: true,
		font: new ig.Font('media/visitor16-FFFFFF.png'),
		init: function(e, h, l, c) {
			this.pos = {
				x: 10,
				y: ig.system.height - 75
			};
			this.stats.energy = e;
			this.stats.health = h;
			this.stats.lives = l;
			this.stats.coins = c;
		},
		draw: function() {
			if (this.drawHud) {
				//health
				this.font.draw('Health', this.pos.x, this.pos.y);
				this.images.health.draw(this.pos.x, this.pos.y + 15);
				this.font.draw('x ' + this.stats.health, this.pos.x + this.images.life.width + 10, this.pos.y + 15);
				//energy
				this.font.draw('Energy', this.pos.x, this.pos.y + 40);
				this.images.battery.draw(this.pos.x, this.pos.y + 55);
				this.font.draw('x ' + this.stats.energy, this.pos.x + this.images.life.width + 10, this.pos.y + 55);
				//life
				this.font.draw('Lives', this.pos.x + 100, this.pos.y);
				this.images.life.draw(this.pos.x + 100, this.pos.y + 15);
				this.font.draw('x ' + this.stats.lives, this.pos.x + this.images.life.width + 110, this.pos.y + 15);
				//coin
				this.font.draw('Coins', this.pos.x + 100, this.pos.y + 40);
				this.images.coin.draw(this.pos.x + 100, this.pos.y + 55);
				this.font.draw('x ' + this.stats.coins, this.pos.x + this.images.life.width + 110, this.pos.y + 55);
			}
		},
		update: function(e, h, l, c) {
			this.stats.energy = e;
			this.stats.health = h;
			this.stats.lives = l;
			this.stats.coins = c;
		}
	});
});