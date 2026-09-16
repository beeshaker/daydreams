/** Match the context requested by React Three Fiber's default renderer. */
export function canUseWebGL2(): boolean {
  let context: WebGL2RenderingContext | null = null;

  try {
    // Checking for the API alone is insufficient: a browser may expose WebGL
    // while its graphics driver or browser settings prevent context creation.
    context = document.createElement("canvas").getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    return context !== null && !context.isContextLost();
  } catch {
    return false;
  } finally {
    // The probe must not keep a GPU context alive alongside the actual game.
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
