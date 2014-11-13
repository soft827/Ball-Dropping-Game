var ResultLayer = cc.LayerColor.extend({
    ctor:function () {
        this._super();
        this.init();
    },

    // init:function () {
    //     this._super();
    //     var winsize = cc.director.getWinSize();

    //     //create the background image and position it at the center of screen
    //     var centerPos = cc.p(winsize.width / 2, winsize.height / 2);
    //     this.spriteBG = cc.Sprite.create(s_Smile);
    //     this.spriteBG.setPosition(centerPos);
        
    //     this.resultText = cc.LabelTTF.create("Stairs:0", "Helvetica", 20);
    //     this.resultText.setColor(cc.color(255,255,255));//black color
    //     this.resultText.setPosition(cc.p(winsize.width / 2, winsize.height / 2));
    // },

    init : function () {
        this._super(cc.color(0, 0, 0, 180));
        var winSize = cc.director.getWinSize();

        var centerPos = cc.p(winSize.width / 2, winSize.height / 2);
        cc.MenuItemFont.setFontSize(30);
        var menuItemRestart = new cc.MenuItemSprite(
            new cc.Sprite(s_Restart),
            new cc.Sprite(s_Restart),
            this.onRestart, this);
        var menu = new cc.Menu(menuItemRestart);
        menu.setPosition(centerPos);
        this.addChild(menu);
    },

    onRestart:function (sender) {
        clearTimeout(gameTimer);      
        clearInterval(movingTimer);  
        g_plates = [];
        g_game_ends = false;
        cc.director.resume();
        cc.director.runScene(new PlayScene());
    },

    show : function (resultString) {
        this.resultText.setString(resultString);
        this.addChild(this.spriteBG);
        this.addChild(this.resultText);
        cc.eventManager.addListener({
            event : cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan :  function(touch, event){
                cc.eventManager.dispatchEvent(new cc.EventCustom("game_restarts"));
            },
            onTouchEnded : function(touch, event) {
                return;
            }
        }, this);
    },

    hide : function () {
        this.removeChild(this.spriteBG);
        this.removeChild(this.resultText);
    },

    spriteBG : null,
    resultText : null
});
