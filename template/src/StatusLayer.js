var StatusLayer = cc.Layer.extend({
    labelStairCount:null,
    labelMeter:null,
    coins:0,

    ctor:function () {
        this._super();
        this.init();
    },

    init:function () {
        this._super();

        var winsize = cc.director.getWinSize();

        this.labelStairCount = cc.LabelTTF.create("Stairs:0", "Helvetica", 20);
        this.labelStairCount.setColor(cc.color(255,255,255));//black color
        this.labelStairCount.setPosition(cc.p(40, winsize.height - 20));
        this.addChild(this.labelStairCount);

        
    },
    update : function(count) {
        this.labelStairCount.setString("Stairs:" + count);
    }
});
