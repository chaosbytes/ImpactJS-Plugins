

ig.module('plugins.blobsaladimpact').requires('impact.impact').defines(function () {
	Vector = ig.Class.extend({
		x: null,
		y: null,

		init: function (x, y) {
			this.x = x;
			this.y = y;
		},
		equal: function (v) {
			return this.x == v.getX() && this.y == v.getY();
		},
		getX: function () {
			return this.x;
		},
		getY: function () {
			return this.y;
		},
		setX: function (x) {
			this.x = x;
		},
		setY: function (y) {
			this.y = y;
		},
		addX: function (x) {
			this.x += x;
		},
		addY: function (y) {
			this.y += y;
		},
		set: function (v) {
			this.x = v.getX();
			this.y = v.getY();
		},
		add: function (v) {
			this.x += v.getX();
			this.y += v.getY();
		},
		sub: function (v) {
			this.x -= v.getX();
			this.y -= v.getY();
		},
		dotProd: function (v) {
			return this.x * v.getX() + this.y * v.getY();
		},
		length: function () {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		},
		scale: function (scaleFactor) {
			this.x *= scaleFactor;
			this.y *= scaleFactor;
		},
		toString: function () {
			return " X: " + this.x + " Y: " + this.y;
		}
	});

	Environment = ig.Class.extend({
		left: null,
		right: null,
		top: null,
		bottom: null,
		r: null,
		init: function (x, y, w, h) {
			this.left = x;
			this.right = x + w;
			this.top = y;
			this.bottom = y + h;
			this.r = new Vector(0.0, 0.0);
		},
		collision: function (curPos, prevPos) {
			var collide = false;
			var i;

			if (curPos.getX() < this.left) {
				curPos.setX(this.left);
				collide = true;
			} else if (curPos.getX() > this.right) {
				curPos.setX(this.right);
				collide = true;
			}
			if (curPos.getY() < this.top) {
				curPos.setY(this.top);
				collide = true;
			} else if (curPos.getY() > this.bottom) {
				curPos.setY(this.bottom);
				collide = true;
			}
			return collide;
		},
		draw: function (ctx, scaleFactor) {
			
		}
	});

	PointMass = ig.Class.extend({
		cur: null,
		prev: null,
		mass: null,
		force: null,
		result: null,
		friction: null,
		init: function (cx, cy, mass) {
			this.cur = new Vector(cx, cy);
			this.prev = new Vector(cx, cy);
			this.mass = mass;
			this.force = new Vector(0.0, 0.0);
			this.result = new Vector(0.0, 0.0);
			this.friction = 0.01;
		},
		getXPos: function () {
			return this.cur.getX();
		},
		getYPos: function () {
			return this.cur.getY();
		},
		getPos: function () {
			return this.cur;
		},
		getXPrevPos: function () {
			return this.prev.getX();
		},
		getYPrevPos: function () {
			return this.prev.getY();
		},
		getPrevPos: function () {
			return this.prev;
		},
		addXPos: function (dx) {
			this.cur.addX(dx);
		},
		addYPos: function (dy) {
			this.cur.addY(dy);
		},
		setForce: function (force) {
			this.force.set(force);
		},
		addForce: function (force) {
			this.force.add(force);
		},
		getMass: function () {
			return this.mass;
		},
		setMass: function (mass) {
			this.mass = mass;
		},
		move: function (dt) {
			var t, a, c, dtdt;

			dtdt = dt * dt;

			a = this.force.getX() / this.mass;
			c = this.cur.getX();
			t = (2.0 - this.friction) * c - (1.0 - this.friction) * this.prev.getX() + a * dtdt;
			this.prev.setX(c);
			this.cur.setX(t);

			a = this.force.getY() / this.mass;
			c = this.cur.getY();
			t = (2.0 - this.friction) * c - (1.0 - this.friction) * this.prev.getY() + a * dtdt;
			this.prev.setY(c);
			this.cur.setY(t);
		},
		setFriction: function (friction) {
			this.friction = friction;
		},
		getVelocity: function () {
			var cXpX, cYpY;

			cXpX = this.cur.getX() - this.prev.getX();
			cYpY = this.cur.getY() - this.prev.getY();

			return cXpX * cXpX + cYpY * cYpY;
		},
		draw: function (ctx, scaleFactor) {
			ctx.lineWidth = 2;
			ctx.fillStyle = '#000000';
			ctx.strokeStyle = '#000000';
			ctx.beginPath();
			ctx.arc(this.cur.getX() * scaleFactor, this.cur.getY() * scaleFactor, 4.0, 0.0, Math.PI * 2.0, true);
			ctx.fill();
		}
	});

	ConstraintY = ig.Class.extend({
		pointMass: null,
		y: null,
		delta: null,
		shortConst: null,
		longConst: null,
		init: function (pointMass, y, shortConst, longConst) {
			this.pointMass = pointMass;
			this.y = y;
			this.delta = new Vector(0.0, 0.0);
			this.shortConst = shortConst;
			this.longConst = longConst;
		},


		sc: function () {
			var dist;

			dist = Math.abs(this.pointMass.getYPos() - this.y);
			this.delta.setY(-dist);

			if (this.shortConst != 0.0 && dist < this.shortConst) {
				var scaleFactor;

				scaleFactor = this.shortConst / dist;
				this.delta.scale(scaleFactor);
				pointMass.getPos().sub(this.delta);
			} else if (this.longConst != 0.0 && dist > this.longConst) {
				var scaleFactor;

				scaleFactor = this.longConst / dist;
				this.delta.scale(scaleFactor);
				pointMass.getPos().sub(this.delta);
			}
		}
	});


	Joint = ig.Class.extend({
		pointMassA: null,
		pointMassB: null,
		delta: null,
		pointMassAPos: null,
		pointMassBPos: null,
		shortConst: null,
		longConst: null,
		scSquared: null,
		lcSquared: null,
		init: function (pointMassA, pointMassB, shortConst, longConst) {
			this.pointMassA = pointMassA;
			this.pointMassB = pointMassB;
			this.delta = new Vector(0.0, 0.0);
			this.pointMassAPos = pointMassA.getPos();
			this.pointMassBPos = pointMassB.getPos();

			this.delta.set(this.pointMassBPos);
			this.delta.sub(this.pointMassAPos);

			this.shortConst = this.delta.length() * shortConst;
			this.longConst = this.delta.length() * longConst;
			this.scSquared = this.shortConst * this.shortConst;
			this.lcSquared = this.longConst * this.longConst;
		},
		setDist: function (shortConst, longConst) {
			this.shortConst = shortConst;
			this.longConst = longConst;
			this.scSquared = this.shortConst * this.shortConst;
			this.lcSquared = this.longConst * this.longConst;
		},
		scale: function (scaleFactor) {
			this.shortConst = this.shortConst * scaleFactor;
			this.longConst = this.longConst * scaleFactor;
			this.scSquared = this.shortConst * this.shortConst;
			this.lcSquared = this.longConst * this.longConst;
		},
		sc: function () {
			this.delta.set(this.pointMassBPos);
			this.delta.sub(this.pointMassAPos);

			var dp = this.delta.dotProd(this.delta);

			if (this.shortConst != 0.0 && dp < this.scSquared) {
				var scaleFactor;

				scaleFactor = this.scSquared / (dp + this.scSquared) - 0.5;

				this.delta.scale(scaleFactor);

				this.pointMassAPos.sub(this.delta);
				this.pointMassBPos.add(this.delta);
			} else if (this.longConst != 0.0 && dp > this.lcSquared) {
				var scaleFactor;

				scaleFactor = this.lcSquared / (dp + this.lcSquared) - 0.5;

				this.delta.scale(scaleFactor);

				this.pointMassAPos.sub(this.delta);
				this.pointMassBPos.add(this.delta);
			}
		}
	});

	Stick = ig.Class.extend({
		pointMassA: null,
		pointMassB: null,
		length: null,
		lengthSquared: null,
		delta: null,
		pointMassDist: function (pointMassA, pointMassB) {
			var aXbX, aYbY;

			aXbX = pointMassA.getXPos() - pointMassB.getXPos();
			aYbY = pointMassA.getYPos() - pointMassB.getYPos();

			return Math.sqrt(aXbX * aXbX + aYbY * aYbY);
		},
		init: function (pointMassA, pointMassB) {
			this.length = this.pointMassDist(pointMassA, pointMassB);
			this.lengthSquared = this.length * this.length;
			this.pointMassA = pointMassA;
			this.pointMassB = pointMassB;
			this.delta = new Vector(0.0, 0.0);
		},

		getPointMassA: function () {
			return this.pointMassA;
		},
		getPointMassB: function () {
			return this.pointMassB;
		},
		scale: function (scaleFactor) {
			this.length *= scaleFactor;
			this.lengthSquared = this.length * this.length;
		},
		sc: function (env) {
			var dotProd, scaleFactor;
			var pointMassAPos, pointMassBPos;

			pointMassAPos = this.pointMassA.getPos();
			pointMassBPos = this.pointMassB.getPos();

			this.delta.set(pointMassBPos);
			this.delta.sub(pointMassAPos);

			dotProd = this.delta.dotProd(this.delta);

			scaleFactor = this.lengthSquared / (dotProd + this.lengthSquared) - 0.5;
			this.delta.scale(scaleFactor);

			pointMassAPos.sub(this.delta);
			pointMassBPos.add(this.delta);
		},
		setForce: function (force) {
			this.pointMassA.setForce(force);
			this.pointMassB.setForce(force);
		},
		addForce: function (force) {
			this.pointMassA.addForce(force);
			this.pointMassB.addForce(force);
		},
		move: function (dt) {
			this.pointMassA.move(dt);
			this.pointMassB.move(dt);
		},
		draw: function (ctx, scaleFactor) {
			this.pointMassA.draw(ctx, scaleFactor);
			this.pointMassB.draw(ctx, scaleFactor);

			ctx.lineWidth = 3;
			ctx.fillStyle = '#000000';
			ctx.strokeStyle = '#000000';
			ctx.beginPath();
			ctx.moveTo(this.pointMassA.getXPos() * scaleFactor, this.pointMassA.getYPos() * scaleFactor);
			ctx.lineTo(this.pointMassB.getXPos() * scaleFactor, this.pointMassB.getYPos() * scaleFactor);
			ctx.stroke();
		}
	});

	Spring = ig.Class.extend({
		restLength: null,
		stiffness: null,
		damper: null,
		pointMassA: null,
		pointMassB: null,
		tmp: null,
		init: function (restLength, stiffness, damper, pointMassA, pointMassB) {
			this.restLength = restLength;
			this.stiffness = stiffness;
			this.damper = damper;
			this.pointMassA = pointMassA;
			this.pointMassB = pointMassB;
			this.tmp = Vector(0.0, 0.0);
		},


		sc: function (env) {
			env.collistion(this.pointMassA.getPos(), this.pointMassA.getPrevPos());
			env.collistion(this.pointMassB.getPos(), this.pointMassB.getPrevPos());
		},
		move: function (dt) {
			var aXbX;
			var aYbY;
			var springForce;
			var length;

			aXbX = this.pointMassA.getXPos() - this.pointMassB.getXPos();
			aYbY = this.pointMassA.getYPos() - this.pointMassB.getYPos();

			length = Math.sqrt(aXbX * aXbX + aYbY * aYbY);
			springForce = this.stiffness * (length / this.restLength - 1.0);

			var avXbvX;
			var avYbvY;
			var damperForce;

			avXbvX = this.pointMassA.getXVel() - this.pointMassB.getXVel();
			avYbvY = this.pointMassA.getYVel() - this.pointMassB.getYVel();

			damperForce = avXbvX * aXbX + avYbvY * aYbY;
			damperForce *= this.damper;

			var fx;
			var fy;

			fx = (springForce + damperForce) * aXbX;
			fy = (springForce + damperForce) * aYbY;

			this.tmp.setX(-fx);
			this.tmp.setY(-ft);
			this.pointMassA.addForce(this.tmp);

			this.tmp.setX(fx);
			this.tmp.setY(ft);
			this.pointMassB.addForce(this.tmp);

			this.pointMassA.move(dt);
			this.pointMassB.move(dt);
		},
		addForce: function (force) {
			this.pointMassA.addForce(force);
			this.pointMassB.addForce(force);
		},
		draw: function (ctx, scaleFactor) {
			this.pointMassA.draw(ctx, scaleFactor);
			this.pointMassB.draw(ctx, scaleFactor);

			ctx.fillStyle = '#000000';
			ctx.strokeStyle = '#000000';
			ctx.beginPath();
			ctx.moveTo(this.pointMassA.getXPos() * scaleFactor, this.pointMassA.getYPos() * scaleFactor);
			ctx.lineTo(this.pointMassB.getXPos() * scaleFactor, this.pointMassB.getXPos() * scaleFactor);
			ctx.stroke();
		}
	});

	Blob = ig.Class.extend({
		x: null,
		y: null,
		sticks: null,
		pointMasses: null,
		joints: null,
		middlePointMass: null,
		radius: null,
		drawFaceStyle: null,
		drawEyesStyle: null,
		selected: null,
		numPointMasses: null,
		f: null,
		low: null,
		high: null,
		t: null,
		i: null,
		p: null,
		init: function (x, y, radius, numPointMasses) {
			this.radius = radius;
			this.numPointMasses = numPointMasses;
			this.x = x;
			this.y = y;
			this.sticks = new Array();
			this.pointMasses = new Array();
			this.joints = new Array();
			this.drawFaceStyle = 1;
			this.drawEyeStyle = 1;
			this.selected = false;
			this.f = 0.1;
			this.low = 0.95;
			this.high = 1.05;
			for (i = 0, t = 0.0; i < this.numPointMasses; i++) {
				this.pointMasses[i] = new PointMass(Math.cos(t) * this.radius + this.x, Math.sin(t) * this.radius + this.y, 1.0);
				t += 2.0 * Math.PI / this.numPointMasses;
				this.pointMasses[i].setMass(4.0);
			}

			this.middlePointMass = new PointMass(x, y, 1.0);

			for (i = 0; i < this.numPointMasses; i++) {
				this.sticks[i] = new Stick(this.pointMasses[i], this.pointMasses[this.clampIndex(i + 1, this.numPointMasses)]);
			}

			for (i = 0, p = 0; i < this.numPointMasses; i++) {
				this.joints[p++] = new Joint(this.pointMasses[i], this.pointMasses[this.clampIndex(i + this.numPointMasses / 2 + 1, this.numPointMasses)], this.low, this.high);
				this.joints[p++] = new Joint(this.pointMasses[i], this.middlePointMass, this.high * 0.9, this.low * 1.1); // 0.8, 1.2 works  
			}
		},
		clampIndex: function (index, maxIndex) {
			index += maxIndex;
			return index % maxIndex;
		},
		addBlob: function (blob) {
			var index = this.joints.length;
			var dist;

			this.joints[index] = new Joint(this.middlePointMass, blob.getMiddlePointMass(), 0.0, 0.0);
			dist = this.radius + blob.getRadius();
			this.joints[index].setDist(dist * 0.95, 0.0);
		},
		getMiddlePointMass: function () {
			return this.middlePointMass;
		},
		getRadius: function () {
			return this.radius;
		},
		getXPos: function () {
			return this.middlePointMass.getXPos();
		},
		getYPos: function () {
			return this.middlePointMass.getYPos();
		},
		scale: function (scaleFactor) {
			var i;

			for (i = 0; i < this.joints.length; i++) {
				this.joints[i].scale(scaleFactor);
			}
			for (i = 0; i < this.sticks.length; i++) {
				this.sticks[i].scale(scaleFactor);
			}
			this.radius *= scaleFactor;
		},
		move: function (dt) {
			var i;

			for (i = 0; i < this.pointMasses.length; i++) {
				this.pointMasses[i].move(dt);
			}
			this.middlePointMass.move(dt);
		},
		sc: function (env) {
			var i, j;

			for (j = 0; j < 4; j++) {
				for (i = 0; i < this.pointMasses.length; i++) {
					if (env.collision(this.pointMasses[i].getPos(), this.pointMasses[i].getPrevPos()) == true) {
						this.pointMasses[i].setFriction(0.75);
					} else {
						this.pointMasses[i].setFriction(0.01);
					}
				}
				for (i = 0; i < this.sticks.length; i++) {
					this.sticks[i].sc(env);
				}
				for (i = 0; i < this.joints.length; i++) {
					this.joints[i].sc();
				}
			}
		},
		setForce: function (force) {
			var i;

			for (i = 0; i < this.pointMasses.length; i++) {
				this.pointMasses[i].setForce(force);
			}
			this.middlePointMass.setForce(force);
		},
		addForce: function (force) {
			var i;

			for (i = 0; i < this.pointMasses.length; i++) {
				this.pointMasses[i].addForce(force);
			}
			this.middlePointMass.addForce(force);
			this.pointMasses[0].addForce(force);
			this.pointMasses[0].addForce(force);
			this.pointMasses[0].addForce(force);
			this.pointMasses[0].addForce(force);
		},
		moveTo: function (x, y) {
			var i, blobPos;

			blobPos = this.middlePointMass.getPos();
			this.pos.x -= blobPos.getX(x);
			this.pos.y -= blobPos.getY(y);

			for (i = 0; i < this.pointMasses.length; i++) {
				blobPos = this.pointMasses[i].getPos();
				blobPos.addX(x);
				blobPos.addY(y);
			}
			blobPos = this.middlePointMass.getPos();
			blobPos.addX(x);
			blobPos.addY(y);
		},
		setSelected: function (selected) {
			this.selected = selected;
		},
		drawEars: function (ctx, scaleFactor) {
			ctx.strokeStyle = "#000000";
			ctx.fillStyle = "#FFFFFF";
			ctx.lineWidth = 2;

			ctx.beginPath();
			ctx.moveTo((-0.55 * this.radius) * scaleFactor, (-0.35 * this.radius) * scaleFactor);
			ctx.lineTo((-0.52 * this.radius) * scaleFactor, (-0.55 * this.radius) * scaleFactor);
			ctx.lineTo((-0.45 * this.radius) * scaleFactor, (-0.40 * this.radius) * scaleFactor);
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo((0.55 * this.radius) * scaleFactor, (-0.35 * this.radius) * scaleFactor);
			ctx.lineTo((0.52 * this.radius) * scaleFactor, (-0.55 * this.radius) * scaleFactor);
			ctx.lineTo((0.45 * this.radius) * scaleFactor, (-0.40 * this.radius) * scaleFactor);
			ctx.fill();
			ctx.stroke();
		},
		drawHappyEyes1: function (ctx, scaleFactor) {
			ctx.lineWidth = 1;
			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.arc((-0.15 * this.radius) * scaleFactor, (-0.20 * this.radius) * scaleFactor, this.radius * 0.12 * scaleFactor, 0, 2.0 * Math.PI, false);
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.arc((0.15 * this.radius) * scaleFactor, (-0.20 * this.radius) * scaleFactor, this.radius * 0.12 * scaleFactor, 0, 2.0 * Math.PI, false);
			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc((-0.15 * this.radius) * scaleFactor, (-0.17 * this.radius) * scaleFactor, this.radius * 0.06 * scaleFactor, 0, 2.0 * Math.PI, false);
			ctx.fill();

			ctx.beginPath();
			ctx.arc((0.15 * this.radius) * scaleFactor, (-0.17 * this.radius) * scaleFactor, this.radius * 0.06 * scaleFactor, 0, 2.0 * Math.PI, false);
			ctx.fill();
		},
		drawHappyEyes2: function (ctx, scaleFactor) {
			ctx.lineWidth = 1;
			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.arc((-0.15 * this.radius) * scaleFactor, (-0.20 * this.radius) * scaleFactor, this.radius * 0.12 * scaleFactor, 0, 2.0 * Math.PI, false);
			ctx.stroke();

			ctx.beginPath();
			ctx.arc((0.15 * this.radius) * scaleFactor, (-0.20 * this.radius) * scaleFactor, this.radius * 0.12 * scaleFactor, 0, 2.0 * Math.PI, false);
			ctx.stroke();

			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo((-0.25 * this.radius) * scaleFactor, (-0.20 * this.radius) * scaleFactor);
			ctx.lineTo((-0.05 * this.radius) * scaleFactor, (-0.20 * this.radius) * scaleFactor);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo((0.25 * this.radius) * scaleFactor, (-0.20 * this.radius) * scaleFactor);
			ctx.lineTo((0.05 * this.radius) * scaleFactor, (-0.20 * this.radius) * scaleFactor);
			ctx.stroke();
		},
		drawHappyFace1: function (ctx, scaleFactor) {
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#000000";
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(0.0, 0.0, this.radius * 0.25 * scaleFactor, 0, Math.PI, false);
			ctx.stroke();
		},
		drawHappyFace2: function (ctx, scaleFactor) {
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#000000";
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(0.0, 0.0, this.radius * 0.25 * scaleFactor, 0, Math.PI, false);
			ctx.fill();
		},
		drawOohFace: function (ctx, scaleFactor) {
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#000000";
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(0.0, (0.1 * this.radius) * scaleFactor, this.radius * 0.25 * scaleFactor, 0, Math.PI, false);
			ctx.fill();

			ctx.beginPath();

			ctx.moveTo((-0.25 * this.radius) * scaleFactor, (-0.3 * this.radius) * scaleFactor);
			ctx.lineTo((-0.05 * this.radius) * scaleFactor, (-0.2 * this.radius) * scaleFactor);
			ctx.lineTo((-0.25 * this.radius) * scaleFactor, (-0.1 * this.radius) * scaleFactor);

			ctx.moveTo((0.25 * this.radius) * scaleFactor, (-0.3 * this.radius) * scaleFactor);
			ctx.lineTo((0.05 * this.radius) * scaleFactor, (-0.2 * this.radius) * scaleFactor);
			ctx.lineTo((0.25 * this.radius) * scaleFactor, (-0.1 * this.radius) * scaleFactor);

			ctx.stroke();
		},
		drawFace: function (ctx, scaleFactor) {
			if (this.drawFaceStyle == 1 && Math.random() < 0.05) {
				this.drawFaceStyle = 2;
			} else if (this.drawFaceStyle == 2 && Math.random() < 0.1) {
				this.drawFaceStyle = 1;
			}

			if (this.drawEyeStyle == 1 && Math.random() < 0.025) {
				this.drawEyeStyle = 2;
			} else if (this.drawEyeStyle == 2 && Math.random() < 0.3) {
				this.drawEyeStyle = 1;
			}

			if (this.middlePointMass.getVelocity() > 0.004) {
				this.drawOohFace(ctx, scaleFactor);
			} else {
				if (this.drawFaceStyle == 1) {
					this.drawHappyFace1(ctx, scaleFactor, 0.0, -0.3);
				} else {
					this.drawHappyFace2(ctx, scaleFactor, 0.0, -0.3);
				}

				if (this.drawEyeStyle == 1) {
					this.drawHappyEyes1(ctx, scaleFactor, 0.0, -0.3);
				} else {
					this.drawHappyEyes2(ctx, scaleFactor, 0.0, -0.3);
				}
			}
		},
		getPointMass: function (index) {
			index += this.pointMasses.length;
			index = index % this.pointMasses.length;
			return this.pointMasses[index];
		},
		drawBody: function (ctx, scaleFactor) {
			var i;

			ctx.strokeStyle = "#000000";
			if (this.selected == true) {
				ctx.fillStyle = "#FFCCCC";
			} else {
				ctx.fillStyle = "#FFFFFF";
			}
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.moveTo(this.pointMasses[0].getXPos() * scaleFactor, this.pointMasses[0].getYPos() * scaleFactor);

			for (i = 0; i < this.pointMasses.length; i++) {
				var px, py, nx, ny, tx, ty, cx, cy;
				var prevPointMass, currentPointMass, nextPointMass, nextNextPointMass;

				prevPointMass = this.getPointMass(i - 1);
				currentPointMass = this.pointMasses[i];
				nextPointMass = this.getPointMass(i + 1);
				nextNextPointMass = this.getPointMass(i + 2);

				tx = nextPointMass.getXPos();
				ty = nextPointMass.getYPos();

				cx = currentPointMass.getXPos();
				cy = currentPointMass.getYPos();

				px = cx * 0.5 + tx * 0.5;
				py = cy * 0.5 + ty * 0.5;

				nx = cx - prevPointMass.getXPos() + tx - nextNextPointMass.getXPos();
				ny = cy - prevPointMass.getYPos() + ty - nextNextPointMass.getYPos();

				px += nx * 0.16;
				py += ny * 0.16;

				px = px * scaleFactor;
				py = py * scaleFactor;

				tx = tx * scaleFactor;
				ty = ty * scaleFactor;

				ctx.bezierCurveTo(px, py, tx, ty, tx, ty);
			}

			ctx.closePath();
			ctx.stroke();
			ctx.fill();
		},
		drawSimpleBody: function (ctx, scaleFactor) {
			for (i = 0; i < this.sticks.length; i++) {
				this.sticks[i].draw(ctx, scaleFactor);
			}
		},
		draw: function (ctx, scaleFactor) {
			var i;
			var up, ori, ang;

			this.drawBody(ctx, scaleFactor);

			ctx.strokeStyle = "#000000";
			ctx.fillStyle = "#000000"

			ctx.save();
			ctx.translate(this.middlePointMass.getXPos() * scaleFactor, (this.middlePointMass.getYPos() - 0.35 * this.radius) * scaleFactor);

			up = new Vector(0.0, -1.0);
			ori = new Vector(0.0, 0.0);
			ori.set(this.pointMasses[0].getPos());
			ori.sub(this.middlePointMass.getPos());
			ang = Math.acos(ori.dotProd(up) / ori.length());
			if (ori.getX() < 0.0) {
				ctx.rotate(-ang);
			} else {
				ctx.rotate(ang);
			}

			// this.drawEars(ctx, scaleFactor); 
			this.drawFace(ctx, scaleFactor);

			ctx.restore();
		}
	});

	BlobCollective = ig.Class.extend({
		maxNum: null,
		numActive: null,
		blobs: null,
		tmpForce: null,
		selectedBlob: null,
		init: function (x, y, startNum, maxNum) {
			this.maxNum = maxNum;
			this.numActive = 1;
			this.blobs = new Array();
			this.tmpForce = new Vector(0.0, 0.0);
			this.selectedBlob = null;
			this.blobs[0] = new Blob(x, y, 1, 8);
		},

		split: function () {
			var i, maxIndex = 0,
				maxRadius = 0.0;
			var emptySlot;
			var motherBlob, newBlob;

			if (this.numActive == this.maxNum) {
				return;
			}

			emptySlot = this.blobs.length;
			for (i = 0; i < this.blobs.length; i++) {
				if (this.blobs[i] != null && this.blobs[i].getRadius() > maxRadius) {
					maxRadius = this.blobs[i].getRadius();
					motherBlob = this.blobs[i];
				} else if (this.blobs[i] == null) {
					emptySlot = i;
				}
			}

			motherBlob.scale(0.75);
			newBlob = new Blob(motherBlob.getXPos(), motherBlob.getYPos(), motherBlob.getRadius(), 8);

			for (i = 0; i < this.blobs.length; i++) {
				if (this.blobs[i] == null) {
					continue;
				}
				this.blobs[i].addBlob(newBlob);
				newBlob.addBlob(this.blobs[i]);
			}
			this.blobs[emptySlot] = newBlob;

			this.numActive++;
		},
		findSmallest: function (exclude) {
			var minRadius = 1000.0,
				minIndex;
			var i;

			for (i = 0; i < this.blobs.length; i++) {
				if (i == exclude || this.blobs[i] == null) {
					continue;
				}
				if (this.blobs[i].getRadius() < minRadius) {
					minIndex = i;
					minRadius = this.blobs[i].getRadius();
				}
			}
			return minIndex;
		},
		findClosest: function (exclude) {
			var minDist = 1000.0,
				foundIndex, dist, aXbX, aYbY;
			var i;
			var myPointMass, otherPointMass;

			myPointMass = this.blobs[exclude].getMiddlePointMass();
			for (i = 0; i < this.blobs.length; i++) {
				if (i == exclude || this.blobs[i] == null) {
					continue;
				}

				otherPointMass = this.blobs[i].getMiddlePointMass();
				aXbX = myPointMass.getXPos() - otherPointMass.getXPos();
				aYbY = myPointMass.getYPos() - otherPointMass.getYPos();
				dist = aXbX * aXbX + aYbY * aYbY;
				if (dist < minDist) {
					minDist = dist;
					foundIndex = i;
				}
			}
			return foundIndex;
		},
		join: function () {
			var blob1Index, blob2Index, blob1, blob2;
			var r1, r2, r3;

			if (this.numActive == 1) {
				return;
			}

			blob1Index = this.findSmallest(-1);
			blob2Index = this.findClosest(blob1Index);

			r1 = this.blobs[blob1Index].getRadius();
			r2 = this.blobs[blob2Index].getRadius();
			r3 = Math.sqrt(r1 * r1 + r2 * r2);

			this.blobs[blob1Index] = null;
			this.blobs[blob2Index].scale(0.945 * r3 / r2);

			this.numActive--;
		},
		selectBlob: function (x, y) {
			var i, minDist = 10000.0;
			var otherPointMass;
			var selectedBlob;
			var selectOffset = null;

			if (this.selectedBlob != null) {
				return;
			}

			for (i = 0; i < this.blobs.length; i++) {
				if (this.blobs[i] == null) {
					continue;
				}

				otherPointMass = this.blobs[i].getMiddlePointMass();
				aXbX = x - otherPointMass.getXPos();
				aYbY = y - otherPointMass.getYPos();
				dist = aXbX * aXbX + aYbY * aYbY;
				if (dist < minDist) {
					minDist = dist;
					if (dist < this.blobs[i].getRadius() * 0.5) {
						this.selectedBlob = this.blobs[i];
						selectOffset = {
							x: aXbX,
							y: aYbY
						};
					}
				}
			}

			if (this.selectedBlob != null) {
				this.selectedBlob.setSelected(true);
			}
			return selectOffset;
		},
		unselectBlob: function () {
			if (this.selectedBlob == null) {
				return;
			}
			this.selectedBlob.setSelected(false);
			this.selectedBlob = null;
		},
		selectedBlobMoveTo: function (x, y) {
			if (this.selectedBlob == null) {
				return;
			}
			this.selectedBlob.moveTo(x, y);
		},
		move: function (dt) {
			var i;

			for (i = 0; i < this.blobs.length; i++) {
				if (this.blobs[i] == null) {
					continue;
				}
				this.blobs[i].move(dt);
			}
		},
		sc: function (env) {
			var i;

			for (i = 0; i < this.blobs.length; i++) {
				if (this.blobs[i] == null) {
					continue;
				}
				this.blobs[i].sc(env);
			}
			if (this.blobAnchor != null) {
				this.blobAnchor.sc();
			}
		},
		setForce: function (force) {
			var i;

			for (i = 0; i < this.blobs.length; i++) {
				if (this.blobs[i] == null) {
					continue;
				}
				if (this.blobs[i] == this.selectedBlob) {
					this.blobs[i].setForce(new Vector(0.0, 0.0));
					continue;
				}
				this.blobs[i].setForce(force);
			}
		},
		addForce: function (force) {
			var i;

			for (i = 0; i < this.blobs.length; i++) {
				if (this.blobs[i] == null) {
					continue;
				}
				if (this.blobs[i] == this.selectedBlob) {
					continue;
				}
				this.tmpForce.setX(force.getX() * (Math.random() * 0.75 + 0.25));
				this.tmpForce.setY(force.getY() * (Math.random() * 0.75 + 0.25));
				this.blobs[i].addForce(this.tmpForce);
			}
		},
		draw: function (ctx, scaleFactor) {
			var i;

			for (i = 0; i < this.blobs.length; i++) {
				if (this.blobs[i] == null) {
					continue;
				}
				this.blobs[i].draw(ctx, scaleFactor);
			}
		}
	});
	BlobGenerator = ig.Class.extend({
		env: null,
		width: 960.0,
		height: 640.0,
		scaleFactor: 100.0,
		blobColl: null,
		gravity: null,
		stopped: null,
		savedMouseCoords: null,
		selectOffset: null,
		canvas: null,
		ctx: null,
		
		init: function () {
			this.canvas = ig.$('#canvas');
			if (this.canvas.getContext == null) {
				alert("You need Firefox version 1.5 or higher for this to work, sorry.");
				return;
			}
			this.ctx = this.canvas.getContext('2d');
			setTimeout(function () {
				ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
				ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
				ig.input.bind(ig.KEY.UP_ARROW, 'up');
				ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
				ig.input.bind(ig.KEY.J, 'join');
				ig.input.bind(ig.KEY.H, 'split');
				ig.input.bind(ig.KEY.G, 'togglGravity');
			}, 1000);


			function getMouseCoords(event) {
				if (event == null) {
					event = window.event;
				}
				if (event == null) {
					return null;
				}
				if (event.pageX || event.pageY) {
					return {
						x: event.pageX / this.scaleFactor,
						y: event.pageY / this.scaleFactor
					};
				}
				return null;
			}
			ig.global.onmousedown = function (event) {
				var mouseCoords;

				if (this.stopped == true) {
					return;
				}
				mouseCoords = getMouseCoords(event);
				if (mouseCoords == null) {
					return;
				}
				this.selectOffset = this.blobColl.selectBlob(mouseCoords.x, mouseCoords.y);
			}
			ig.global.onmouseup = function (event) {
				this.blobColl.unselectBlob();
				this.savedMouseCoords = null;
				this.selectOffset = null;
			}
			ig.global.onmousemove = function (event) {
				var mouseCoords;

				if (this.stopped == true) {
					return;
				}
				if (this.selectOffset == null) {
					return;
				}
				mouseCoords = getMouseCoords(event);
				if (mouseCoords == null) {
					return;
				}
				this.blobColl.selectedBlobMoveTo(mouseCoords.x - this.selectOffset.x, mouseCoords.y - this.selectOffset.y);

				this.savedMouseCoords = mouseCoords;
			}

			this.env = new Environment(0, 0, 960, 640);
			this.blobColl = new BlobCollective(50, 100, 1, 200);
			this.gravity = new Vector(0.0, 10.0);
			this.stopped = false;
		},
		update: function () {
			var dt = 0.05;

			if (this.savedMouseCoords != null && this.selectOffset != null) {
				this.blobColl.selectedBlobMoveTo(this.savedMouseCoords.x - this.selectOffset.x, this.savedMouseCoords.y - this.selectOffset.y);
			}

			if (ig.input.pressed("left")) {
				this.blobColl.addForce(new Vector(-50.0, 0.0));
			} else if (ig.input.pressed("right")) {
				this.blobColl.addForce(new Vector(50.0, 0.0));
			} else if (ig.input.pressed("up")) {
				this.blobColl.addForce(new Vector(0.0, -50.0));
			} else if (ig.input.pressed("down")) {
				this.blobColl.addForce(new Vector(0.0, 50.0));
			} else if (ig.input.pressed("join")) {
				this.blobColl.join();
			} else if (ig.input.pressed("split")) {
				this.blobColl.split();
			} else if (ig.input.pressed("toggleGravity")) {
				this.toggleGravity();
			}
			this.blobColl.move(dt);
			this.blobColl.sc(this.env);
			this.blobColl.setForce(this.gravity);
		},
		draw: function () {
			if (this.canvas.getContext == null) {
				return;
			}
			var ctx = this.canvas.getContext('2d');
			//ctx.clearRect(0, 0, this.width, this.height);
			this.env.draw(ctx, this.scaleFactor);
			this.blobColl.draw(ctx, this.scaleFactor);
		},
		stop: function () {
			this.stopped = true;
		},
		start: function () {
			this.stopped = false;
		},
		toggleGravity: function () {
			if (this.gravity.getY() > 0.0) {
				this.gravity.setY(0.0);
			} else {
				this.gravity.setY(10.0);
			}
		}
	});
});