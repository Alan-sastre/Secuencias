
export default class PuzzleSolarScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PuzzleSolarScene' });
    this.sequence = ['water', 'sun', 'water'];
    this.playerSequence = [];
    this.plantParts = {};
    this.isCompleting = false;
    this.actionTargets = {
      water: { x: 280, y: 115 },
      sun: { x: 720, y: 115 },
    };
  }

  create() {
    this.playerSequence = [];
    this.isCompleting = false;
    this.drawEnvironment();
    this.createActionButtons();
    this.createPlant();
    this.hand = this.add.text(0, 0, '👆🏻', { fontSize: '60px' }).setOrigin(0.5).setDepth(20);
    this.updateHelp();
  }

  drawEnvironment() {
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x8fd0ff, 0x8fd0ff, 0xe6f7ff, 0xe6f7ff, 1);
    sky.fillRect(0, 0, 1000, 500);

    const ground = this.add.graphics();
    ground.fillGradientStyle(0x4b8b3b, 0x4b8b3b, 0x2f6626, 0x2f6626, 1);
    ground.fillRect(0, 340, 1000, 160);

    for (let i = 0; i < 120; i += 1) {
      const x = Phaser.Math.Between(0, 1000);
      const y = Phaser.Math.Between(345, 495);
      const dot = this.add.graphics();
      const color = Phaser.Math.Between(0, 1) ? 0x3d7a30 : 0x2f5f26;
      dot.fillStyle(color, 0.35);
      dot.fillCircle(x, y, Phaser.Math.Between(1, 3));
    }

    const pot = this.add.graphics();
    pot.fillGradientStyle(0xb36a3d, 0x8f4f2b, 0x6e3820, 0x5d2f1b, 1);
    pot.fillRoundedRect(390, 365, 220, 130, 26);
    pot.fillGradientStyle(0xd48a56, 0xc27849, 0x8f4f2b, 0x7d4024, 1);
    pot.fillRoundedRect(370, 345, 260, 30, 16);
    pot.lineStyle(3, 0x4a2413, 0.5);
    pot.strokeRoundedRect(390, 365, 220, 130, 26);

    const soil = this.add.graphics();
    soil.fillGradientStyle(0x4a2d1b, 0x412717, 0x2a170d, 0x2a170d, 1);
    soil.fillEllipse(500, 366, 208, 26);
  }

  createActionButtons() {
    this.createWaterButton(this.actionTargets.water.x, this.actionTargets.water.y);
    this.createSunButton(this.actionTargets.sun.x, this.actionTargets.sun.y);

    const waterHit = this.add.zone(this.actionTargets.water.x, this.actionTargets.water.y, 170, 170).setDepth(30);
    const sunHit = this.add.zone(this.actionTargets.sun.x, this.actionTargets.sun.y, 170, 170).setDepth(30);
    waterHit.setInteractive({ useHandCursor: true });
    sunHit.setInteractive({ useHandCursor: true });
    waterHit.on('pointerdown', () => this.handleAction('water'));
    sunHit.on('pointerdown', () => this.handleAction('sun'));
  }

  createWaterButton(x, y) {
    const container = this.add.container(x, y).setSize(110, 110).setDepth(12);
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.18);
    g.fillCircle(0, 0, 55);
    g.fillStyle(0x3aa0ff, 0.85);
    g.fillCircle(0, 0, 44);
    g.fillStyle(0x7ec7ff, 0.8);
    g.fillCircle(-10, -14, 16);
    const emoji = this.add.text(0, 0, "💧", { fontSize: "48px" }).setOrigin(0.5);
    container.add(g);
    container.add(emoji);
    return container;
  }

  createSunButton(x, y) {
    const container = this.add.container(x, y).setSize(110, 110).setDepth(12);
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.12);
    g.fillCircle(0, 0, 55);
    for (let i = 0; i < 12; i += 1) {
      const a = (Math.PI * 2 * i) / 12;
      const x1 = Math.cos(a) * 44;
      const y1 = Math.sin(a) * 44;
      const x2 = Math.cos(a) * 58;
      const y2 = Math.sin(a) * 58;
      g.lineStyle(4, 0xffd04a, 0.95);
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.strokePath();
    }
    g.fillStyle(0xffc737, 1);
    g.fillCircle(0, 0, 34);
    g.fillStyle(0xffe083, 0.9);
    g.fillCircle(-10, -10, 11);
    container.add(g);
    return container;
  }

  createPlant() {
    this.plantParts.stem = this.add.graphics({ x: 500, y: 365, alpha: 0, scaleY: 0 }).setDepth(8);
    this.plantParts.stem.fillStyle(0x2d7a2e, 1);
    this.plantParts.stem.fillRoundedRect(-8, -165, 16, 165, 8);
    this.plantParts.stem.fillStyle(0x58ab4d, 0.5);
    this.plantParts.stem.fillRoundedRect(-4, -165, 6, 165, 4);

    this.plantParts.leafLeft = this.add.graphics({ x: 500, y: 285, alpha: 0, scale: 0.3 }).setDepth(9);
    this.drawLeaf(this.plantParts.leafLeft, -1);
    this.plantParts.leafRight = this.add.graphics({ x: 500, y: 245, alpha: 0, scale: 0.3 }).setDepth(9);
    this.drawLeaf(this.plantParts.leafRight, 1);

    this.plantParts.flower = this.add.graphics({ x: 500, y: 190, alpha: 0, scale: 0.2 }).setDepth(10);
    this.drawFlower(this.plantParts.flower);
    this.resetPlant(true);
  }

  drawLeaf(g, dir) {
    const points = [
      new Phaser.Geom.Point(0, 0),
      new Phaser.Geom.Point(34 * dir, -14),
      new Phaser.Geom.Point(56 * dir, -2),
      new Phaser.Geom.Point(34 * dir, 18),
    ];
    g.fillStyle(0x2f8e37, 1);
    g.fillPoints(points, true);
    g.fillStyle(0x6fd36e, 0.45);
    g.fillEllipse(26 * dir, 2, 24, 10);
  }

  drawFlower(g) {
    for (let i = 0; i < 8; i += 1) {
      const a = (Math.PI * 2 * i) / 8;
      g.fillStyle(0xe44f64, 0.95);
      g.fillEllipse(Math.cos(a) * 20, Math.sin(a) * 20, 30, 18);
      g.fillStyle(0xf58fa3, 0.45);
      g.fillEllipse(Math.cos(a) * 18, Math.sin(a) * 18, 14, 8);
    }
    g.fillStyle(0xf6cf3b, 1);
    g.fillCircle(0, 0, 13);
    g.fillStyle(0xffea9d, 0.85);
    g.fillCircle(-3, -3, 4);
  }

  handleAction(action) {
    if (this.isCompleting) {
      return;
    }
    this.playerSequence.push(action);
    const valid = this.playerSequence.every((value, index) => value === this.sequence[index]);

    if (!valid) {
      this.playerSequence = [];
      this.resetPlant();
      this.cameras.main.shake(160, 0.008);
      this.updateHelp();
      return;
    }

    this.revealStage(this.playerSequence.length);
    if (this.playerSequence.length === this.sequence.length) {
      this.isCompleting = true;
      this.showConfetti();
      this.time.delayedCall(1200, () => this.scene.start('Puzzle2Scene'));
      return;
    }
    this.updateHelp();
  }

  revealStage(stage) {
    if (stage === 1) {
      this.tweens.add({ targets: this.plantParts.stem, alpha: 1, scaleY: 1, duration: 450, ease: 'Sine.Out' });
    }
    if (stage === 2) {
      this.tweens.add({ targets: this.plantParts.leafLeft, alpha: 1, scale: 1, duration: 350, ease: 'Back.Out' });
      this.tweens.add({ targets: this.plantParts.leafRight, alpha: 1, scale: 1, duration: 350, ease: 'Back.Out' });
    }
    if (stage === 3) {
      this.tweens.add({ targets: this.plantParts.flower, alpha: 1, scale: 1, duration: 700, ease: 'Elastic.Out' });
    }
  }

  resetPlant(immediate = false) {
    if (immediate) {
      this.plantParts.stem.setAlpha(0).setScale(1, 0);
      this.plantParts.leafLeft.setAlpha(0).setScale(0.3);
      this.plantParts.leafRight.setAlpha(0).setScale(0.3);
      this.plantParts.flower.setAlpha(0).setScale(0.2);
      return;
    }
    this.tweens.add({ targets: this.plantParts.stem, alpha: 0, scaleY: 0, duration: 180 });
    this.tweens.add({ targets: this.plantParts.leafLeft, alpha: 0, scale: 0.3, duration: 180 });
    this.tweens.add({ targets: this.plantParts.leafRight, alpha: 0, scale: 0.3, duration: 180 });
    this.tweens.add({ targets: this.plantParts.flower, alpha: 0, scale: 0.2, duration: 180 });
  }

  showConfetti() {
    const colors = [0xff5d73, 0xffcf5a, 0x6de08a, 0x6fcfff, 0xb185ff];
    for (let i = 0; i < 120; i += 1) {
      const piece = this.add.rectangle(
        Phaser.Math.Between(60, 940),
        Phaser.Math.Between(-140, -20),
        Phaser.Math.Between(6, 12),
        Phaser.Math.Between(8, 16),
        colors[Phaser.Math.Between(0, colors.length - 1)],
      );
      piece.setDepth(40);
      this.tweens.add({
        targets: piece,
        x: piece.x + Phaser.Math.Between(-130, 130),
        y: Phaser.Math.Between(420, 560),
        angle: Phaser.Math.Between(-360, 360),
        duration: Phaser.Math.Between(900, 1400),
        ease: 'Cubic.In',
        onComplete: () => piece.destroy(),
      });
    }
  }

  updateHelp() {
    if (this.isCompleting) {
      this.hand.setVisible(false);
      return;
    }
    const nextAction = this.sequence[this.playerSequence.length] || this.sequence[0];
    const target = this.actionTargets[nextAction];
    this.hand.setPosition(target.x, target.y + 88).setVisible(true);
  }
}
