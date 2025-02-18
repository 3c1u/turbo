import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs-extra";
import yaml from "js-yaml";

export default function setupTestFixtures({
  directory,
  test,
}: {
  directory: string;
  test: string;
}) {
  const fixtures: Array<string> = [];
  const parentDirectory = path.join(directory, test);

  afterEach(() => {
    fixtures.forEach((fixture) => {
      fs.rmSync(fixture, { recursive: true, force: true });
    });
  });

  afterAll(() => {
    fs.rmSync(parentDirectory, { recursive: true, force: true });
  });

  const useFixture = ({ fixture }: { fixture: string }) => {
    const directoryName = uuidv4();
    const testDirectory = path.join(parentDirectory, directoryName);
    if (!fs.existsSync(testDirectory)) {
      fs.mkdirSync(testDirectory, { recursive: true });
    }
    // keep track of it
    fixtures.push(testDirectory);

    // copy fixture to test directory

    const fixturePath = path.join(directory, "__fixtures__", test, fixture);
    fs.copySync(fixturePath, testDirectory, {
      recursive: true,
    });

    const readGenerator = (method: (filePath: string) => unknown) => {
      return <T>(filename: string) => {
        const filePath = path.isAbsolute(filename)
          ? filename
          : path.join(testDirectory, filename);
        try {
          return method(filePath) as T;
        } catch (e) {
          return undefined;
        }
      };
    };

    const read = readGenerator((filePath) => fs.readFileSync(filePath, "utf8"));
    const readJson = readGenerator((filePath) =>
      fs.readJSONSync(filePath, "utf8")
    );
    const readYaml = readGenerator((filePath) =>
      yaml.load(fs.readFileSync(filePath, "utf8"))
    );

    return { root: testDirectory, read, readJson, readYaml, directoryName };
  };

  return { useFixture };
}
