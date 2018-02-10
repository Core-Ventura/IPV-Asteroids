var tipoNave = 2;
var tipoMuerte = 3;

var GameLayer = cc.Layer.extend({
    space:null,
    spriteNave:null,
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
        //this.depuracion = new cc.PhysicsDebugNode(this.space);
        //this.addChild(this.depuracion, 10);

        // Fondo
        this.spriteFondo = cc.Sprite.create(res.space_jpg);
        this.spriteFondo.setPosition(cc.p(size.width/2, size.height/2));
        this.spriteFondo.setScale(size.width / this.spriteFondo.width);
        this.addChild(this.spriteFondo);

        // Nave espacial
        this.spriteNave = new cc.PhysicsSprite(res.spaceship_png);
        var spriteScale = 0.2;
        this.spriteNave.setScale(spriteScale,spriteScale); 

        // Body de la nave
        var body = new cp.Body(1, cp.momentForCircle(1, 0, this.spriteNave.width/2, cp.vzero));
        body.p = cc.p(size.width*0.5 ,size.height*0.5);
        this.spriteNave.setBody(body);
        this.space.addBody(body);

        // Shape de la nave
        var shape = new cp.CircleShape(body, this.spriteNave.width*0.15, cp.vzero);
        this.space.addShape(shape);
        this.addChild(this.spriteNave);
        
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

        // Inicialización de los asteroides
        this.inicializarAsteroides();
        
        // Evento del mouse
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
        var body = instancia.spriteNave.body;
        body.applyImpulse(cp.v( event.getLocationX() - body.p.x, event.getLocationY() - body.p.y), cp.v(0,0));

        // Girar nave hacia la posición del click del ratón
        // Referencia utilizada:
        // http://www.gamefromscratch.com/post/2012/11/18/GameDev-math-recipes-Rotating-to-face-a-point.aspx
        var angle = Math.atan2(event.getLocationY() - instancia.spriteNave.y, event.getLocationX() - instancia.spriteNave.x );
        angle = angle * (180/Math.PI); // Para pasar de radianes a grados
        if(angle < 0) {
            angle = 360 - (-angle);
        }
        instancia.spriteNave.rotation =90 - angle;

    },update:function (dt) {
        this.space.step(dt);

        //Movemos los asteroides
        this.moverAsteroides();

        // Incrementamos la dificultad (velocidad de los asteroides) en el tiempo hasta un límite de 100
        if (this.dificultad <= 100){
            this.dificultad += 0.001; // Valor muy pequeño, ya que incrementaremos en cada llamada del update
        }

        // Depuración
        //console.log(this.dificultad);

    }, inicializarAsteroides:function () {

        // Creamos un array que contenga las posiciones iniciales de los asteroides
        // En este caso se colocarán en las esquinas de la pantalla
        var posA1 = cc.p(cc.winSize.width*0.1, cc.winSize.height*0.1);
        var posA2 = cc.p(cc.winSize.width*0.1, cc.winSize.height*0.9);
        var posA3 = cc.p(cc.winSize.width*0.9, cc.winSize.height*0.1);
        var posA4 = cc.p(cc.winSize.width*0.9, cc.winSize.height*0.9);
        var arrayPos = [posA1, posA2, posA3, posA4];

        for( i=0; i < 4; i++){
            var spriteAsteroide = new cc.PhysicsSprite(res.asteroid_png);

            // Asignamos un factor de escalado aleatorio (entre 0 y 1) para el tamaño de los asteroides
            var scaleFactor = Math.random();
            // y nos aseguramos un escalado mínimo de 0.3 para evitar asteroides demasiado pequeños
            if (scaleFactor <= 0.3) {
                scaleFactor = 0.3;
            }

            spriteAsteroide.setScale(scaleFactor, scaleFactor);
            this.addChild(spriteAsteroide);

            // Body dinámico del asteroide
            var body = new cp.Body(1, cp.momentForCircle(1, 0, spriteAsteroide.width/2, cp.vzero));
            body.p = arrayPos[i]; 
            spriteAsteroide.setBody(body);
            this.space.addBody(body);

            // Shape estática del asteroide
            var shape = new cp.CircleShape(body, spriteAsteroide.width*(scaleFactor/3.5), cp.vzero);
            this.space.addShape(shape);

            // Tipo de colisión
            shape.setCollisionType(tipoMuerte);

            // Agregamos el Sprite al array
            this.arrayAsteroides.push(spriteAsteroide);
        }

    }, collisionNaveConMuerte:function(arbiter, space) {
        var shapes = arbiter.getShapes();
        cc.audioEngine.stopMusic();
        cc.director.pause();
        cc.audioEngine.playEffect(res.grunt_wav);
        this.addChild(new GameOverLayer);

    }, moverAsteroides:function(){
        for( i=0; i<4; i++){
            var randomNumber1 = Math.floor(Math.random()*2*this.dificultad) - (this.dificultad);
            var randomNumber2 = Math.floor(Math.random()*2*this.dificultad) - (this.dificultad);
            this.arrayAsteroides[i].body.applyImpulse(cp.v( randomNumber1, randomNumber2), cp.v(0,0));

            // Giramos los asteroides aleatoriamente
            this.arrayAsteroides[i].rotation += Math.random()*2;
        }
    }
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        cc.director.resume();
        cc.audioEngine.playMusic(res.sonidobucle_wav, true);
        var layer = new GameLayer();
        this.addChild(layer);
    }
});

