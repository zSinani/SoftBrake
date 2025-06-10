class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        //this.sound.mute = true;
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");
        this.load.image("pixel_tiles", "pixel_packed.png"); 
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj", "platformer-level-1.tmx");

        this.load.image('spotlight', 'spotlight.png');
        this.load.image("battery", "batteryAsset.png");
        this.load.image("soundOn", "soundOn.png");
        this.load.image("soundOff", "soundOff.png");

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("pixel_sheet", "pixel_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.audio('jump', 'sound/jump.mp3');
        this.load.audio('hurt', 'sound/hurt.mp3');
        this.load.audio('coin', 'sound/coin.mp3'); 
        this.load.audio('bg', 'sound/bg.mp3');
        this.load.audio('land', 'sound/land.mp3') 
        this.load.audio('battery', 'sound/battery.mp3');
        this.load.audio('checkp', 'sound/checkp.mp3');

        // Multiatlas
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
        // Load Font
        const preloadFont = document.createElement('span');
        preloadFont.textContent = '.';
        preloadFont.style.fontFamily = 'Minecraftia';
        preloadFont.style.visibility = 'hidden';
        document.body.appendChild(preloadFont);

    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_002",
                start: 1,
                end: 2,
                suffix: ".png",
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0021.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0023.png" }
            ],
        });

        // Coin anim
        this.anims.create({
            key: 'spin',
            defaultTextureKey: "tilemap_sheet",
            frames:
            this.anims.generateFrameNumbers('tilemap_sheet', {
                start: 151,
                end: 152
            }),
            frameRate: 2,
            repeat: -1
        });

        // Flag anim
        this.anims.create({
            key: 'flap',
            defaultTextureKey: "tilemap_sheet",
            frames:
            this.anims.generateFrameNumbers('tilemap_sheet', {
                start: 111,
                end: 112
            }),
            frameRate: 3,
            repeat: -1
        });

        // Wait for font, then change scene
        document.fonts.ready.then(() => {
            this.scene.start('platformerScene');
        });
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}