/* global describe, it, expect */

const fs = require("fs");
const path = require("path");

const configuration = require("@swissquote/crafty/src/configuration");

const { run, cleanDist, exists } = require("../utils");

const getCrafty = configuration.getCrafty;

jest.setTimeout(10000);

it("Loads crafty-preset-images and does not register gulp tasks", () => {
  const crafty = getCrafty(["@swissquote/crafty-preset-images"], {});

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain("@swissquote/crafty-preset-images");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([]);
});

it("Loads crafty-preset-images, crafty-runner-gulp and registers gulp task", () => {
  const crafty = getCrafty(
    ["@swissquote/crafty-preset-images", "@swissquote/crafty-runner-gulp"],
    {}
  );

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain("@swissquote/crafty-preset-images");
  expect(loadedPresets).toContain("@swissquote/crafty-runner-gulp");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([
    "images_all",
    "images_svg",
    "images",
    "default"
  ]);
});

it("Copies and compresses images", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-images");
  await cleanDist(dir);

  const result = await run(dir, ["run", "images"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/images/batman.svg")).toBeTruthy();
  expect(exists(dir, "dist/images/somedir/cute-cats-2.jpg")).toBeTruthy();
  expect(exists(dir, "dist/images/notcopied.txt")).toBeFalsy();

  expect(fs.statSync("dist/images/batman.svg").size).toBeLessThan(
    fs.statSync("images/batman.svg").size
  );
  expect(fs.statSync("dist/images/somedir/cute-cats-2.jpg").size).toBeLessThan(
    fs.statSync("images/somedir/cute-cats-2.jpg").size
  );
});
