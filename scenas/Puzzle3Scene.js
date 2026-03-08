export default class Puzzle3Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Puzzle3Scene" });
    this.pattern = [0xff4d6d, 0x52b788, 0x4cc9f0, 0xff4d6d, 0x52b788];
    this.options = [];
    this.hand = null;
    this.isCompleting = false;
    this.correctOption = null;
    this.dropTarget = { x: 770, y: 182 };
  }

  create() {
    this.isCompleting = false;
    this.options = [];
    this.correctOption = null;
    this.drawEnvironment();
    this.drawPatternRow();
    this.createOptions();

    this.hand = this.add
      .text(0, 0, "👆🏻", { fontSize: "60px" })
      .setOrigin(0.5)
      .setDepth(22);

    this.input.on("dragstart", (pointer, gameObject) =>
      this.onDragStart(gameObject),
    );
    this.input.on("drag", (pointer, gameObject, dragX, dragY) =>
      this.onDrag(gameObject, dragX, dragY),
    );
    this.input.on("dragend", (pointer, gameObject) =>
      this.onDragEnd(gameObject),
    );

    this.updateHelp();
  }

  drawPatternRow() {
    const slots = [170, 320, 470, 620, 770];
    for (let i = 0; i < slots.length; i += 1) {
      const frame = this.add.graphics();
      frame.fillStyle(0xffffff, 0.18);
      frame.fillRoundedRect(slots[i] - 54, 128, 108, 108, 18);
      frame.lineStyle(3, 0xffffff, 0.35);
      frame.strokeRoundedRect(slots[i] - 54, 128, 108, 108, 18);

      if (i < this.pattern.length - 1) {
        this.createColorDisk(slots[i], 182, this.pattern[i], 0.75);
      } else {
        const mark = this.add.graphics().setDepth(12);
        mark.fillStyle(0xffffff, 0.85);
        mark.fillCircle(slots[i], 182, 24);
        mark.fillStyle(0x3777b3, 1);
        mark.fillCircle(slots[i], 182, 16);
      }
    }
  }

  createOptions() {
    const expected = this.pattern[this.pattern.length - 1];
    const options = Phaser.Utils.Array.Shuffle([expected, 0xf9c74f, 0x4361ee]);
    const xPositions = [250, 500, 750];
    for (let i = 0; i < options.length; i += 1) {
      const disk = this.createColorDisk(
        xPositions[i],
        370,
        options[i],
        1,
        true,
      );
      disk.setData("color", options[i]);
      disk.setData("homeX", xPositions[i]);
      disk.setData("homeY", 370);
      this.options.push(disk);
      const tapZone = this.add.zone(xPositions[i], 370, 230, 230).setDepth(31);
      tapZone.setInteractive({ useHandCursor: true });
      tapZone.on("pointerdown", () => this.onOptionTap(disk));
      if (options[i] === expected) {
        this.correctOption = disk;
      }
    }
  }

  createColorDisk(x, y, color, scale = 1, interactive = false) {
    const disk = this.add
      .container(x, y)
      .setSize(100, 100)
      .setDepth(14)
      .setScale(scale);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(0, 26, 72, 12);
    g.fillStyle(color, 1);
    g.fillCircle(0, 0, 36);
    g.fillStyle(0xffffff, 0.28);
    g.fillEllipse(-10, -12, 22, 12);
    g.lineStyle(3, 0xffffff, 0.25);
    g.strokeCircle(0, 0, 36);
    disk.add(g);
    if (interactive) {
      disk.setInteractive(
        new Phaser.Geom.Circle(0, 0, 52),
        Phaser.Geom.Circle.Contains,
      );
      this.input.setDraggable(disk);
    }
    return disk;
  }

  onDragStart(option) {
    if (this.isCompleting) {
      return;
    }
    this.animateChoice(option);
  }

  onDrag(option, dragX, dragY) {
    if (this.isCompleting) {
      return;
    }
    option.x = dragX;
    option.y = dragY;
  }

  onDragEnd(option) {
    if (this.isCompleting) {
      return;
    }
    const selected = option.getData("color");
    const expected = this.pattern[this.pattern.length - 1];
    const isNearHole =
      Phaser.Math.Distance.Between(
        option.x,
        option.y,
        this.dropTarget.x,
        this.dropTarget.y,
      ) < 130;

    if (selected === expected && isNearHole) {
      this.isCompleting = true;
      option.x = this.dropTarget.x;
      option.y = this.dropTarget.y;
      option.input.enabled = false;
      this.hand.setVisible(false);
      this.showConfetti();
      this.time.delayedCall(950, () => this.transformCaterpillar());
      return;
    }

    this.tweens.add({
      targets: option,
      x: option.getData("homeX"),
      y: option.getData("homeY"),
      duration: 220,
      ease: "Sine.Out",
    });
    if (isNearHole) {
      this.cameras.main.shake(180, 0.009);
    }
    this.updateHelp();
  }

  onOptionTap(option) {
    if (this.isCompleting) {
      return;
    }
    this.animateChoice(option);
    const selected = option.getData("color");
    const expected = this.pattern[this.pattern.length - 1];

    if (selected === expected) {
      this.isCompleting = true;
      option.x = this.dropTarget.x;
      option.y = this.dropTarget.y;
      option.input.enabled = false;
      this.hand.setVisible(false);
      this.showConfetti();
      this.time.delayedCall(950, () => this.transformCaterpillar());
      return;
    }

    this.cameras.main.shake(180, 0.009);
    this.tweens.add({
      targets: option,
      x: option.getData("homeX"),
      y: option.getData("homeY"),
      duration: 180,
      ease: "Sine.Out",
    });
    this.updateHelp();
  }

  animateChoice(option) {
    this.tweens.add({
      targets: option,
      scaleX: option.scaleX * 1.07,
      scaleY: option.scaleY * 0.93,
      yoyo: true,
      duration: 140,
      ease: "Sine.Out",
    });
  }

  transformCaterpillar() {
    const butterfly = this.createButterfly(520, 280);
    this.tweens.add({
      targets: butterfly,
      y: 250,
      yoyo: true,
      duration: 420,
      repeat: 6,
      ease: "Sine.InOut",
    });
    this.tweens.add({
      targets: butterfly,
      angle: 6,
      yoyo: true,
      duration: 220,
      repeat: 12,
      ease: "Sine.InOut",
    });
    this.time.delayedCall(3200, () => this.scene.start("Puzzle4Scene"));
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

  drawEnvironment() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x9dd3ff, 0x9dd3ff, 0xeaf7ff, 0xeaf7ff, 1);
    bg.fillRect(0, 0, 1000, 500);
    const grass = this.add.graphics();
    grass.fillGradientStyle(0x5ea949, 0x5ea949, 0x2d6c27, 0x2d6c27, 1);
    grass.fillRect(0, 330, 1000, 170);
    for (let i = 0; i < 160; i += 1) {
      const blade = this.add.graphics();
      blade.fillStyle(Phaser.Math.Between(0, 1) ? 0x3b8232 : 0x2e6f28, 0.35);
      blade.fillRect(
        Phaser.Math.Between(0, 1000),
        Phaser.Math.Between(332, 496),
        2,
        Phaser.Math.Between(4, 12),
      );
    }
  }

  createCaterpillarHead(x, y, color) {
    const head = this.add.container(x, y).setDepth(12);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(0, 26, 60, 12);
    g.fillStyle(color, 1);
    g.fillCircle(0, 0, 30);
    g.fillStyle(0xffffff, 0.22);
    g.fillCircle(-10, -10, 10);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-10, -8, 8);
    g.fillCircle(10, -8, 8);
    g.fillStyle(0x1f1f1f, 1);
    g.fillCircle(-10, -8, 3);
    g.fillCircle(10, -8, 3);
    g.lineStyle(2, 0x1f1f1f, 0.6);
    g.beginPath();
    g.moveTo(-5, 8);
    g.lineTo(5, 8);
    g.strokePath();
    head.add(g);
    return head;
  }

  createSegment(x, y, color, draggable = false) {
    const segment = this.add.container(x, y).setDepth(12).setSize(58, 58);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(0, 23, 52, 10);
    g.fillStyle(color, 1);
    g.fillCircle(0, 0, 28);
    g.fillStyle(0xffffff, 0.22);
    g.fillEllipse(-8, -10, 16, 10);
    segment.add(g);
    if (draggable) {
      segment.setInteractive(
        new Phaser.Geom.Circle(0, 0, 28),
        Phaser.Geom.Circle.Contains,
      );
    }
    return segment;
  }

  createButterfly(x, y) {
    const b = this.add.container(x, y).setDepth(16);
    const g = this.add.graphics();
    g.fillStyle(0x8849d9, 1);
    g.fillEllipse(-40, -8, 66, 52);
    g.fillEllipse(40, -8, 66, 52);
    g.fillStyle(0xb07dff, 1);
    g.fillEllipse(-36, -10, 36, 24);
    g.fillEllipse(36, -10, 36, 24);
    g.fillStyle(0x6e33b4, 1);
    g.fillEllipse(-28, 22, 50, 40);
    g.fillEllipse(28, 22, 50, 40);
    g.fillStyle(0x9f65ef, 1);
    g.fillEllipse(-24, 20, 24, 16);
    g.fillEllipse(24, 20, 24, 16);
    g.fillStyle(0x3d2a2f, 1);
    g.fillRoundedRect(-5, -24, 10, 62, 5);
    g.lineStyle(2, 0x3d2a2f, 1);
    g.beginPath();
    g.moveTo(-2, -22);
    g.lineTo(-16, -38);
    g.moveTo(2, -22);
    g.lineTo(16, -38);
    g.strokePath();
    b.add(g);
    return b;
  }

  updateHelp() {
    if (this.isCompleting) {
      this.hand.setVisible(false);
      return;
    }
    if (!this.correctOption) return;
    this.hand
      .setPosition(this.correctOption.x, this.correctOption.y + 105)
      .setVisible(true);
  }
}
