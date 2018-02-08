
var GameLayer = cc.Layer.extend({
    space:null,
    spritePelota:null,
    arrayBloques:[],
    spriteFondo: null,
    ctor:function () {
        this._super();
        var size = cc.winSize;

        cc.spriteFrameCache.addSpriteFrames(res.animacion_bola_plist);
        cc.spriteFrameCache.addSpriteFrames(res.barra_3_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacioncocodrilo_plist);

        this.space = new cp.Space();
        this.space.gravity = cp.v(0,-350);

        this.depuracion = new cc.PhysicsDebugNode(this.space);
        this.addChild(this.depuracion, 10);

        // Pelota
            this.spritePelota = new cc.PhysicsSprite("#animacion_bola1.png");

            // Body - Cuerpo
            var body = new cp.Body( 1, cp.momentForCircle(1, 0, this.spritePelota.width/2, cp.vzero)    );
            body.p = cc.p(size.width*0.1 ,size.height*0.5);
            this.spritePelota.setBody(body);
            this.space.addBody(body);

            // Shape - forma
            var shape = new cp.CircleShape(body, this.spritePelota.width/2, cp.vzero);
            this.space.addShape(shape);
            this.addChild(this.spritePelota);

        // Muro

         // Muros
         var muroIzquierda = new cp.SegmentShape(this.space.staticBody,
             cp.v(0, 0),// Punto de Inicio
             cp.v(0, size.height),// Punto final
             10);// Ancho del muro
         this.space.addStaticShape(muroIzquierda);

         var muroArriba = new cp.SegmentShape(this.space.staticBody,
             cp.v(0, size.height),// Punto de Inicio
             cp.v(size.width, size.height),// Punto final
             10);// Ancho del muro
         this.space.addStaticShape(muroArriba);

         var muroDerecha = new cp.SegmentShape(this.space.staticBody,
             cp.v(size.width, 0),// Punto de Inicio
             cp.v(size.width, size.height),// Punto final
             10);// Ancho del muro
         this.space.addStaticShape(muroDerecha);

         var muroAbajo = new cp.SegmentShape(this.space.staticBody,
             cp.v(0, 0),// Punto de Inicio
             cp.v(size.width, 0),// Punto final
             10);// Ancho del muro
         this.space.addStaticShape(muroAbajo);


        this.inicializarPlataformas();
        this.inicializarBloques();

        // Evento MOUSE
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: this.procesarMouseDown
        }, this);

        this.scheduleUpdate();
        return true;

    },procesarMouseDown:function(event) {
        // Ambito procesarMouseDown
        var instancia = event.getCurrentTarget();

        // PRUEBA 2:
         var body = instancia.spritePelota.body;
         body.applyImpulse(cp.v( event.getLocationX() - body.p.x, event.getLocationY() - body.p.y), cp.v(0,0));


     },update:function (dt) {
        this.space.step(dt);

     },inicializarPlataformas: function(){
        // Sprite
        var spritePlataforma = new cc.PhysicsSprite("#barra_3.png");
        this.addChild(spritePlataforma);

        // Body static
        var body = new cp.StaticBody();
        body.p = cc.p(cc.winSize.width*0.7 , cc.winSize.height*0.4);
        spritePlataforma.setBody(body);

        // Shape - static
        var shape
            = new cp.BoxShape(body, spritePlataforma.width, spritePlataforma.height);
        this.space.addStaticShape(shape);

     }, inicializarBloques:function () {

         for( i=0; i < 4; i++){
            var spriteBloque = new cc.PhysicsSprite("#cocodrilo1.png");
            this.addChild(spriteBloque);

            // BODY dinamico
            var body =
                new cp.Body(1, cp.momentForBox(1, spriteBloque.width, spriteBloque.height));
            body.p = cc.p(cc.winSize.width*0.7 , cc.winSize.height*0.4 + 10 + 20 + 40 * i);
            spriteBloque.setBody(body);
            this.space.addBody(body);


            // SHAPE estatica
            var shape = new cp.BoxShape(body, spriteBloque.width, spriteBloque.height);
            this.space.addShape(shape);

            this.arrayBloques.push(spriteBloque);
        }
     }


});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        cc.director.resume();
        //cc.audioEngine.playMusic(res.sonidobucle_wav, true);
        var layer = new GameLayer();
        this.addChild(layer);
    }
});

