"""Мягкие звуки переходов для ролика G-Launcher: тихий шорох и мягкий щелчок."""
import numpy as np, wave, os
SR = 48000
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'glauncher')
rng = np.random.default_rng(5)

def lowpass(x, cutoff):
    cutoff = np.broadcast_to(cutoff, x.shape)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        a = 1 - np.exp(-2 * np.pi * cutoff[i] / SR)
        s += a * (x[i] - s); y[i] = s
    return y

def save(name, x, peak):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    st = np.stack([x, x], 1)
    with wave.open(os.path.join(out, name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())

# Мягкий шорох: шум через двойной ФНЧ с плавно движущимся срезом (без высоких «свистящих» частот)
d = 0.45; n = int(SR * d); t = np.arange(n) / SR
cut = 350 + 1100 * np.sin(np.pi * t / d) ** 2
y = lowpass(lowpass(rng.standard_normal(n), cut), cut)
y -= lowpass(y, 120)  # убираем гул
env = np.sin(np.pi * t / d) ** 2.5
save('soft_whoosh.wav', y * env, 0.5)

# Мягкий щелчок: короткий синус ~700 Гц с быстрым затуханием, без низкого удара
d = 0.18; n = int(SR * d); t = np.arange(n) / SR
f = 760 - 180 * t / d
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28) * np.clip(t / 0.004, 0, 1)
x += 0.3 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * np.exp(-t * 40)
save('soft_pop.wav', x, 0.5)
print('ok')
