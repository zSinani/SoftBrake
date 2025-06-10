class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // Variables and settings
        this.ACCELERATION = 600;
        this.DRAG = 1700;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -420;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 3;
        this.maxSpeed = 250;

        this.minVis = 0.6;
        this.maxVis = 1.1;
        this.onGround = false;
        
        
        this.startTime = 0;
        this.score = 0;
        this.batteries = 0;
        this.coinCount = 0;
        this.deathCount = 0;
    }

    create() { 
        this.startTime = this.time.now;
        this.bgSound = this.sound.add('bg', {
            loop: true,
            volume: 0.7,
            rate: 0.5
        });
        this.bgSound.play();
        const bgDelay = Phaser.Math.Between(3000, 7000);
        this.time.delayedCall(bgDelay, () => {
            this.bgSound.play();
        });

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1");

        // Add a tileset to the map
        const kennyTiles = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        const pixelTiles = this.map.addTilesetImage("pixel_packed", "pixel_tiles");
        // Create layers
        this.groundLayer = this.map.createLayer("Ground", [kennyTiles, pixelTiles], 0, 0);
        this.waterLayer = this.map.createLayer("Water", [kennyTiles, pixelTiles], 0, 0);
        // Set physics world bounds to match the map
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        // Make layers collidable
        this.groundLayer.setCollisionByProperty({ collides: true });
        this.waterLayer.setCollisionByProperty({ water: true });

        // Create Objects
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });
        this.checkp = this.map.createFromObjects("Objects", {
            name: "check",
            key: "tilemap_sheet",
            frame: 111
        });
        this.spikes = this.map.createFromObjects("Objects", [
            { name: "spike", key: "tilemap_sheet", frame: 68 },
            { name: "spikeS", key: "tilemap_sheet", frame: 68 },
            { name: "spikeE", key: "tilemap_sheet", frame: 68 },
            { name: "spikeW", key: "tilemap_sheet", frame: 68 }
        ]);
        this.battery = this.map.createFromObjects("Objects", {
            name: "battery", key: "battery"
        });
        this.goals = this.map.createFromObjects("Objects", {
            name: "goal",
            key: "tilemap_sheet",
            frame: 67
        });

        // Convert to static arcade physics bodies
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.checkp, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.battery, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.goals, Phaser.Physics.Arcade.STATIC_BODY);
        // Create groups for collision detection
        this.coinGroup = this.add.group(this.coins);
        this.checkGroup = this.add.group(this.checkp);
        this.spikeGroup = this.add.group(this.spikes);
        this.batteryGroup = this.add.group(this.battery);
        this.goalGroup = this.add.group(this.goals);

        // Set custom hitboxes
        this.spikes.forEach(spike => {
            if (spike.name === "spikeS") {
                spike.body.setSize(18, 9);
                spike.body.setOffset(0, 0);
            } else if (spike.name === "spikeE") {
                spike.body.setSize(9, 18);
                spike.body.setOffset(0, 0);
            } else if (spike.name === "spikeW") {
                spike.body.setSize(9, 18);
                spike.body.setOffset(9, 0);
            } else{
                spike.body.setSize(18, 9);
                spike.body.setOffset(0, 9);
            }
        });
        this.battery.forEach( battery => {
            battery.setScale( 0.02);
            battery.y = battery.y - 1;
        });
        // Tweens for animating objects
        this.tweens.add({
            targets: this.battery,
            y: '+=2',
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        this.coins.forEach(coin => {
            coin.anims.play('spin');
        });
        this.checkp.forEach(checkp => {
            checkp.anims.play('flap');
        });

        // Set up player avatar = SPAWN (72, 360)
        my.sprite.player = this.physics.add.sprite(72, 360, "platformer_characters", "tile_0023.png");
        my.sprite.player.setSize(24,20).setOffset(0,4);
        my.sprite.player.setCollideWorldBounds(true);

        // TERRAIN COLLISION
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.waterLayer, () => {
            this.sound.play('hurt');
            this.death = true;
        });

        // COIN COLLISION
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.score += 50;
            this.coinCount += 1;
            this.sound.play('coin', { volume: 0.3 });
        });
        
        // CHECKPOINT COLLISION
        this.lastCheckpoint = new Phaser.Math.Vector2(my.sprite.player.x, my.sprite.player.y);
        this.physics.add.overlap(my.sprite.player, this.checkGroup, (obj1, obj2) => {
            if ( this.lastCheckpoint.x != obj2.x && this.lastCheckpoint.y != obj2.y ){
                this.sound.play('checkp', { volume: 0.4 });
            }
            this.lastCheckpoint.set(obj2.x, obj2.y);
        });

        // GOAL COLLISION
        this.physics.add.overlap(my.sprite.player, this.goalGroup, (obj1, obj2) => {
            let timeTaken = ((this.time.now - this.startTime) / 1000).toFixed(2);
            this.scene.start('WinScene', {
                time: timeTaken,
                points: this.score,
                batteries: this.batteries,
                coins: this.coinCount,
                deaths: this.deathCount
            });
        });

        // SPIKE COLLISION
        this.physics.add.overlap(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            this.sound.play('hurt');
            this.death = true;
        });
        this.physics.add.overlap(my.sprite.player, this.batteryGroup, (obj1, obj2) => {
            obj2.destroy();
            this.score += 1250;
            this.sound.play('battery', { volume: 0.3 });
            this.minVis += 0.2;
            this.maxVis += 0.25;
            this.spotlight.setScale(this.maxVis);
            this.batteries += 1;

        });

        // Set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Debug key listener (assigned to F key)
        this.input.keyboard.on('keydown-F', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            if (!this.physics.world.debugGraphic) {
                this.physics.world.createDebugGraphic();
            }
            this.physics.world.debugGraphic.clear();
        }, this);

        // Movement visual effects
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: 'circle_05.png',
            quantity: 2,
            frequency: 25,
            scale: { start: 0.02, end: 0.05 },
            maxAliveParticles: 15,
            lifespan: { min: 200, max: 300 },
            gravityY: -250,
            alpha: { start: 0.4, end: 0.2 },
        });
        my.vfx.walking.stop();

        // Jump particle emitter setup
        my.vfx.jump = this.add.particles(0, 0, 'kenny-particles', {
            frame: 'dirt_02.png',
            lifespan: 300,
            alpha: { start: .5, end: 0 },
            scale: { start: 0.08, end: 0.01 },
            gravityY: 600,
            quantity: 5
        });
        my.vfx.jump.stop(); // don't emit constantly


        // Camera setup
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.1, 0.1, 0, 41);
        this.cameras.main.setDeadzone(50, 25);
        this.cameras.main.setZoom(this.SCALE);

        // ===== VISION SYSTEM =====
        this.spotlight = this.add.image(0, 0, 'spotlight');
        this.spotlight.setOrigin(0.5);
        this.spotlight.setDepth(900);
        this.spotlight.setScale(this.maxVis);
        
        // UI ELEMENTS
        this.scoreText = this.add.text(480, 300, 'Score: 0', {
            fontSize: '10px',
            fill: '#ffffff',
            padding: {x: 8, y: 4},
            resolution: 3,
            fontFamily: 'Minecraftia',
        }).setScrollFactor(0).setDepth(999).setOrigin(0);

        this.deathText = this.add.text(480, 320, 'Deaths: 0', {
            fontSize: '10px',
            fill: '#ffffff',
            padding: {x: 8, y: 4},
            resolution: 3,
            fontFamily: 'Minecraftia'
        }).setScrollFactor(0).setDepth(999);

        this.timerText = this.add.text(720, 300, "0.00", {
            fontSize: '20px',
            color: '#ffffff',
            padding: {x: 8, y: 4 },
            resolution: 3,
            fontFamily: 'Minecraftia'
        }).setScrollFactor(0).setDepth(999).setOrigin(0.5, 0);

        this.batteryIcon = this.add.image(487, 340, 'battery')
            .setOrigin(0)
            .setScale(0.025)
            .setScrollFactor(0)
            .setDepth(999);
        this.batteryText = this.add.text(510, 345, "x0", {
            fontSize: '10px',
            color: '#ffffff',
            padding: {x: 8, y: 4 },
            resolution: 3,
            fontFamily: 'Minecraftia'
        }).setScrollFactor(0).setDepth(999).setOrigin(0.5, 0);

    }

    update() {
        // UI Updates
        this.scoreText.setText('Score: ' + this.score);
        this.batteryText.setText('x' + this.batteries);

        let elapsed = (this.time.now - this.startTime) / 1000;
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const formatted = 
            String(minutes).padStart(2, '0') + ":" + 
            seconds.toFixed(2).padStart(5, '0'); // 5 = "12.34"

        this.timerText.setText(formatted);
        this.deathText.setText('Deaths: ' + this.deathCount);


        // Handle Death-Case
        if (this.death) {
            my.sprite.player.setAlpha(0.5);
            my.sprite.player.body.enable = false;
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setVelocity(0, 0);
            my.sprite.player.anims.stop();
            my.vfx.walking.stop();
            this.cameras.main.shake(20, 0.0002);

            if (!this.respawnTimer) {
                this.respawnTimer = this.time.delayedCall(500, () => {
                    my.sprite.player.setPosition(this.lastCheckpoint.x, this.lastCheckpoint.y);
                    my.sprite.player.setAlpha(1);
                    my.sprite.player.body.enable = true;
                    this.deathCount += 1;
                    this.score -= 10;
                    this.death = false;
                    this.respawnTimer = null;
                });
            }
            return; // Freeze controls and movement
        }

        

        // Update spotlight
        this.spotlight.setPosition(
            my.sprite.player.x,
            my.sprite.player.y
        );
        if (Math.abs(my.sprite.player.body.velocity.x) > 0.1 || Math.abs(my.sprite.player.body.velocity.y) > 0.1) {
            const shrinkSpeed = 0.003;
            if (this.spotlight.scale > this.minVis) {
                this.spotlight.setScale(this.spotlight.scale - shrinkSpeed);
                this.spotlightTimer = null;
            }
        } else {
            const growSpeed = 0.002;
            this.spotlightTimer = 2501;
            if (this.spotlight.scale < this.maxVis && this.spotlightTimer > 2500) {
                this.spotlight.setScale(this.spotlight.scale + growSpeed);
            }
        }

        // Player horizontal movement
        const emitParticle = (Math.abs(my.sprite.player.body.velocity.x) > 150) && my.sprite.player.body.blocked.down;
        if (cursors.left.isDown || this.aKey.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

        } else if (cursors.right.isDown || this.dKey.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        // Emit walking particles based on movement direction
        if (emitParticle) {
            const particleSpeed = my.sprite.player.flipX ? -this.PARTICLE_VELOCITY : this.PARTICLE_VELOCITY;
            my.vfx.walking.setParticleSpeed(particleSpeed, 0);
            if (!my.vfx.walking.on) {
                my.vfx.walking.start();
            }
        } else {
            my.vfx.walking.stop();
        }

        // Jump animation
        if (!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        // Jump logic
        if ((Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) && my.sprite.player.body.blocked.down) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.sound.play('jump', { volume: 0.3, rate: 1.5 });
            my.vfx.jump.setPosition(my.sprite.player.x, my.sprite.player.y + my.sprite.player.displayHeight / 2);
            my.vfx.jump.explode();
        }
        // Reset jump count on landing
        if (my.sprite.player.body.blocked.down) {
            if (!this.onGround ){
                this.sound.play('land', { volume: .2, rate: 2, detune: -800 });
            };
        }
        this.onGround = my.sprite.player.body.blocked.down;

        // Limit maximum horizontal speed
        my.sprite.player.setMaxVelocity(this.maxSpeed, -this.JUMP_VELOCITY+this.maxSpeed); // x and y limits
    }

}
