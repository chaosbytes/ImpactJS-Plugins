/* 
 * FSCam
 * Custom Camera Controller Plugin for ImpactJS
 *
 * Code by Joe Rice
 */
ig.module('game.plugins.FSCam').requires('impact.game', 'impact.system', 'impact.font').defines(function() {
	FSCam = ig.Class.extend({
		player: null,
		screen: null,
		left: null,
		right: null,
		tileSize: 32,
		map: null,
		mHeight: null,
		mWidth: null,
		groundTileRows: 3,
		init: function(p, s, l, r) {
			if (ig.game) {
				this.map = ig.game.getMapByName("land");
				this.mHeight = this.map.height * this.tileSize;
				this.mWidth = this.map.width * this.tileSize;
				this.player = p;
				this.screen = s;
				this.left = l;
				this.right = r;
				if (this.player && this.screen) {
					this.screen.x = 0;
					this.screen.y = this.player.pos.y - (ig.system.height / 2);
					this.scan();
				}
			}
		},
		scan: function() {
			if (this.player && this.screen) {
				if (this.player.pos.x > ((this.screen.x + ig.system.width) - (ig.system.width * this.right)) && ig.input.state('right')) {
					this.screen.x += this.player.pos.x - this.player.last.x;
					if (this.screen.x > this.mWidth - ig.system.width) {
						this.screen.x = this.mWidth - ig.system.width;
					}
				} else if (this.player.pos.x < (this.screen.x + (ig.system.width * this.left)) && ig.input.state('left')) {
					this.screen.x += this.player.pos.x - this.player.last.x;
					if (this.screen.x < 0) {
						this.screen.x = 0;
					}
				} else if (this.screen.x != (this.player.pos.x - ig.system.width / 2)) {
					this.screen.x += ((this.player.pos.x - ig.system.width / 2) - this.screen.x) * .05;
					if (this.screen.x < 0) {
						this.screen.x = 0;
					} else if (this.screen.x > this.mWidth - ig.system.width) {
						this.screen.x = this.mWidth - ig.system.width;
					}
				}
				if (!this.player.standing) {
					if (this.player.pos.y < this.screen.y + (ig.system.height * .15)) {
						if (this.screen.y <= this.mHeight - ig.system.height) {
							this.screen.y += (this.player.pos.y - this.player.last.y) * 1.325;
						} else {
							this.screen.y = this.mHeight - ig.system.height;
						}
					} else {
						if (this.player.vel.y > 0 && this.screen.y < this.mHeight - ig.system.height) {
							this.screen.y += (this.player.pos.y - this.player.last.y) * 1.325;
						} else if (this.player.vel.y > 0 && this.screen.y >= this.mHeight - ig.system.height) {
							this.screen.y = this.mHeight - ig.system.height;
						}
					}
				} else {
					if (this.screen.y != this.player.pos.y - (ig.system.height - (this.player.size.y + this.groundTileRows * this.tileSize))) {
						this.screen.y += ((this.player.pos.y - ig.system.height / 2) - this.screen.y) * .05;
						if (this.screen.y > this.mHeight - ig.system.height) {
							this.screen.y = this.mHeight - ig.system.height;
						}
					}
				}
			}
		},
		refocus: function(newP) {
			this.player = newP;
			this.screen.x = 0;
			this.screen.y = 0;
			this.init(this.player, this.screen, this.left, this.right);
			return this.player;
		},
		refocusAll: function(newP, newS) {
			this.player = newP;
			this.screen = newS;
			this.init(this.player, this.screen, this.left, this.right);
			return this.player;
		}
	});
});