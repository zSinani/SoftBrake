class WinScene extends Phaser.Scene {
    constructor() {
        super("WinScene");
    }

    init(data) {
        this.finalTime = data.time;
        this.finalBatteries = data.batteries;
        this.finalScore = data.points;
        this.finalCoins = data.coins;
        this.finalDeaths = data.deaths;
        
    }

    create() {
        this.add.text(720, 150, "Congrats !!!", {
            fontSize: '60px',
            color: '#ffff88',
            strokeThickness: 10,
            stroke: '#A65C00',
            fontFamily: 'Minecraftia'
        }).setOrigin(0.5);

        this.add.text(720, 270, `Time: ${this.finalTime} seconds`, {
            fontSize: '40px',
            color: '#ffff88',
            fontFamily: 'Minecraftia'
        }).setOrigin(0.5);
        
        this.add.text(720, 340, `Score: ${this.finalScore} points`, {
            fontSize: '40px',
            color: '#ffff88',
            fontFamily: 'Minecraftia'
        }).setOrigin(0.5);

        this.add.text(720, 400, `Batteries: ${this.finalBatteries}`, {
            fontSize: '30px',
            color: '#BFEFFF',
            fontFamily: 'Minecraftia'
        }).setOrigin(0.5);

        this.add.text(720, 440, `Coins: ${this.finalCoins}`, {
            fontSize: '30px',
            color: '#BFEFFF',
            fontFamily: 'Minecraftia'
        }).setOrigin(0.5);
        this.add.text(720, 480, `Deaths: ${this.finalDeaths}`, {
            fontSize: '30px',
            color: '#FF7F7F',
            fontFamily: 'Minecraftia'
        }).setOrigin(0.5);

        this.add.text(720, 580, 'Press R to Restart', {
            fontSize: '40px',
            color: '#ffffff',
            fontFamily: 'Minecraftia'
        }).setOrigin(0.5);

        // Restart the game on R
        this.input.keyboard.once('keydown-R', () => {
            this.sound.stopAll();
            this.scene.start('platformerScene');
        });
    }
}
