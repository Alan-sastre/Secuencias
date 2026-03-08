export default class Puzzle2Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Puzzle2Scene" });
    this.pattern = ["cat", "dog", "bird", "cat", "dog"];
    this.options = [];
    this.hand = null;
    this.isCompleting = false;
    this.correctOption = null;
    this.dropTarget = { x: 770, y: 192 };
    this.dropZone = null;
  }

  create() {
    this.isCompleting = false;
    this.options = [];
    this.correctOption = null;
    this.drawEnvironment();
    this.drawPatternRow();
    this.createOptions();
    this.createDropZone();
    this.hand = this.add
      .text(0, 0, "👆🏻", { fontSize: "60px" })
      .setOrigin(0.5)
      .setDepth(20);
    this.input.on("dragstart", (pointer, gameObject) => this.onDragStart(gameObject));
    this.input.on("drag", (pointer, gameObject, dragX, dragY) => this.onDrag(gameObject, dragX, dragY));
    this.input.on("dragend", (pointer, gameObject) => this.onDragEnd(gameObject));
    this.updateHelp();
  }

  drawEnvironment() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x98cfff, 0x98cfff, 0xeef7ff, 0xeef7ff, 1);
    bg.fillRect(0, 0, 1000, 500);

    const stage = this.add.graphics();
    stage.fillGradientStyle(0x6f4c3f, 0x6f4c3f, 0x3f2a23, 0x3f2a23, 1);
    stage.fillRoundedRect(90, 360, 820, 95, 22);
    stage.fillStyle(0xffffff, 0.08);
    stage.fillRoundedRect(105, 372, 790, 18, 8);

    for (let i = 0; i < 24; i += 1) {
      const x = 120 + i * 32;
      const lamp = this.add.graphics();
      lamp.fillStyle(0xffef9a, 0.5);
      lamp.fillCircle(x, 52, 6);
    }
  }

  drawPatternRow() {
    const slots = [170, 320, 470, 620, 770];
    for (let i = 0; i < slots.length; i += 1) {
      const slot = this.add.graphics();
      slot.fillStyle(0xffffff, 0.18);
      slot.fillRoundedRect(slots[i] - 58, 130, 116, 116, 20);
      slot.lineStyle(3, 0xffffff, 0.35);
      slot.strokeRoundedRect(slots[i] - 58, 130, 116, 116, 20);

      if (i < this.pattern.length - 1) {
        const item = this.createAnimal(slots[i], 192, this.pattern[i], false, 0.62);
        item.setDepth(12);
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
    const types = ["cat", "dog", "bird"];
    const positions = [250, 500, 750];
    for (let i = 0; i < types.length; i += 1) {
      const animal = this.createAnimal(positions[i], 370, types[i], true, 0.9);
      animal.setData("homeX", positions[i]);
      animal.setData("homeY", 370);
      this.options.push(animal);
      const tapZone = this.add.zone(positions[i], 370, 230, 230).setDepth(31);
      tapZone.setInteractive({ useHandCursor: true });
      tapZone.on("pointerdown", () => this.onOptionTap(animal));
      if (types[i] === this.pattern[this.pattern.length - 1]) {
        this.correctOption = animal;
      }
    }
  }

  createDropZone() {
    this.dropZone = this.add.zone(this.dropTarget.x, this.dropTarget.y, 220, 220).setDepth(5);
  }

  createAnimal(x, y, type, interactive, scale = 1) {
    const container = this.add.container(x, y).setSize(170, 170).setDepth(12);
    const graphics = this.add.graphics();
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.16);
    shadow.fillEllipse(0, 62, 110, 20);
    container.add(shadow);
    container.add(graphics);

    switch (type) {
      case "cat":
        this.drawCat(graphics);
        break;
      case "dog":
        this.drawDog(graphics);
        break;
      case "bird":
        this.drawBird(graphics);
        break;
    }

    const halo = this.add.graphics();
    halo.lineStyle(3, 0xffffff, 0.35);
    halo.strokeCircle(0, -8, 76);
    container.add(halo);
    container.setScale(scale);

    container.setData("type", type);
    if (interactive) {
      container.setInteractive(new Phaser.Geom.Circle(0, -8, 90), Phaser.Geom.Circle.Contains);
      this.input.setDraggable(container);
    }
    return container;
  }

  drawCat(g) {
    g.fillStyle(0xf3aa53, 1);
    g.fillCircle(0, -5, 58);
    g.fillStyle(0xcf8438, 1);
    g.fillTriangle(-30, -42, -54, -94, -4, -52);
    g.fillTriangle(30, -42, 54, -94, 4, -52);
    g.fillStyle(0xf9d9b7, 1);
    g.fillEllipse(0, 16, 62, 42);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-20, -14, 12);
    g.fillCircle(20, -14, 12);
    g.fillStyle(0x1f1f1f, 1);
    g.fillCircle(-20, -14, 5);
    g.fillCircle(20, -14, 5);
    g.fillStyle(0x7a3d2b, 1);
    g.fillTriangle(0, 2, -7, 10, 7, 10);
  }

  drawDog(g) {
    g.fillStyle(0xb9814f, 1);
    g.fillRoundedRect(-54, -68, 108, 114, 30);
    g.fillStyle(0x8c5f38, 1);
    g.fillRoundedRect(-62, -62, 22, 65, 11);
    g.fillRoundedRect(40, -62, 22, 65, 11);
    g.fillStyle(0xe5c49b, 1);
    g.fillEllipse(0, 12, 66, 44);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-17, -16, 11);
    g.fillCircle(17, -16, 11);
    g.fillStyle(0x1f1f1f, 1);
    g.fillCircle(-17, -16, 4.5);
    g.fillCircle(17, -16, 4.5);
    g.fillStyle(0x2a1a14, 1);
    g.fillCircle(0, 2, 7);
  }

  drawBird(g) {
    g.fillStyle(0x64b9ff, 1);
    g.fillEllipse(0, 0, 108, 82);
    g.fillStyle(0x4a9be0, 1);
    g.fillEllipse(-8, 8, 78, 52);
    g.fillStyle(0xffc65e, 1);
    g.fillTriangle(48, -4, 82, -15, 82, 7);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-20, -16, 11);
    g.fillStyle(0x1f1f1f, 1);
    g.fillCircle(-20, -16, 5);
    g.fillStyle(0x8ed2ff, 0.85);
    g.fillEllipse(-6, -8, 30, 22);
  }

  onDragStart(option) {
    if (this.isCompleting) {
      return;
    }
    this.animateAnimal(option);
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
    const selected = option.getData("type");
    const expected = this.pattern[this.pattern.length - 1];
    const isNearHole =
      Phaser.Math.Distance.Between(option.x, option.y, this.dropTarget.x, this.dropTarget.y) < 130;

    if (selected === expected && isNearHole) {
      this.isCompleting = true;
      option.x = this.dropTarget.x;
      option.y = this.dropTarget.y;
      option.input.enabled = false;
      this.hand.setVisible(false);
      this.showConfetti();
      this.time.delayedCall(1200, () => this.scene.start("Puzzle3Scene"));
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
      this.cameras.main.shake(200, 0.01);
    }
    this.updateHelp();
  }

  onOptionTap(option) {
    if (this.isCompleting) {
      return;
    }
    this.animateAnimal(option);
    const selected = option.getData("type");
    const expected = this.pattern[this.pattern.length - 1];

    if (selected === expected) {
      this.isCompleting = true;
      option.x = this.dropTarget.x;
      option.y = this.dropTarget.y;
      option.input.enabled = false;
      this.hand.setVisible(false);
      this.showConfetti();
      this.time.delayedCall(1200, () => this.scene.start("Puzzle3Scene"));
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

  animateAnimal(animal) {
    this.tweens.add({
      targets: animal,
      y: animal.y - 12,
      yoyo: true,
      duration: 180,
      ease: "Sine.Out",
    });
    this.tweens.add({
      targets: animal,
      scaleX: 1.07,
      scaleY: 0.94,
      yoyo: true,
      duration: 180,
      ease: "Sine.Out",
    });
  }

  showConfetti() {
    const colors = [0xff4d6d, 0xffd166, 0x06d6a0, 0x4cc9f0, 0x9b5de5];
    for (let i = 0; i < 120; i += 1) {
      const piece = this.add.rectangle(
        Phaser.Math.Between(80, 920),
        Phaser.Math.Between(-120, -10),
        Phaser.Math.Between(6, 12),
        Phaser.Math.Between(8, 16),
        colors[Phaser.Math.Between(0, colors.length - 1)],
      );
      piece.setDepth(40);
      this.tweens.add({
        targets: piece,
        x: piece.x + Phaser.Math.Between(-120, 120),
        y: Phaser.Math.Between(420, 560),
        angle: Phaser.Math.Between(-360, 360),
        alpha: { from: 1, to: 0.9 },
        duration: Phaser.Math.Between(900, 1400),
        ease: "Cubic.In",
        onComplete: () => piece.destroy(),
      });
    }
  }

  updateHelp() {
    if (this.isCompleting) {
      this.hand.setVisible(false);
      return;
    }
    if (!this.correctOption) {
      return;
    }
    this.hand
      .setPosition(this.correctOption.x, this.correctOption.y + 112)
      .setVisible(true);
  }
}
