/**
 * Short synthetic shutter (noise + click) for download / capture feedback.
 * Run from a user gesture so AudioContext can start.
 */
export function playCameraShutterSound() {
  try {
    const AC =
      typeof window !== "undefined"
        ? (window.AudioContext ??
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
        : undefined;
    if (!AC) return;

    const ctx = new AC();
    const t0 = ctx.currentTime;
    void ctx.resume();

    const nFrames = Math.floor(ctx.sampleRate * 0.065);
    const noiseBuf = ctx.createBuffer(1, nFrames, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nFrames; i++) {
      nd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (nFrames * 0.28));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.2, t0);
    nGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);
    noise.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(t0);
    noise.stop(t0 + 0.07);

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(2200, t0);
    osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.024);
    const oGain = ctx.createGain();
    oGain.gain.setValueAtTime(0.07, t0);
    oGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.032);
    osc.connect(oGain);
    oGain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.038);
  } catch {
    // unsupported or blocked
  }
}
