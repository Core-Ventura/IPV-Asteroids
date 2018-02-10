var GameOverLayer = cc.LayerColor.extend({
    ctor:function(){
        this._super(cc.color(0,0,0,180));
        var winSize = cc.director.getWinSize();

        var gameOverText  = new cc.MenuItemSprite(
            new cc.Sprite(res.game_over_png),
            new cc.Sprite(res.game_over_png),
            this, this)

        var menu = new cc.Menu(gameOverText);
        menu.setPosition(winSize.width/2, winSize.height/2);
        this.addChild(menu);

    }
});