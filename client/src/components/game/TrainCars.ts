import { PixiComponent } from "@pixi/react";
import { AnimatedSprite, Container, Spritesheet, Text, Texture } from "pixi.js";

const trainSpriteSheet = new Spritesheet(
  Texture.from("/sprites/train/sheet_carriage.png"),
  {
    frames: {
      train1: {
        frame: { x: 0, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train2: {
        frame: { x: 256, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train3: {
        frame: { x: 512, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train4: {
        frame: { x: 768, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train5: {
        frame: { x: 1024, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train6: {
        frame: { x: 1280, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train7: {
        frame: { x: 1536, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train8: {
        frame: { x: 1792, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train9: {
        frame: { x: 2048, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train10: {
        frame: { x: 2304, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train11: {
        frame: { x: 2560, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train12: {
        frame: { x: 2816, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train13: {
        frame: { x: 3072, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train14: {
        frame: { x: 3328, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train15: {
        frame: { x: 3584, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
      train16: {
        frame: { x: 3840, y: 0, w: 256, h: 64 },
        sourceSize: { w: 256, h: 64 },
        spriteSourceSize: { x: 0, y: 0, w: 256, h: 64 },
      },
    },
    meta: {
      image: "/sprites/train/sheet_carriage.png",
      format: "RGBA8888",
      size: { w: 4096, h: 64 },
      scale: 1,
    },
    animations: {
      train: [
        "train1",
        "train2",
        "train3",
        "train4",
        "train5",
        "train6",
        "train7",
        "train8",
        "train9",
        "train10",
        "train11",
        "train12",
        "train13",
        "train14",
        "train15",
        "train16",
      ],
    },
  }
);

const loadSpriteSheet = async () => {
  await trainSpriteSheet.parse();
};

const TrainCars = PixiComponent("TrainCars", {
  create: (props) => {
    // instantiate something and return it.
    // for instance:
    loadSpriteSheet();
    const container = new Container();
    container.x = props.x || 0;

    const totalSpeedText = new Text("0 wpm", { fill: 0xffffff });
    totalSpeedText.name = "totalSpeed";
    container.addChild(totalSpeedText);
    totalSpeedText.x = 400;
    totalSpeedText.y = -64;

    const totalTraveledText = new Text("0 km", { fill: 0xffffff });
    totalTraveledText.name = "totalTraveled";
    container.addChild(totalTraveledText);
    totalTraveledText.x = 400;
    totalTraveledText.y = -32;
    return container;
  },
  didMount: (instance, parent) => {
    // apply custom logic on mount
  },
  willUnmount: (instance, parent) => {
    // clean up before removal
  },
  applyProps: (instance, oldProps, newProps) => {
    // props changed
    // apply logic to the instance
    if (instance) {
      // code that uses this.container

      for (let key in (oldProps as { scores: { [key: string]: any } })[
        "scores"
      ]) {
        // remove user if not in new props
        if (newProps.scores[key] === undefined) {
          const child = instance.getChildByName(key);
          if (child) {
            instance.removeChild(child);
          }
        }
      }

      const newScores = Object.entries(
        newProps.scores as { [key: string]: [number, number] }
      ).sort((a, b) => b[1][1] - a[1][1]);

      let totalSpeed = 0;
      let totalTraveled = 0;
      for (let i = 0; i < newScores.length; i++) {
        let child = instance.getChildByName(
          newScores[i][0]
        ) as Container | null;
        const scoreTextName = "score" + newScores[i][0];
        const wpmTextName = "wpm" + newScores[i][0];
        if (!child) {
          child = new Container();

          const sprite = new AnimatedSprite(trainSpriteSheet.animations.train);
          sprite.animationSpeed = 0.24;
          child.addChild(sprite);
          sprite.play();

          let name = newScores[i][0];
          const user = newProps.users.find(
            (u: Record<string, any>) => u.id === name
          );
          if (user) {
            name = user["username"];
          }
          const text = new Text(name, { fill: 0xffffff, align: "center" });
          child.addChild(text);
          text.x = 128;
          text.y = -32;

          const scoreText = new Text("", { fill: 0xffffff, align: "right" });
          scoreText.name = scoreTextName;
          child.addChild(scoreText);
          scoreText.x = 70;

          const wpmText = new Text("", { fill: 0xffffff, align: "left" });
          wpmText.name = wpmTextName;
          child.addChild(wpmText);
          wpmText.x = 130;

          child.name = newScores[i][0];
          instance.addChild(child);
        }
        child.x = i * -256;
        const scoreText = child.getChildByName(scoreTextName) as Text;
        const wpmText = child.getChildByName(wpmTextName) as Text;
        scoreText.text = newScores[i][1][0].toString();
        wpmText.text = newScores[i][1][1].toFixed(1) + " wpm";
        totalSpeed += newScores[i][1][1];
        totalTraveled += newScores[i][1][0];
      }

      const totalSpeedText = instance.getChildByName("totalSpeed") as Text;
      totalSpeedText.text = totalSpeed.toFixed(1) + " wpm";
      const totalTraveledText = instance.getChildByName(
        "totalTraveled"
      ) as Text;
      totalTraveledText.text = totalTraveled + " km";
    }
  },
  config: {
    // destroy instance on unmount?
    // default true
    destroy: true,

    /// destroy its children on unmount?
    // default true
    destroyChildren: true,
  },
});
export default TrainCars;
