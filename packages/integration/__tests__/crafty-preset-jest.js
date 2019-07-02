/* global describe, it, expect */

const fs = require("fs");
const path = require("path");

const rimraf = require("rimraf");

const testUtils = require("../utils");

let testIfNotPnp = it;

try {
  require("pnpapi");
  testIfNotPnp = it.skip;
} catch (error) {
  // not in PnP; not a problem
}

it("Succeeds without transpiling", async () => {
  process.chdir(
    path.join(__dirname, "../fixtures/crafty-preset-jest/succeeds")
  );
  rimraf.sync("dist");

  const result = await testUtils.run(["test"]);

  expect(result).toMatchSnapshot();
});

it("Creates IDE Integration files", async () => {
  process.chdir(path.join(__dirname, "../fixtures/crafty-preset-jest/ide"));
  rimraf.sync("jest.config.js");
  rimraf.sync(".gitignore");

  const result = await testUtils.run(["ide"]);

  expect(result).toMatchSnapshot();
  expect(
    testUtils.snapshotizeOutput(
      fs.readFileSync("jest.config.js").toString("utf8")
    )
  ).toMatchSnapshot();

  expect(
    testUtils.snapshotizeOutput(fs.readFileSync(".gitignore").toString("utf8"))
  ).toMatchSnapshot();
});

it("Creates IDE Integration files with Babel", async () => {
  process.chdir(
    path.join(__dirname, "../fixtures/crafty-preset-jest/ide-babel")
  );
  rimraf.sync("jest.config.js");
  rimraf.sync(".gitignore");

  const result = await testUtils.run(["ide"]);

  expect(result).toMatchSnapshot();
  expect(
    testUtils.snapshotizeOutput(
      fs.readFileSync("jest.config.js").toString("utf8")
    )
  ).toMatchSnapshot();
});

testIfNotPnp("Succeeds with typescript", async () => {
  process.chdir(
    path.join(__dirname, "../fixtures/crafty-preset-jest/typescript")
  );
  rimraf.sync("dist");

  const result = await testUtils.run(["test"]);

  expect(result).toMatchSnapshot();
});

it("Succeeds with babel", async () => {
  process.chdir(path.join(__dirname, "../fixtures/crafty-preset-jest/babel"));
  rimraf.sync("dist");

  const result = await testUtils.run(["test"]);

  expect(result).toMatchSnapshot();
});

testIfNotPnp("Succeeds with babel and React", async () => {
  process.chdir(
    path.join(__dirname, "../fixtures/crafty-preset-jest/babel-react")
  );
  rimraf.sync("dist");

  const result = await testUtils.run(["test"]);

  expect(result).toMatchSnapshot();
});

it("Succeeds with esm module", async () => {
  process.chdir(path.join(__dirname, "../fixtures/crafty-preset-jest/esm"));
  rimraf.sync("dist");

  const result = await testUtils.run(["test"]);

  expect(result).toMatchSnapshot();
});

it("Succeeds with esm module and babel", async () => {
  process.chdir(
    path.join(__dirname, "../fixtures/crafty-preset-jest/esm-babel")
  );
  rimraf.sync("dist");

  const result = await testUtils.run(["test"]);

  expect(result).toMatchSnapshot();
});
