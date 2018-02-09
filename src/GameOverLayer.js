var GameOverLayer = cc.LayerColor.extend({
    ctor:function(){
        this._super(cc.color(0,0,0,180));
        var winSize = cc.director.getWinSize();

        var botonReiniciar  = new cc.MenuItemSprite(
            new cc.Sprite(res.boton_nueva_partida_png),
            new cc.Sprite(res.boton_nueva_partida_png),
            this.pulsarReiniciar, this);

        var menu = new cc.Menu(botonReiniciar);
        menu.setPosition(winSize.width/2, winSize.height/2);
        this.addChild(menu);

    }, pulsarReiniciar:function () {
        //Vuelve a inicializar la escena Principal.
        cc.director.runScene(new GameScene());
    }
});