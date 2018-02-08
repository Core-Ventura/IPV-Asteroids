
var GameLayer = cc.Layer.extend({
    space:null,
    spritePelota:null,
    arrayAsteroides:[],
    spriteFondo: null,
    time:null,
    dificultad:null,
    ctor:function () {
        this._super();
        var size = cc.winSize;

        cc.spriteFrameCache.addSpriteFrames(res.animacion_bola_plist);
        cc.spriteFrameCache.addSpriteFrames(res.barra_3_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacioncocodrilo_plist);

        this.dificultad = 20;

        // Espacio
        this.space = new cp.Space();

        // Depuración
        //this.depuracion = new cc.PhysicsDebugNode(this.space);
        //this.addChild(this.depuracion, 10);

        // Fondo
        this.spriteFondo = cc.Sprite.create(res.space_jpg);
        this.spriteFondo.setPosition(cc.p(size.width/2, size.height/2));
        this.spriteFondo.setScale(size.width / this.spriteFondo.width);
        this.addChild(this.spriteFondo);

        // Nave espacial
        this.spritePelota = new cc.PhysicsSprite(res.spaceship_png);
        var spriteScale = 0.2;
        this.spritePelota.setScale(spriteScale,spriteScale); 
            // Body - Cuerpo
            var body = new cp.Body(1, cp.momentForCircle(1, 0, this.spritePelota.width/2, cp.vzero));
            body.p = cc.p(size.width*0.1 ,size.height*0.5);
            this.spritePelota.setBody(body);
            this.space.addBody(body);
            // Shape - forma
            var shape = new cp.CircleShape(body, this.spritePelota.width*0.15, cp.vzero);
            this.space.addShape(shape);
            this.addChild(this.spritePelota);

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
        this.inicializarAsteroides();

        // Evento MOUSE
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: this.procesarMouseDown
        }, this);

        this.scheduleUpdate();
        return true;

    },procesarMouseDown:function(event) {
        // Ámbito procesarMouseDown
        var instancia = event.getCurrentTarget();

        var body = instancia.spritePelota.body;
        body.applyImpulse(cp.v( event.getLocationX() - body.p.x, event.getLocationY() - body.p.y), cp.v(0,0));

        // Girar nave hacia la posición del click del ratón
        // Referencia utilizada:
        // http://www.gamefromscratch.com/post/2012/11/18/GameDev-math-recipes-Rotating-to-face-a-point.aspx

        var angle = Math.atan2(event.getLocationY() - instancia.spritePelota.y, event.getLocationX() - instancia.spritePelota.x );
        angle = angle * (180/Math.PI); // Para pasar de radianes a grados
        if(angle < 0) {
            angle = 360 - (-angle);
        }
        instancia.spritePelota.rotation =90 - angle;

     },update:function (dt) {
        this.space.step(dt);
        
        for( i=0; i<4; i++){
            var randomNumber1 = Math.floor(Math.random()*2*this.dificultad) - (this.dificultad);
            var randomNumber2 = Math.floor(Math.random()*2*this.dificultad) - (this.dificultad);
            var abody = this.arrayAsteroides[i].body.applyImpulse(cp.v( randomNumber1, randomNumber2), cp.v(0,0));
            // Girar asteroides aleatoriamente
            this.arrayAsteroides[i].rotation += Math.random()*2;
        }

        if (this.dificultad <= 100){
            this.dificultad += 0.001;
        }
        console.log(this.dificultad);

     },inicializarPlataformas: function(){
        // Sprite
        var spritePlataforma = new cc.PhysicsSprite("#barra_3.png");
        this.addChild(spritePlataforma);

        // Body static
        var body = new cp.StaticBody();
        body.p = cc.p(cc.winSize.width*0.7 , cc.winSize.height*0.4);
        spritePlataforma.setBody(body);

        // Shape - static
        var shape = new cp.BoxShape(body, spritePlataforma.width, spritePlataforma.height);
        this.space.addStaticShape(shape);

     }, inicializarAsteroides:function () {

         for( i=0; i < 4; i++){
            var spriteAsteroide = new cc.PhysicsSprite(res.asteroid_png);
            var scaleFactor = Math.random();
            spriteAsteroide.setScale(scaleFactor, scaleFactor);
            this.addChild(spriteAsteroide);

            // BODY dinamico
            var body = new cp.Body(1, cp.momentForCircle(1, 0, spriteAsteroide.width/2, cp.vzero));
            body.p = cc.p(cc.winSize.width*0.7 , cc.winSize.height*0.4 + 10 + 20 + 40 * i);
            spriteAsteroide.setBody(body);
            this.space.addBody(body);

            // SHAPE estatica
            var shape = new cp.CircleShape(body, spriteAsteroide.width*(scaleFactor/3), cp.vzero);
            this.space.addShape(shape);
            this.arrayAsteroides.push(spriteAsteroide);
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

