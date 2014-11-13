window.onload = function() {
    cc.game.onStart = function(){
        var designSize = cc.size(1366, 768);
        var screenSize = cc.view.getFrameSize();

        /*if(!cc.sys.isNative && screenSize.height < 800){
            //designSize = cc.size(1366, 768);
            cc.loader.resPath = "res/Normal";
        }else{
            cc.loader.resPath = "res/HD";
        }*/
        //cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.SHOW_ALL);
        //cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.SHOW_ALL);
        cc.loader.resPath = "res/Normal";
        //cc.view.setDesignResolutionSize(480, 320, cc.ResolutionPolicy.FIXED_WIDTH);
        cc.view.setDesignResolutionSize(screenSize.width, screenSize.height, cc.ResolutionPolicy.FIXED_WIDTH);
        cc.view.resizeWithBrowserSize(true);

        //初始化全局参数
        g_plateWidth = screenSize.width / 3;
        g_plateHeight = screenSize.height / 27;
        g_plateSpace = screenSize.height / 9;
        g_ballRadius = screenSize.height / 36;

        //load resources
        cc.LoaderScene.preload(g_resources, function () {
            //cc.director.runScene(new MyScene());
            cc.director.runScene(new PlayScene());
        }, this);
    };
    cc.game.run("gameCanvas");
};
