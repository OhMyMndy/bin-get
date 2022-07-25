import { exists } from "https://deno.land/std@0.149.0/fs/exists.ts";
import { assert } from "https://deno.land/std@0.149.0/testing/asserts.ts";

const defaultAllows = new Map<string, string | null>([
  ["--allow-write", "/usr/bin/,/tmp"],
  ["--allow-env", null],
  ["--allow-read", null],
  ["--allow-net", "api.github.com"],
]);

function getAllowList(options: Map<string, string>): string[] {
  const allowsList = defaultAllows;

  return Array.from(
    Array.from(allowsList).map(([k, v]) => {
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
    }).values(),
  );
}

const testPackages: string[] = [
  "helm/helm",
  "sachaos/viddy",
  "r-darwish/topgrade",
  "hadolint/hadolint",
  "whalebrew/whalebrew",
];

for (const testPackage of testPackages) {
  Deno.test(`Test install ${testPackage}`, async () => {
    const p = Deno.run({
      cmd: [
        "deno",
        "run",
        "--allow-all",
        "./bin-get.ts",
        "install",
        testPackage,
        "--force",
      ],
    });
    await p.status();
    Deno.close(p.rid);
  });
  assert(
    await exists(`/usr/bin/` + testPackage.split("/")[1]),
    `${testPackage} should be installed in /usr/bin/`,
  );
}

Deno.test(`Test install helm with predefined allow list`, async () => {
  const p = Deno.run({
    cmd: [
      "deno",
      "run",
      ...getAllowList(
        new Map<string, string>([["--allow-net", ",get.helm.sh"]]),
      ),
      "./bin-get.ts",
      "install",
      "helm/helm",
      "--force",
    ],
  });
  await p.status();
  Deno.close(p.rid);
});

Deno.test("Test install helm with custom location", async () => {
  const p = Deno.run({
    cmd: [
      "deno",
      "run",
      "--allow-all",
      "./bin-get.ts",
      "install",
      "helm/helm",
      "--force",
      "--directory",
      "/root/.bin/",
    ],
  });
  await p.status();
  Deno.close(p.rid);
  assert(
    await exists("/root/.bin/helm"),
    `helm should be installed in /root/.bin/helm`,
  );
});
