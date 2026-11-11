"""Генерирует звуки для ролика: свайп (whoosh) и мягкий удар (thump)."""
import numpy as np, wave, os
SR = 48000
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')

def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.85
    st = np.stack([x, x], 1)
    with wave.open(os.path.join(out, name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())

rng = np.random.default_rng(7)
# Swipe: шум через подвижный фильтр, громкость колоколом
d = 0.32; n = int(SR*d); t = np.arange(n)/SR
noise = rng.standard_normal(n)
cut = 600 + 5200*np.sin(np.pi*t/d)**2
y = np.zeros(n); lp = 0.0; hp_prev_in = 0.0; hp = 0.0
for i in range(n):
    a = 1 - np.exp(-2*np.pi*cut[i]/SR)
    lp += a*(noise[i]-lp)
    hp = 0.97*(hp + lp - hp_prev_in); hp_prev_in = lp
    y[i] = hp
env = np.sin(np.pi*np.clip(t/d,0,1))**1.6 * np.exp(-1.5*t)
save('swipe.wav', y*env)

# Thump: синус с падением высоты + короткий щелчок
d = 0.45; n = int(SR*d); t = np.arange(n)/SR
f = 55 + 85*np.exp(-t*18)
ph = 2*np.pi*np.cumsum(f)/SR
body = np.sin(ph)*np.exp(-t*9)
click = rng.standard_normal(n)*np.exp(-t*320)*0.25
att = np.clip(t/0.004,0,1)
save('thump.wav', (body+click)*att)
print('ok')
