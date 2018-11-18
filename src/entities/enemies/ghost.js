// firefly.js - Player's glorious ship
import { Math } from 'phaser';
import Globals from '../../globals';

const DEFAULT_ANIM_SPEED = 500;
const DEFAULT_TRACK_INTERVAL = 1500;

const GhostTypes = {
  SMALL: { size: 50, speed: 120 },
  MEDIUM: { size: 75, speed: 90 },
  BIG: { size: 100, speed: 60 }
};

const GhostStates = {
  idle: 1,
  follow: 2,
  moveLeft: 3,
  moveRight: 4,
  moveUp: 5,
  moveDown: 6
};

class Ghost {

  constructor(scene, config) {
    this.scene = scene;

    this.config = {
      type: GhostTypes.SMALL,
      animSpeed: DEFAULT_ANIM_SPEED,
      ...config
    };

    this.sprite = this.createSprite();
    this.sprite.x = config.x;
    this.sprite.y = config.y;

    if (config.facing === 'left') {
      this.sprite.flipX = true;
    }

    // bind a physics body to this render tex
    this.scene.physics.add.existing(this.sprite);

    this._state = GhostStates.idle;
  }

  createSprite() {
    const { type, animSpeed } = this.config;
    const { body, eyes } = this.config.palette;
    const size = type.size;

    const rt = this.scene.add.renderTexture(0, 0, size, size);
    const graphics = this.scene.add.graphics().setVisible(false);

    this.scene.tweens.addCounter({
      from: 0,
      to: 10,
      duration: animSpeed,
      yoyo: true,
      repeat: -1,
      onUpdate: (tween) => {
        const t = tween.getValue();

        graphics.clear();
        graphics.fillStyle(body, 1);
        //graphics.fillGradientStyle(0xffff00, 0x00ffde, 0xff0000, 0xffb8de);
        graphics.fillEllipse(size * 0.5, size * 0.38, size, size * 0.7);

        const offset = size * 0.15 - t;
        const d_offset = t;
        
        graphics.beginPath();
        graphics.moveTo(0, size * 0.4);
        graphics.lineTo(2, size - d_offset);
        graphics.lineTo(size * 0.25, size - offset);
        graphics.lineTo(size * 0.5, size - d_offset);
        graphics.lineTo(size * 0.75, size - offset);
        graphics.lineTo(size - 2, size - d_offset);
        graphics.lineTo(size, size * 0.4);
        graphics.closePath();
        graphics.fillPath();
        
        // graphics.lineStyle(1, 0xffffff);
        graphics.fillStyle(eyes, 1);
        graphics.beginPath();
        graphics.moveTo(size * 0.15, size * 0.3);
        graphics.lineTo(size * 0.35, size * 0.45 - t * 0.2);
        graphics.lineTo(size * 0.40, size * 0.35);
        graphics.closePath();
        graphics.fillPath();

        // graphics.lineStyle(1, 0xffffff);
        graphics.fillStyle(eyes, 1);
        graphics.beginPath();
        graphics.moveTo(size - size * 0.15, size * 0.3);
        graphics.lineTo(size - size * 0.35, size * 0.45 - t * 0.2);
        graphics.lineTo(size - size * 0.40, size * 0.35);
        graphics.closePath();
        graphics.fillPath();

        // update render tex w/h new image
        rt.clear();
        rt.draw(graphics, 0, 0);
      }
    });

    return rt;
  }

  get gameSprite() {
    return this.sprite;
  }

  setConfig(key, value) {
    this.config[key] = value;
  }

  setState(value, config) {
    this._state = value;

    switch (this._state) {
      case GhostStates.follow:
        this.track(config.target);
        break;

      case GhostStates.idle:
        break;
    }
  }

  track(target) {
    // clear old tracking event
    if (this.trackEvent) {
      this.trackEvent.destroy();
    }

    // adjust target vector
    this.scene.physics.moveToObject(this.sprite, target, this.config.type.speed);

    // re-adjust target vector every N ms.
    this.trackEvent = this.scene.time.addEvent({
      delay: DEFAULT_TRACK_INTERVAL,
      loop: true,
      callback: () => {
        this.scene.physics.moveToObject(this.sprite, target, this.config.type.speed);
      }
    });
  }

  update(time, delta) {
    if (!this.config.noWrap) {
      this.scene.physics.world.wrap(this.sprite, this.config.size);
    }
  }

}

export { Ghost, GhostTypes, GhostStates };
