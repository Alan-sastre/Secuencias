export default class Puzzle4Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Puzzle4Scene" });
    this.ranks = [1, 2, 3, 4];
    this.sizes = { 1: 22, 2: 32, 3: 44, 4: 56 };
    this.slots = [220, 380, 540, 700];
    this.currentStep = 0;
    this.pieces = [];
    this.hand = null;
    this.isCompleting = false;
    this.finalLayer = null;
    this.ambientItems = [];
  }

  create() {
    this.currentStep = 0;
    this.pieces = [];
    this.isCompleting = false;
    this.finalLayer = null;
    this.ambientItems = [];
    this.drawEnvironment();
    this.createBackgroundAnimations();
    this.drawSequenceTrack();
    this.createPieces();
    this.hand = this.add.text(0, 0, "👆🏻", { fontSize: "60px" }).setOrigin(0.5).setDepth(40);
    this.input.on("dragstart", (pointer, gameObject) => this.onDragStart(gameObject));
    this.input.on("drag", (pointer, gameObject, dragX, dragY) => this.onDrag(gameObject, dragX, dragY));
    this.input.on("dragend", (pointer, gameObject) => this.onDragEnd(gameObject));
    this.updateHelp();
  }

  drawEnvironment() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x90d7ff, 0x90d7ff, 0xe8f7ff, 0xe8f7ff, 1);
    bg.fillRect(0, 0, 1000, 500);
    const floor = this.add.graphics();
    floor.fillGradientStyle(0x6dbb67, 0x6dbb67, 0x3d8a38, 0x3d8a38, 1);
    floor.fillRect(0, 320, 1000, 180);
  }

  createBackgroundAnimations() {
    for (let i = 0; i < 4; i += 1) {
      const cloud = this.add.container(Phaser.Math.Between(-200, 1000), Phaser.Math.Between(48, 150)).setDepth(3);
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.75);
      g.fillCircle(-34, 0, 26);
      g.fillCircle(0, -14, 32);
      g.fillCircle(34, 0, 26);
      g.fillCircle(8, 8, 30);
      cloud.add(g);
      this.ambientItems.push(cloud);
      this.tweens.add({
        targets: cloud,
        x: 1180,
        duration: Phaser.Math.Between(22000, 32000),
        repeat: -1,
        onRepeat: () => {
          cloud.x = -220;
          cloud.y = Phaser.Math.Between(48, 150);
        },
      });
    }

    for (let i = 0; i < 18; i += 1) {
      const light = this.add.circle(
        Phaser.Math.Between(30, 970),
        Phaser.Math.Between(340, 490),
        Phaser.Math.Between(2, 4),
        Phaser.Math.Between(0, 1) ? 0xfff6b8 : 0xffd166,
        0.55,
      );
      light.setDepth(4);
      this.ambientItems.push(light);
      this.tweens.add({
        targets: light,
        y: light.y - Phaser.Math.Between(8, 20),
        alpha: { from: 0.2, to: 0.8 },
        yoyo: true,
        repeat: -1,
        duration: Phaser.Math.Between(1200, 2200),
        ease: "Sine.InOut",
      });
    }
  }

  drawSequenceTrack() {
    for (let i = 0; i < this.slots.length; i += 1) {
      const frame = this.add.graphics();
      frame.fillStyle(0xffffff, 0.18);
      frame.fillRoundedRect(this.slots[i] - 68, 104, 136, 136, 24);
      frame.lineStyle(3, 0xffffff, 0.35);
      frame.strokeRoundedRect(this.slots[i] - 68, 104, 136, 136, 24);
      const ghost = this.add.graphics();
      ghost.fillStyle(0xffffff, 0.15);
      ghost.fillCircle(this.slots[i], 172, this.sizes[i + 1]);
      ghost.lineStyle(3, 0xffffff, 0.4);
      ghost.strokeCircle(this.slots[i], 172, this.sizes[i + 1]);
      if (i < this.slots.length - 1) {
        const arrow = this.add.graphics();
        arrow.fillStyle(0xffffff, 0.6);
        arrow.fillTriangle(this.slots[i] + 75, 172, this.slots[i] + 96, 161, this.slots[i] + 96, 183);
      }
    }
  }

  createPieces() {
    const shuffled = Phaser.Utils.Array.Shuffle([...this.ranks]);
    const homes = [210, 390, 570, 750];
    for (let i = 0; i < shuffled.length; i += 1) {
      const rank = shuffled[i];
      const piece = this.createPiece(homes[i], 390, rank);
      this.pieces.push(piece);
    }
  }

  createPiece(x, y, rank) {
    const container = this.add.container(x, y).setSize(170, 170).setDepth(20);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(0, 50, 120, 20);
    g.fillStyle(0xffd166, 1);
    g.fillCircle(0, 0, this.sizes[rank]);
    g.fillStyle(0xffecb3, 0.9);
    g.fillCircle(-8, -10, Math.max(6, this.sizes[rank] * 0.24));
    g.lineStyle(3, 0xfff7de, 0.5);
    g.strokeCircle(0, 0, this.sizes[rank]);
    container.add(g);
    container.setData("rank", rank);
    container.setData("homeX", x);
    container.setData("homeY", y);
    container.setInteractive(new Phaser.Geom.Circle(0, 0, 85), Phaser.Geom.Circle.Contains);
    this.input.setDraggable(container);
    const tapZone = this.add.zone(x, y, 220, 220).setDepth(35);
    tapZone.setInteractive({ useHandCursor: true });
    tapZone.on("pointerdown", () => this.onTapPiece(container));
    container.setData("tapZone", tapZone);
    return container;
  }

  onTapPiece(piece) {
    if (this.isCompleting || !piece.input.enabled) {
      return;
    }
    this.pulsePiece(piece);
    if (piece.getData("rank") === this.currentStep + 1) {
      this.placePiece(piece);
      return;
    }
    this.cameras.main.shake(160, 0.008);
    this.updateHelp();
  }

  onDragStart(piece) {
    if (this.isCompleting || !piece.input.enabled) {
      return;
    }
    this.pulsePiece(piece);
  }

  onDrag(piece, dragX, dragY) {
    if (this.isCompleting || !piece.input.enabled) {
      return;
    }
    piece.x = dragX;
    piece.y = dragY;
  }

  onDragEnd(piece) {
    if (this.isCompleting || !piece.input.enabled) {
      return;
    }
    const targetX = this.slots[this.currentStep];
    const nearSlot = Phaser.Math.Distance.Between(piece.x, piece.y, targetX, 172) < 130;
    if (nearSlot && piece.getData("rank") === this.currentStep + 1) {
      this.placePiece(piece);
      return;
    }
    this.tweens.add({
      targets: piece,
      x: piece.getData("homeX"),
      y: piece.getData("homeY"),
      duration: 220,
      ease: "Sine.Out",
    });
    if (nearSlot) {
      this.cameras.main.shake(160, 0.008);
    }
    this.updateHelp();
  }

  placePiece(piece) {
    piece.x = this.slots[this.currentStep];
    piece.y = 172;
    piece.input.enabled = false;
    const zone = piece.getData("tapZone");
    if (zone) {
      zone.disableInteractive();
      zone.setVisible(false);
    }
    this.currentStep += 1;
    this.tweens.add({
      targets: piece,
      scaleX: 0.72,
      scaleY: 0.72,
      duration: 200,
      ease: "Sine.Out",
    });
    if (this.currentStep >= this.ranks.length) {
      this.isCompleting = true;
      this.hand.setVisible(false);
      this.showConfetti();
      this.time.delayedCall(700, () => this.showFinalCelebration());
      return;
    }
    this.updateHelp();
  }

  pulsePiece(piece) {
    this.tweens.add({
      targets: piece,
      scaleX: piece.scaleX * 1.05,
      scaleY: piece.scaleY * 0.95,
      yoyo: true,
      duration: 130,
      ease: "Sine.Out",
    });
  }

  updateHelp() {
    if (this.isCompleting) {
      this.hand.setVisible(false);
      return;
    }
    const targetRank = this.currentStep + 1;
    const targetPiece = this.pieces.find((p) => p.getData("rank") === targetRank && p.input && p.input.enabled);
    if (!targetPiece) {
      return;
    }
    this.hand.setPosition(targetPiece.x, targetPiece.y + 110).setVisible(true);
  }

  showConfetti() {
    const colors = [0xff5a7b, 0xffd166, 0x06d6a0, 0x5ac8fa, 0xb07dff];
    for (let i = 0; i < 130; i += 1) {
      const piece = this.add.rectangle(
        Phaser.Math.Between(80, 920),
        Phaser.Math.Between(-150, -20),
        Phaser.Math.Between(6, 12),
        Phaser.Math.Between(8, 16),
        colors[Phaser.Math.Between(0, colors.length - 1)],
      );
      piece.setDepth(45);
      this.tweens.add({
        targets: piece,
        x: piece.x + Phaser.Math.Between(-140, 140),
        y: Phaser.Math.Between(420, 560),
        angle: Phaser.Math.Between(-400, 400),
        duration: Phaser.Math.Between(900, 1500),
        ease: "Cubic.In",
        onComplete: () => piece.destroy(),
      });
    }
  }

  showFinalCelebration() {
    if (this.finalLayer) {
      return;
    }
    this.finalLayer = this.add.container(500, 250).setDepth(80);

    const panel = this.add.graphics();
    panel.fillStyle(0x0b3c5d, 0.72);
    panel.fillRoundedRect(-320, -160, 640, 320, 28);
    panel.lineStyle(4, 0xffffff, 0.55);
    panel.strokeRoundedRect(-320, -160, 640, 320, 28);

    const title = this.add
      .text(0, -58, "¡Muy bien!", {
        fontSize: "56px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const subtitle = this.add
      .text(0, 8, "Completaste\ntodos los puzzles", {
        fontSize: "32px",
        color: "#ffe9a8",
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5);

    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x3fa34d, 1);
    buttonBg.fillRoundedRect(-170, 86, 340, 78, 22);
    buttonBg.lineStyle(3, 0xffffff, 0.55);
    buttonBg.strokeRoundedRect(-170, 86, 340, 78, 22);

    const buttonLabel = this.add
      .text(0, 125, "Volver a jugar", {
        fontSize: "34px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const buttonHit = this.add.zone(0, 125, 360, 90).setInteractive({ useHandCursor: true });
    buttonHit.on("pointerdown", () => {
      this.scene.start("PuzzleSolarScene");
    });

    this.finalLayer.add([panel, title, subtitle, buttonBg, buttonLabel, buttonHit]);
    this.tweens.add({
      targets: this.finalLayer,
      scaleX: { from: 0.85, to: 1 },
      scaleY: { from: 0.85, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 280,
      ease: "Back.Out",
    });
  }
}
