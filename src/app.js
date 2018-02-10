var tipoNave = 2;
var tipoMuerte = 3;

var GameLayer = cc.Layer.extend({
    space:null,
    spritePelota:null,
    arrayAsteroides:[],
    spriteFondo: null,
    dificultad:null,
    ctor:function () {
        this._super();
        var size = cc.winSize;

        // Dificultad inicial (velocidad de los asteroides)
        this.dificultad = 20;

        // Espacio
        this.space = new cp.Space();

        // Depuración
        this.depuracion = new cc.PhysicsDebugNode(this.space);
        this.addChild(this.depuracion, 10);

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
            // Colisiones de la nave
            shape.setCollisionType(tipoNave);

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

        // Colisiones de los muros
        muroIzquierda.setCollisionType(tipoMuerte);
        muroDerecha.setCollisionType(tipoMuerte);
        muroArriba.setCollisionType(tipoMuerte);
        muroAbajo.setCollisionType(tipoMuerte);

        this.inicializarAsteroides();
        
        // Evento MOUSE
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: this.procesarMouseDown
        }, this);

        // Escuchar colisiones
        this.space.addCollisionHandler(tipoNave, tipoMuerte, null, null, this.collisionNaveConMuerte.bind(this), null);

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
        this.moverAsteroides();

        if (this.dificultad <= 100){
            this.dificultad += 0.001;
        }

        console.log(this.dificultad);
        
    }, inicializarAsteroides:function () {

        for( i=0; i < 4; i++){
            var spriteAsteroide = new cc.PhysicsSprite(res.asteroid_png);
            var scaleFactor = Math.random();
            spriteAsteroide.setScale(scaleFactor, scaleFactor);
            this.addChild(spriteAsteroide);

            // Body dinámico
            var body = new cp.Body(1, cp.momentForCircle(1, 0, spriteAsteroide.width/2, cp.vzero));
            //body.p = cc.p(cc.winSize.width*0.7 , cc.winSize.height*0.4 + 10 + 20 + 40 * i);
            body.p = cc.p(cc.winSize.width*0.7 , cc.winSize.height*0.4 + 50 * i);
            spriteAsteroide.setBody(body);
            this.space.addBody(body);

            // Shape estática
            var shape = new cp.CircleShape(body, spriteAsteroide.width*(scaleFactor/3.5), cp.vzero);
            this.space.addShape(shape);
            shape.setCollisionType(tipoMuerte);
            // Agregamos el Sprite al array
            this.arrayAsteroides.push(spriteAsteroide);
        }

    }, collisionNaveConMuerte:function(arbiter, space) {
        var shapes = arbiter.getShapes();
        cc.audioEngine.stopMusic();
        cc.director.pause();
        this.addChild(new GameOverLayer);
    }, moverAsteroides:function(){
        for( i=0; i<4; i++){
            var randomNumber1 = Math.floor(Math.random()*2*this.dificultad) - (this.dificultad);
            var randomNumber2 = Math.floor(Math.random()*2*this.dificultad) - (this.dificultad);
            this.arrayAsteroides[i].body.applyImpulse(cp.v( randomNumber1, randomNumber2), cp.v(0,0));
            // Girar asteroides aleatoriamente
            this.arrayAsteroides[i].rotation += Math.random()*2;
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

