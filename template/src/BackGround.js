var BackgroundLayer = cc.Layer.extend({
	ctor : function() {
		this._super();
		this.init();
	},

	init : function() {
		this._super();
		var winSize = cc.director.getWinSize();
		var centerPos = cc.p(winSize.width / 2, winSize.height / 2);
		//var spriteBG = cc.Sprite.create(s_PlayBG);
		//spriteBG.setPosition(centerPos);
		var leftLayer = new cc.LayerColor(cc.color(0, 0, 0, 255), winSize.width / 2, winSize.height);
		leftLayer.setPosition(cc.p(0, 0));
		var rightLayer = new cc.LayerColor(cc.color(255, 255, 255, 255), winSize.width / 2, winSize.height);
		rightLayer.setPosition(cc.p(winSize.width / 2, 0));
		this.addChild(leftLayer);
		this.addChild(rightLayer);
		var statusLayer = new StatusLayer();
		this.addChild(statusLayer);

		//计算方块个数
		var countOfPlates = Math.floor((winSize.height * 2) / (3 *  g_plateSpace));
		var plateStartY = Math.floor(winSize.height / 3);
		//摆放方块
		for(var i = 0; i < countOfPlates; i++) {
			var rand = Math.random();
			if(rand > 0.5) { // 放在左边
				//var color = cc.color(255, 255, 255, 255);
				var plateSprite = new PlateSprite("left", cc.p({
					x : (winSize.width / 2 - g_plateWidth - g_marginSpace),
					y : (plateStartY + i *  g_plateSpace)
				}));
				g_plates.push(plateSprite);
				this.addChild(plateSprite);
			} else { // 放在右边
				//var color = cc.color(0, 0, 0, 255);
				var plateSprite = new PlateSprite("right", cc.p({
					x : (winSize.width / 2 + g_marginSpace),
					y : (plateStartY + i *  g_plateSpace)
				}));
				g_plates.push(plateSprite);
				this.addChild(plateSprite);
			}
		}
		//摆放圆球,首先计算圆球摆放位置
		var firstPlatePosition = g_plates[0].getPosition();
		var ballPosition = cc.p({x : firstPlatePosition.x , 
			y : firstPlatePosition.y + g_ballRadius});
		var ballColor = cc.color(100, 100, 100);
		if(ballPosition.x < winSize.width / 2) {
			ballColor = g_right_color;
		} else {
			ballColor = g_left_color;
		}
		var ball = new ImageBallSprite(ballPosition, ballColor);
		this.addChild(ball);
		var thisObj = this;
		cc.eventManager.addListener({
			event : cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan :  function(touch, event){
				if(g_game_ends) {
					return;
				}
				if(gameTimer) {
					clearTimeout(gameTimer);
				}
				thisObj._movePlatesDown();
				var platePosition = g_plates[0].getPosition();
				if(touch) {
					var touchLocation = touch.getLocation();
					cc.log("touch x is " + touchLocation.x + " while winSize width is " + winSize.width + " and ball position is " + ball.getPosition().x);
					var ballPosition = cc.p({x : platePosition.x, 
							y : platePosition.y + g_ballRadius});					
					if(touchLocation.x < (winSize.width / 2) && ball.drawNodePosition.x > (winSize.width / 2)) {
						ball.move("left", {x : g_plateWidth + (g_marginSpace * 2), y : platePosition.y - ball.drawNodePosition. y + g_ballRadius}, g_right_color);
						//ball.setPosition(ballPosition, g_right_color);
					} else if(touchLocation.x > (winSize.width / 2) && ball.drawNodePosition.x < (winSize.width / 2)){
						ball.move("right",{x : g_plateWidth + (g_marginSpace * 2), y : platePosition.y - ball.drawNodePosition. y + g_ballRadius}, g_left_color);
						//ball.setPosition(ballPosition, g_left_color);
					} else {
						//ball.move("down",{x : 0, y : ballPosition.y - ball.drawNodePosition.y});
						ball.setPosition({x : ball.getPosition().x , y : ball.getPosition().y});
					}

				}
		        //判断球是否仍在挡板上
		        var inPlate = false;
		        
		        //var inPlate = ball.drawNodePosition.x > platePosition.x && ball.drawNodePosition.x < (platePosition.x + g_plateWidth);
		        var inPlate = ((ball.getPosition().x > winSize.width / 2) == (platePosition.x > winSize.width / 2));
		        cc.log("inplate is " + inPlate);
		        if(inPlate) {
		        	g_stairs++;
		        	statusLayer.update(g_stairs);
		        	//启动计时器
		        	cc.log("in plate. Timer started");
		        	gameTimer = setTimeout(function() {
		        		cc.log("game ends in time out");
		        		g_plates[0].clear();
		        		g_game_ends = true;
		        		ball.drop();
		        		cc.eventManager.dispatchEvent(new cc.EventCustom("game_ends"));
		        	}, g_play_delay)
		        } else {
		        	g_game_ends = true;
		        	cc.eventManager.dispatchEvent(new cc.EventCustom("game_ends"));
		        	ball.drop();
		        }
		    },
		    onKeyReleased : function(keyCode, event){
		        //thisSprite.stopAction(runningAction);
		        cc.log("key released");
		    },
		}, this);
		
		cc.eventManager.addListener({
			event : cc.EventListener.CUSTOM,
			eventName : "game_ends",
			swallowTouches : true,
			callback : function (event) {
				cc.log("game end in callback");
				//cc.director.pause();
       			thisObj.addChild(new ResultLayer());
				cc.log("game ends");
			}
		}, this);

		cc.eventManager.addListener({
			event : cc.EventListener.CUSTOM,
			eventName : "game_restarts",
			swallowTouches : true,
			callback : function(event) {
				thisObj.restart();
				cc.log("game restarts");
			}
		}, this);

		/*movingTimer = setInterval(function() {
			for(var i = 0; i < g_plates.length; i++) {
				g_plates[i].down(g_moving_step);
			}
			ball.move("down", {x : 0, y : g_moving_step});
		}, g_moving_interval);*/
	},

	restart : function() {
		//清除全局变量
		clearTimeout(gameTimer);		
		cc.director.resume();
        cc.director.runScene(new PlayScene());
        g_plates = [];
		g_game_ends = false;
		cc.log("all children removed");
		//this.init();
	},

	_movePlatesDown : function() {
		var countOfPlates = g_plates.length;
        var firstPlateSprite = g_plates.shift();
        if(firstPlateSprite) {
        	firstPlateSprite.clear();
        }
        var winSize = cc.director.getWinSize();
		var plateStartY = Math.floor(winSize.height / 3);
        var rand = Math.random();
        if(rand > 0.5) {
        	var color = cc.color(255, 255, 255, 255);
			var lastPlateSprite = new PlateSprite("left", cc.p({
				x : (winSize.width / 2 - g_plateWidth - g_marginSpace),
				y : (plateStartY + countOfPlates *  g_plateSpace)
			}));
			g_plates.push(lastPlateSprite);
			this.addChild(lastPlateSprite); 
        } else {
        	var color = cc.color(0, 0, 0, 255);
			var lastPlateSprite = new PlateSprite("right", cc.p({
				x : (winSize.width / 2 + g_marginSpace),
				y : (plateStartY + countOfPlates * g_plateSpace)
			}));
			g_plates.push(lastPlateSprite);
			this.addChild(lastPlateSprite);
        }
        for(var i = 0; i < g_plates.length; i++) {
        	g_plates[i].downStep();
        }
	}
});


var PlateSprite = cc.Sprite.extend({
	ctor : function(color, position) {
		this._super();
		this.init(color, position);
	},

	init : function(color, position) {
		this._super();
		//this.drawNode = cc.DrawNode.create();
		//this.drawNode.drawRect(position, new cc.Point(position.x + g_plateWidth, position.y + g_plateHeight), color, 1, color);
		//this.addChild(this.drawNode);
		//this.colorLayer = new cc.LayerColor(color, g_plateWidth, g_plateHeight);
		//this.colorLayer.setPosition(position);
		//this.addChild(this.colorLayer);
		this.sprite = cc.Sprite.create(g_plate_bgs[color]);
		this.sprite.setScaleX(g_plateWidth / g_plate_oriented_width);
		this.sprite.setScaleY(g_plateHeight / g_plate_oriented_height);
		this._mPosition = {x : position.x + g_plateWidth / 2, y : position.y + g_plateHeight /2};
		this.sprite.setPosition(this._mPosition);
		this.addChild(this.sprite);
		//this.setZOrder(1);
		//this._mColor = color;
		//this._mPosition = position;
	},

	downStep : function() {
		if(this.drawNode) {
			// this.drawNode.clear();
			// var color = this._color;
			// var downStepHeight = g_plateSpace;
			// this._mPosition = cc.p(this._mPosition.x, this._mPosition.y - downStepHeight);
			// this.drawNode.drawRect(new cc.Point(this._mPosition.x, this._mPosition.y - downStepHeight), 
			// 	new cc.Point(this._mPosition.x + g_plateWidth, this._mPosition.y - downStepHeight + g_plateHeight), 
			// 	this._mColor, 
			// 	1, 
			// 	this._mColor);
		}
		if(this.sprite) {
			var downStepHeight = g_plateSpace;
			this._mPosition = cc.p(this._mPosition.x, this._mPosition.y - downStepHeight);
			//this.colorLayer.setPosition(this._mPosition);
			this.sprite.setPosition(this._mPosition);
		}
	},

	down : function(step) {
		this._mPosition = cc.p(this._mPosition.x, this._mPosition.y - step);
		cc.log("down step");
		this.colorLayer.setPosition(this._mPosition);
		this.sprite.setPosition(this._mPosition);
	},

	clear : function () {
		if(this.drawNode) {
			this.drawNode.clear();
		}
		if(this.sprite) {		
			var winSize = cc.director.getWinSize();	
			if(this._mPosition.x < winSize.width / 2) {
				this.runAction(new cc.ScaleTo(1, 1, 0));
			} else {
				this.runAction(new cc.ScaleTo(1, 1, 0));
			}
		}
	},

	getPosition : function () {
		return this._mPosition;
	},

	drawNode : null,
	colorLayer : null,
	_mColor : null,
	_mPosition : null,
	sprite : null
});

var BallSprite = cc.Sprite.extend({
	ctor : function (position, drawColor) {
		this._super();
		this.init(position, drawColor);
	},

	init : function (position, drawColor) {
		this.drawNode = cc.DrawNode.create();
		if(!position) {
			position = cc.p({x : 100, y : 100});
		}
		//this.drawNode.drawCircle(position, g_ballRadius, 360, 100, false, g_ballLineWidth, cc.color(100, 100, 100, 255));
		this.drawNode.drawDot(position, g_ballRadius, drawColor);
		this.drawNodePosition = position;
		this.drawNodeInitPosition = position;
		this.drawColor = drawColor;
		this.addChild(this.drawNode);
	},

	move : function (direction, moveDistance,drawColor) {
		if(!drawColor) drawColor = this.drawColor;
		this.drawColor = drawColor;
		this.drawNode.clear();
		if(direction == "left") {
			this.drawNodePosition = cc.p({x : this.drawNodePosition.x - moveDistance.x, y : this.drawNodePosition.y + moveDistance.y});
			//this.drawNode.drawCircle(this.drawNodePosition, g_ballRadius, 360, 100, false, g_ballLineWidth, cc.color(100, 100, 100, 255));			
		} else if(direction == "right") {
			this.drawNodePosition = cc.p({x : this.drawNodePosition.x + moveDistance.x, y: this.drawNodePosition.y + moveDistance.y});
			//this.drawNode.drawCircle(this.drawNodePosition, g_ballRadius, 360, 100, false, g_ballLineWidth, cc.color(100, 100, 100, 255));
		}else if(direction == "up") {
			this.drawNodePosition = cc.p({x : this.drawNodePosition.x, y: this.drawNodePosition.y + moveDistance.y});
		}else if(direction == "down") {			
			this.drawNodePosition = cc.p({x : this.drawNodePosition.x, y: this.drawNodePosition.y - moveDistance.y});
			//this.drawNode.drawCircle(this.drawNodePosition, g_ballRadius, 360, 100, false, g_ballLineWidth, cc.color(100, 100, 100, 255));
		}
		this.drawNode.drawDot(this.drawNodePosition, g_ballRadius, drawColor);
	},

	setPosition : function(position, drawColor) {
		if(!drawColor) drawColor = this.drawColor;
		this.drawColor = drawColor;
		this.drawNode.clear();
		this.drawNodePosition = position;
		this.drawNode.drawDot(this.drawNodePosition, g_ballRadius, drawColor);
	},

	drop : function () {
		var dropAction = new DropAction(1, this);
		this.runAction(dropAction);
	},

	clear : function() {
		this.drawNode.clear();
	},

	drawNode : null,
	drawNodePosition : null,
	drawNodeInitPosition : null,
	drawColor : null
});

var ImageBallSprite = cc.Sprite.extend({
	ctor : function (position, drawColor) {
		this._super();
		this.init(position, drawColor);
	},

	init : function (position, drawColor) {
		this.sprite = cc.Sprite.create(s_BlackBall);
		this.setZOrder(999999);
		this.sprite.setPosition(position);
		this._mPosition = position;
		this.drawNodeInitPosition = position;
		this.drawNodePosition = position;
		this.sprite.setScaleX((g_ballRadius * 2) / g_oriented_width);
		this.sprite.setScaleY((g_ballRadius * 2) / g_oriented_height);
		this.addChild(this.sprite);
	},

	getPosition : function() {
		return this._mPosition;
	},

	move : function (direction, moveDistance,drawColor) {
		
		if(!drawColor) {
			drawColor = this.drawColor;
		} else if(drawColor == g_right_color) {
			this.sprite.setTexture(s_WhiteBall);
		} else if(drawColor == g_left_color) {
			this.sprite.setTexture(s_BlackBall);
		}
		this.drawColor = drawColor;
		//this.drawNode.clear();
		if(direction == "left") {
			this.drawNodePosition = cc.p({x : this.drawNodePosition.x - moveDistance.x, y : this.drawNodePosition.y + moveDistance.y});
			//this.drawNode.drawCircle(this.drawNodePosition, g_ballRadius, 360, 100, false, g_ballLineWidth, cc.color(100, 100, 100, 255));			
		} else if(direction == "right") {
			this.drawNodePosition = cc.p({x : this.drawNodePosition.x + moveDistance.x, y: this.drawNodePosition.y + moveDistance.y});
			//this.drawNode.drawCircle(this.drawNodePosition, g_ballRadius, 360, 100, false, g_ballLineWidth, cc.color(100, 100, 100, 255));
		}else if(direction == "up") {
			this.drawNodePosition = cc.p({x : this.drawNodePosition.x, y: this.drawNodePosition.y + moveDistance.y});
		}else if(direction == "down") {			
			this.drawNodePosition = cc.p({x : this.drawNodePosition.x, y: this.drawNodePosition.y - moveDistance.y});
			//this.drawNode.drawCircle(this.drawNodePosition, g_ballRadius, 360, 100, false, g_ballLineWidth, cc.color(100, 100, 100, 255));
		}
		this._mPosition = this.drawNodePosition;
		//this.drawNode.drawDot(this.drawNodePosition, g_ballRadius, drawColor);
		this.sprite.setPosition(this._mPosition);
	},

	drop : function () {
		var dropAction = new DropAction(1, this);
		this.runAction(dropAction);
	},

	clear : function() {
		this.removeFromParent(true);
	},

	setPosition : function(position, drawColor) {
		if(!drawColor) drawColor = this.drawColor;
		this._mPosition = position;
		this.sprite.setPosition(this._mPosition);
	},

	sprite : null,
	_mPosition : null,
	drawNodePosition : null,
	drawNodeInitPosition : null

});

var DropAction = cc.ActionInterval.extend({
	ctor : function (duration, actionObj) {
		cc.ActionInterval.prototype.ctor.call(this);
		this.initWithDuration(duration);
		this.init(actionObj);
	},

	init : function(actionObj) {
		this.actionObj = actionObj;
	},

	stop : function() {
		this._super();
		cc.log("Action stopped.");
	},

	update : function(dt) {
		dt = this._computeEaseTime(dt);
		if(dt == 1) {
			this.actionObj.clear();
		} else {
			distance = this.actionObj.drawNodeInitPosition.y * dt;
			this.actionObj.move("down", distance);
		}
		//cc.log("elapsed " + this._elapsed + " and duration is " + this._duration);
		//cc.log("Action runned after one frame. and dt is " + dt + " and distance is " + distance);
	},

	initWithDuration:function (duration) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
        	cc.log("true in elapsed is " + this._elapsed);
            return true;
        }
        cc.log("false in elapsed is " + this._elapsed);
        return false;

    },

	actionObj : null
});

var gameTimer = null;
var movingTimer = null;