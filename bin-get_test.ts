import {
  assertEquals,
} from "https://deno.land/std@0.149.0/testing/asserts.ts";

const defaultAllows = new Map<string, string | null>([
  ["--allow-write", "/usr/bin/,/tmp"],
  ["--allow-env", null],
  ["--allow-read", null],
  ["--allow-net", "api.github.com"],
]);

function getAllowList(options: Map<string, string>): string[] {
  const allowsList = defaultAllows;

  return Array.from(
    Array.from(allowsList)
      .map(([k, v]) => {
        if (options.has(k)) {
          if (v) {
            v += options.get(k);
          } else {
            v = options.get(k) + "";
          }
        }
        if (v) {
          return `${k}=${v}`;
        }
        return k;
      })
      .values()
  );
}


async function removeBinary(packageName: string) {
  const p = Deno.run({
    cmd: ["which", packageName],
    stdout: "piped"
  });
  const [stdout] = await Promise.all([
    p.output(),
  ]);
  p.close();

  const packageLocation = new TextDecoder().decode(stdout);
  if (packageLocation) {
    await Deno.remove(packageLocation);
  }
}

async function testBinGet(
  packageName: string,
  runArgs: string[] = [],
  packageInstallLocation: string | null = null
) {
  await removeBinary(packageName);
  Deno.test(`Test install ${packageName}`, async () => {
    if (packageInstallLocation != null) {
      runArgs.push("--directory", packageInstallLocation);
    }
    const command = [
      "deno",
      "run",
      "--allow-all",
      "./bin-get.ts",
      "install",
      packageName,
      "--force",
      ...runArgs,
    ];
    const p = Deno.run({
      cmd: command,
      stderr: "piped",
    });
    const [code, rawError] = await Promise.all([
      p.status(),
      p.stderrOutput(),
    ]);
    p.close();

    const errorString = new TextDecoder().decode(rawError);

    assertEquals(true, code.success, errorString);
  });

  const p = Deno.run({
    cmd: ["which", packageName.split("/")[1]],
    // stdout: "piped",
    // stderr: "piped",
  });
  const [code] = await Promise.all([
    p.status(),
  ]);
  p.close();
  assertEquals(true, code.success, `${packageName} should be installed`);
}

const testPackages: string[] = [
  "helm/helm",
  "sachaos/viddy",
  "r-darwish/topgrade",
  "hadolint/hadolint",
  "whalebrew/whalebrew",
];

for (const testPackage of testPackages) {
  await testBinGet(testPackage);
}

Deno.test(`Test install helm with predefined allow list`, async () => {
  await testBinGet(
    "helm/helm",
    getAllowList(new Map<string, string>([["--allow-net", ",get.helm.sh"]]))
  );
});

Deno.test("Test install helm with custom location", async () => {
  await testBinGet("helm/helm", ["--directory", "/root/.bin"]);
});
