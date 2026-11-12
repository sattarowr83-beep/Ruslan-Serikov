"""Фоновая музыка для ролика G-Launcher: мягкий синт-пэд + пульс, 36 с, 48 кГц."""
import numpy as np, wave, os
SR = 48000; DUR = 36.5; BPM = 100
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'glauncher', 'music.wav')
n = int(SR * DUR); t = np.arange(n) / SR
beat = 60 / BPM; bar = beat * 4
rng = np.random.default_rng(3)

def midi(m): return 440 * 2 ** ((m - 69) / 12)
# Am - F - C - G
chords = [[57, 60, 64], [53, 57, 60], [48, 55, 60], [55, 59, 62]]
bass = [45, 41, 48, 43]

def lowpass(x, cutoff):
    a = 1 - np.exp(-2 * np.pi * cutoff / SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s += a * (x[i] - s); y[i] = s
    return y

pad = np.zeros(n); bas = np.zeros(n); arp = np.zeros(n)
bar_idx = (t // bar).astype(int) % 4
for k in range(4):
    mask = bar_idx == k
    for m in chords[k]:
        for det in (-0.08, 0.08):
            f = midi(m) * 2 ** (det / 12)
            pad[mask] += np.sin(2 * np.pi * f * t[mask]) + 0.3 * np.sin(4 * np.pi * f * t[mask])
    f = midi(bass[k])
    bas[mask] += np.sin(2 * np.pi * f * t[mask])
# bass pulses on 8ths
eighth = beat / 2
ph8 = (t % eighth) / eighth
bas *= np.exp(-ph8 * 3.5)
# arpeggio 16ths
six = beat / 4
step = (t // six).astype(int)
for i in range(int(DUR / six) + 1):
    s = int(i * six * SR); e = min(n, s + int(six * SR));
    if s >= n: break
    k = int((i * six) // bar) % 4
    m = chords[k][i % 3] + 12
    tt = np.arange(e - s) / SR
    arp[s:e] += np.sin(2 * np.pi * midi(m) * tt) * np.exp(-tt * 14)
# kick on beats
kick = np.zeros(n)
for i in range(int(DUR / beat) + 1):
    s = int(i * beat * SR); L = int(0.25 * SR)
    if s >= n: break
    e = min(n, s + L); tt = np.arange(e - s) / SR
    f = 45 + 70 * np.exp(-tt * 30)
    kick[s:e] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 12)
# hat on offbeats
hat = np.zeros(n); noise = rng.standard_normal(n)
hp = noise - lowpass(noise, 6000)
for i in range(int(DUR / beat) + 1):
    s = int((i + 0.5) * beat * SR); L = int(0.05 * SR)
    if s + L >= n: break
    hat[s:s + L] += hp[s:s + L] * np.exp(-np.arange(L) / SR * 60)
pad = lowpass(pad, 1400)
mix = 0.16 * pad / np.max(np.abs(pad)) + 0.35 * bas + 0.10 * arp + 0.45 * kick + 0.06 * hat
# fade in / out
env = np.clip(t / 0.6, 0, 1) * np.clip((DUR - t) / 1.5, 0, 1)
mix *= env
mix = mix / np.max(np.abs(mix)) * 0.8
L = mix; R = np.roll(mix, 240) * 0.98
st = np.stack([L, R], 1)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', out)
