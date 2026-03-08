import PuzzleSolarScene from "./scenas/PuzzleSolarScene.js";
import Puzzle2Scene from "./scenas/Puzzle2Scene.js";
import Puzzle3Scene from "./scenas/Puzzle3Scene.js";
import Puzzle4Scene from "./scenas/Puzzle4Scene.js";

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 500,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [PuzzleSolarScene, Puzzle2Scene, Puzzle3Scene, Puzzle4Scene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);
