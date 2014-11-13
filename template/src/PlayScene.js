var PlayScene = cc.Scene.extend({
	ctor : function(space) {
		this._super();
		this.space = space;
		this.init();
	},

	onEnter : function () {
		this._super();
		//this.initPhysics();

		this.addChild(new BackgroundLayer());
		//this.addChild(new StatusLayer());
		//this.addChild(new AnimationLayer(this.space));
		this.scheduleUpdate();
	},

	initPhysics : function () {
		this.space = new cp.Space();
		this.space.gravity = cp.v(0, -350);

		var wallBottom = new cp.SegmentShape(this.space.staticBody,
			cp.v(0, g_groundHight),
			cp.v(4294967295, g_groundHight),
			0);
		this.space.addStaticShape(wallBottom);
	},

	update:function (dt) {
        // chipmunk step
        //this.space.step(dt);
    },
	space : null
});