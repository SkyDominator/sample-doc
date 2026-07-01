/* Pyodide playground worker.
 *
 * This file must stay a classic worker script (no import/export) so that
 * `importScripts` remains available for loading Pyodide from the CDN. It runs the
 * exact same execution model as scripts/validate_playgrounds.py: the scenario
 * template is executed with a bound `params` dict, stdout is captured, and any
 * raised exception is reported by type and message.
 */

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodide = null;
let runner = null;
let initPromise = null;

async function ensureRuntime(sdkSources) {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    importScripts(`${PYODIDE_INDEX_URL}pyodide.js`);
    pyodide = await self.loadPyodide({ indexURL: PYODIDE_INDEX_URL });

    for (const [modulePath, source] of Object.entries(sdkSources)) {
      const fullPath = `/lib/${modulePath}`;
      pyodide.FS.mkdirTree(fullPath.slice(0, fullPath.lastIndexOf("/")));
      pyodide.FS.writeFile(fullPath, source);
    }

    runner = pyodide.runPython(`
import sys, io, contextlib

if "/lib" not in sys.path:
    sys.path.insert(0, "/lib")


def _run_playground(template, params):
    namespace = {"params": dict(params)}
    buffer = io.StringIO()
    try:
        with contextlib.redirect_stdout(buffer):
            exec(compile(template, "<playground>", "exec"), namespace, namespace)
        return {"stdout": buffer.getvalue(), "error_type": None, "error_message": None}
    except Exception as exc:
        return {
            "stdout": buffer.getvalue(),
            "error_type": type(exc).__name__,
            "error_message": str(exc),
        }


_run_playground
`);
  })();

  return initPromise;
}

self.onmessage = async (event) => {
  const { type, id, template, params, sdkSources } = event.data;
  if (type !== "run") return;

  try {
    await ensureRuntime(sdkSources);
    const pyParams = pyodide.toPy(params);
    const proxy = runner(template, pyParams);
    const result = proxy.toJs({ dict_converter: Object.fromEntries });
    proxy.destroy();
    pyParams.destroy();
    self.postMessage({ type: "result", id, ...result });
  } catch (error) {
    self.postMessage({
      type: "result",
      id,
      stdout: "",
      error_type: "RuntimeError",
      error_message: String(error && error.message ? error.message : error),
    });
  }
};
