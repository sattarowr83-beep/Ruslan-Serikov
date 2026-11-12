"""Набор мягких звуков для ролика G-Launcher (переходы и появление элементов)."""
import numpy as np, wave, os
SR = 48000
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'glauncher', 'sfx')
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(5)

def lowpass(x, cutoff):
    cutoff = np.broadcast_to(cutoff, x.shape)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        a = 1 - np.exp(-2 * np.pi * cutoff[i] / SR)
        s += a * (x[i] - s); y[i] = s
    return y

def tt(d): return np.arange(int(SR * d)) / SR

def tone(f, d, decay, attack=0.004, harm=0.0):
    t = tt(d); f = np.broadcast_to(f, t.shape)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + harm * np.sin(2 * ph)
    return x * np.exp(-t * decay) * np.clip(t / attack, 0, 1)

def save(name, x, peak=0.5, pan=0.0):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    st = np.stack([x * (1 - max(pan, 0)), x * (1 + min(pan, 0))], 1)
    with wave.open(os.path.join(out, name + '.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())

def mix(*parts):
    n = max(len(p) + o for p, o in parts); y = np.zeros(n)
    for p, o in parts: y[o:o + len(p)] += p
    return y

# --- переходы: три разных мягких шороха ---
for name, d, lo, hi, shape in [('whoosh_a', 0.45, 350, 1100, 2.5), ('whoosh_b', 0.38, 500, 1600, 2.0), ('whoosh_c', 0.55, 250, 800, 3.0)]:
    t = tt(d)
    cut = lo + hi * np.sin(np.pi * t / d) ** 2
    y = lowpass(lowpass(rng.standard_normal(len(t)), cut), cut)
    y -= lowpass(y, 120)
    save(name, y * np.sin(np.pi * t / d) ** shape, 0.5)

# --- «бульк» для вопросительного знака: восходящий мягкий тон ---
t = tt(0.3); save('bubble', tone(300 + 500 * (t / 0.3) ** 0.6, 0.3, 14), 0.5)
# --- мягкие поп-звуки (карточки, всплывающие элементы) ---
t = tt(0.16); save('pop', tone(620 - 200 * t / 0.16, 0.16, 30, harm=0.2), 0.5)
t = tt(0.2); save('pop_low', tone(380 - 120 * t / 0.2, 0.2, 24, harm=0.2), 0.5)
# --- галочки в списке: 4 тона по возрастающей (пентатоника) ---
for i, f in enumerate([660, 740, 880, 990]):
    save(f'check{i}', tone(f, 0.18, 26) + 0.25 * tone(f * 2, 0.18, 40), 0.45)
# --- клики клавиатуры: несколько вариантов ---
for i in range(4):
    n = rng.standard_normal(int(SR * 0.04))
    k = lowpass(n, 2500 + 600 * i) * np.exp(-tt(0.04) * 160)
    k += 0.6 * tone(1600 + 150 * i, 0.04, 140)
    save(f'key{i}', k, 0.4)
# --- тикание часов ---
t = tt(0.05); save('clock_tick', tone(2100, 0.05, 120) + 0.5 * tone(3200, 0.05, 180), 0.35)
# --- щелчок счётчика ---
save('count_tick', tone(1300, 0.03, 160), 0.3)
# --- «минус»: две ноты вниз (у конкурента больше) ---
save('tone_down', mix((tone(523, 0.3, 9, attack=0.01), 0), (tone(392, 0.45, 7, attack=0.01), int(SR * 0.14))), 0.45)
# --- задумчивость: мягкий низкий «вздох» ---
t = tt(0.9)
y = lowpass(rng.standard_normal(len(t)), 500 + 300 * np.sin(np.pi * t / 0.9)) + 0.3 * tone(196, 0.9, 1.5, attack=0.2)
save('sigh', y * np.sin(np.pi * t / 0.9) ** 2, 0.4)
# --- логотип: мерцание (арпеджио колокольчиков) ---
notes = [784, 988, 1175, 1568, 1976]
save('shimmer', mix(*[(tone(f, 0.8, 5) + 0.3 * tone(f * 2.01, 0.8, 8), int(SR * 0.055 * i)) for i, f in enumerate(notes)]), 0.45)
# --- блип для строк и чипов ---
for i, f in enumerate([880, 988, 1109, 1319]):
    save(f'blip{i}', tone(f, 0.12, 34) + 0.2 * tone(f * 1.5, 0.12, 50), 0.4)
# --- рост полосок: мягкий восходящий свип ---
t = tt(0.7); save('sweep_up', tone(300 + 500 * (t / 0.7) ** 1.5, 0.7, 2.5, attack=0.08) * np.clip((0.7 - t) / 0.1, 0, 1), 0.4)
# --- позитив: мажорная терция (галочка «полезно») ---
save('chime_up', mix((tone(659, 0.5, 6), 0), (tone(831, 0.6, 5), int(SR * 0.09)), (tone(988, 0.7, 4), int(SR * 0.18))), 0.45)
# --- финальная кнопка: мягкий «тап» + звон ---
save('button', mix((tone(520, 0.12, 30, harm=0.3), 0), (tone(1046, 0.6, 6), int(SR * 0.03))), 0.45)
print('ok', sorted(os.listdir(out)))
