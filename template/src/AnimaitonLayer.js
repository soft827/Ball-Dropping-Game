var AnimationLayer = cc.Layer.extend({
	ctor : function (space) {
		this._super();
		this.space = space;
		this.init();
	},

	init: function () {
		this._super();
		
		cc.spriteFrameCache.addSpriteFrames(s_RunnerList);
		this.spriteSheet = cc.SpriteBatchNode.create(s_Runner);
		this.addChild(this.spriteSheet);

		var animFrames = [];
		for(var i = 0; i < 8; i++) {
			var runnerIndex = "runner" + i + ".png";
			var frame = cc.spriteFrameCache.getSpriteFrame(runnerIndex);
			animFrames.push(frame);
		}

		var animation = cc.Animation.create(animFrames, 0.1);
		this.runningAction = cc.RepeatForever.create(cc.Animate.create(animation));

		this.sprite = new cc.PhysicsSprite("#runner0.png");
		var contentSize = this.sprite.getContentSize();
		cc.log("contentSize " + contentSize.width + "	" + contentSize.height);
		this.body = new cp.Body(1, cp.momentForBox(1, contentSize.width, contentSize.height));
		this.body.p = cc.p(g_runnerStartX, g_groundHight + contentSize.height / 2);
		cc.log("position " + this.body.p.x + "	" + this.body.p.y);
		this.body.applyImpulse(cp.v(150, 0), cp.v(0, 0));
		this.space.addBody(this.body);
		this.shape = new cp.BoxShape(this.body, contentSize.width, contentSize.height);
		this.space.addShape(this.shape);
		this.sprite.setBody(this.body);
		this.sprite.runAction(this.runningAction);
		this.spriteSheet.addChild(this.sprite);
		var thisSprite = this.sprite;
		var runningAction = this.runningAction;
		cc.eventManager.addListener({
			event : cc.EventListener.KEYBOARD,
			swallowTouches: true,
			onKeyPressed:  function(keyCode, event){
		        //thisSprite.runAction(runningAction);
		    },
		    onKeyReleased: function(keyCode, event){
		        //thisSprite.stopAction(runningAction);
		    },
		}, this);
	},


	spriteSheet : null,
	runningAction : null,
	sprite : null,
	space : null,
	shape : null,
	clickListener : null
});