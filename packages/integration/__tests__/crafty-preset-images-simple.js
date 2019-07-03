/* global describe, it, expect */

const fs = require("fs");
const path = require("path");

const configuration = require("@swissquote/crafty/src/configuration");

const { run, cleanDist, exists } = require("../utils");

const getCrafty = configuration.getCrafty;

jest.setTimeout(10000);

it("Loads crafty-preset-images-simple and does not register gulp tasks", () => {
  const crafty = getCrafty(["@swissquote/crafty-preset-images-simple"], {});

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain("@swissquote/crafty-preset-images-simple");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([]);
});

it("Fails if both crafty-preset-images-simple and crafty-preset-images-simple are loaded", () => {
  const crafty = getCrafty(
    [
      "@swissquote/crafty-preset-images",
      "@swissquote/crafty-preset-images-simple",
      "@swissquote/crafty-runner-gulp"
    ],
    {}
  );

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain("@swissquote/crafty-preset-images");
  expect(loadedPresets).toContain("@swissquote/crafty-preset-images-simple");
  expect(loadedPresets).toContain("@swissquote/crafty-runner-gulp");

  expect(() => crafty.createTasks()).toThrow(
    "Failed registering 'crafty-preset-images-simple' a task with this name already exists"
  );
});

it("Loads crafty-preset-images-simple, crafty-runner-gulp and registers gulp task", () => {
  const crafty = getCrafty(
    [
      "@swissquote/crafty-preset-images-simple",
      "@swissquote/crafty-runner-gulp"
    ],
    {}
  );

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain("@swissquote/crafty-preset-images-simple");
  expect(loadedPresets).toContain("@swissquote/crafty-runner-gulp");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([
    "images",
    "default"
  ]);
});

it("Copies and compresses images", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-images-simple");
  await cleanDist(dir);

  const result = await run(dir, ["run", "images"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/images/batman.svg")).toBeTruthy();
  expect(exists(dir, "dist/images/somedir/cute-cats-2.jpg")).toBeTruthy();

  expect(fs.statSync(path.join(dir, "dist/images/batman.svg")).size).toEqual(
    fs.statSync(path.join(dir, "images/batman.svg")).size
  );
  expect(fs.statSync(path.join(dir, "dist/images/somedir/cute-cats-2.jpg")).size).toEqual(
    fs.statSync(path.join(dir, "images/somedir/cute-cats-2.jpg")).size
  );
});
