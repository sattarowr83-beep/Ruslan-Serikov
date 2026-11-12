"""Премиальный набор звуков для ролика G-Launcher: без звонких тонов и колокольчиков.
Только приглушённые «тапы», воздушные переходы, стук клавиш и низкие мягкие акценты."""
import numpy as np, wave, os, shutil
SR = 48000
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'glauncher', 'sfx')
shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
rng = np.random.default_rng(21)

def tt(d): return np.arange(int(SR * d)) / SR
def _filt(x, gain):
    """Фильтр через БПФ с плавными (2-го порядка) склонами — нужен только numpy."""
    n = len(x); m = 1 << (n + 2048).bit_length()
    f = np.fft.rfftfreq(m, 1 / SR) + 1e-9
    return np.fft.irfft(np.fft.rfft(x, m) * gain(f), m)[:n]
def lp(x, fc): return _filt(x, lambda f: 1 / np.sqrt(1 + (f / fc) ** 4))
def hp(x, fc): return _filt(x, lambda f: 1 / np.sqrt(1 + (fc / f) ** 4))
def bp(x, lo, hi): return _filt(x, lambda f: 1 / np.sqrt((1 + (f / hi) ** 4) * (1 + (lo / f) ** 4)))
def fftconvolve(a, b):
    m = 1 << (len(a) + len(b)).bit_length()
    return np.fft.irfft(np.fft.rfft(a, m) * np.fft.rfft(b, m), m)[:len(a) + len(b) - 1]
def noise(d): return rng.standard_normal(int(SR * d))
def sine(f, d, decay, attack=0.003):
    t = tt(d); f = np.broadcast_to(f, t.shape)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * decay) * np.clip(t / attack, 0, 1)
def pad(x, n): return np.concatenate([x, np.zeros(max(0, n - len(x)))])
def mix(*parts):
    n = max(len(p) + o for p, o in parts); y = np.zeros(n)
    for p, o in parts: y[o:o + len(p)] += p
    return y

# короткая мягкая «комната» для объёма (стерео)
def room(d=0.35, dark=3500):
    t = tt(d); return [lp(noise(d), dark) * np.exp(-t * 16) for _ in range(2)]
ROOM = room()

def save(name, x, peak=0.5, wet=0.18, pan=None):
    """x — моно; pan — массив -1..1 (движение слева направо) либо None."""
    x = np.concatenate([x, np.zeros(int(SR * 0.3))])
    if pan is None: L, R = x.copy(), x.copy()
    else:
        p = pad(pan, len(x)); p[len(pan):] = pan[-1]
        L, R = x * np.sqrt((1 - p) / 2), x * np.sqrt((1 + p) / 2)
    wl, wr = fftconvolve(x, ROOM[0])[:len(x)], fftconvolve(x, ROOM[1])[:len(x)]
    k = wet * np.max(np.abs(x)) / (max(np.max(np.abs(wl)), np.max(np.abs(wr))) + 1e-9)
    L, R = L + wl * k, R + wr * k
    st = np.stack([L, R], 1); st = st / (np.max(np.abs(st)) + 1e-9) * peak
    fade = int(SR * 0.02); st[-fade:] *= np.linspace(1, 0, fade)[:, None]
    with wave.open(os.path.join(out, name + '.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())

# ---------- переходы: воздушный «выдох» с движением по стерео ----------
def whoosh(d, bands, direction):
    t = tt(d); x = t / d
    y = np.zeros(len(t))
    # несколько полос шума, каждая со своим «горбом» по времени → плавный подъём и спад тембра
    for i, (lo, hi) in enumerate(bands):
        c = 0.3 + 0.4 * i / max(1, len(bands) - 1)
        y += bp(noise(d), lo, hi) * np.exp(-((x - c) / 0.22) ** 2)
    y = lp(y, 5000) * np.sin(np.pi * x) ** 2
    y += 0.5 * sine(70, d, 0, attack=d * 0.4) * np.sin(np.pi * x) ** 3  # мягкая низкая подложка
    return y, direction * (2 * x - 1) * 0.7
for name, d, bands, dr in [
    ('whoosh_a', 0.60, [(250, 700), (500, 1500), (900, 2600)], 1),
    ('whoosh_b', 0.52, [(900, 2400), (500, 1400), (250, 800)], -1),
    ('whoosh_c', 0.70, [(200, 600), (400, 1200), (700, 2000)], 1),
]:
    y, p = whoosh(d, bands, dr); save(name, y, 0.5, wet=0.25, pan=p)

# ---------- клавиатура: «тхок» клавиши = щелчок + глухой корпус + тихий отскок ----------
def key(body_f, click_f, vel):
    click = bp(noise(0.012), click_f, click_f * 2.2) * np.exp(-tt(0.012) * 420)
    body = mix((sine(body_f, 0.07, 55, attack=0.001), 0), (0.5 * sine(body_f * 2.7, 0.04, 90, attack=0.001), 0))
    thud = lp(noise(0.05), 900) * np.exp(-tt(0.05) * 80)
    up = bp(noise(0.008), click_f * 1.3, click_f * 2.6) * np.exp(-tt(0.008) * 500) * 0.25
    return mix((click * 0.7 * vel, 0), (body * 0.9, 0), (thud * 0.6, 0), (up, int(SR * (0.055 + 0.02 * rng.random()))))
for i in range(6):
    save(f'key{i}', key(150 + 22 * rng.random() * 3, 1800 + 500 * rng.random(), 0.8 + 0.4 * rng.random()), 0.5, wet=0.10)

# ---------- мягкие «тапы» интерфейса (без тона) ----------
def tap(body_f, d=0.09, bright=1400):
    return mix((lp(noise(0.03), bright) * np.exp(-tt(0.03) * 130) * 0.6, 0), (sine(np.linspace(body_f * 1.25, body_f, int(SR * d)), d, 38, attack=0.002), 0))
save('tap', tap(210), 0.5)                    # карточка / всплывающий элемент
save('tap_low', tap(120, 0.14, 900), 0.5)     # крупный элемент, заголовок
for i, f in enumerate([170, 185, 200, 215]):  # галочки и строки списка: чуть разная высота корпуса
    save(f'tick{i}', tap(f, 0.07, 2200), 0.45, wet=0.12)

# ---------- мелкие щелчки ----------
save('count_tick', bp(noise(0.012), 1500, 3500) * np.exp(-tt(0.012) * 380), 0.3, wet=0.05)
save('clock_tick', mix((bp(noise(0.01), 1800, 3800) * np.exp(-tt(0.01) * 420), 0), (sine(420, 0.03, 130) * 0.5, 0)), 0.3, wet=0.08)

# ---------- акценты ----------
# «минус»: глухой низкий удар с падением высоты
t = tt(0.5); save('drop', sine(150 - 70 * (t / 0.5) ** 0.5, 0.5, 9, attack=0.006) + 0.25 * lp(noise(0.5), 500) * np.exp(-t * 20), 0.5, wet=0.22)
# задумчивость: тихий воздушный выдох
d = 0.9; t = tt(d); save('breath', bp(noise(d), 300, 1100) * np.sin(np.pi * t / d) ** 2, 0.4, wet=0.3)
# логотип: низкий мягкий «бум» + воздушный подъём перед ним (без звона)
d = 1.3; t = tt(d)
rise = bp(noise(0.5), 400, 2200) * (tt(0.5) / 0.5) ** 2.5
boom = sine(62 - 14 * t / d, d, 3.2, attack=0.012) + 0.35 * sine(124, d, 6, attack=0.012) + 0.4 * lp(noise(d), 300)[:len(t)] * np.exp(-t * 9)
save('reveal', mix((rise * 0.35, 0), (boom, int(SR * 0.42))), 0.55, wet=0.3)
# рост полосок: воздушный подъём
d = 0.75; t = tt(d); x = t / d
y = sum(bp(noise(d), lo, hi) * np.exp(-((x - c) / 0.25) ** 2) for lo, hi, c in [(250, 700, 0.25), (500, 1400, 0.5), (900, 2400, 0.8)])
save('rise', y * np.clip((1 - x) / 0.12, 0, 1) * np.clip(x / 0.2, 0, 1), 0.4, wet=0.2, pan=(2 * x - 1) * 0.4)
# позитив («реально полезно»): тёплый низкий двойной тап вверх, без звона
save('confirm', mix((tap(165, 0.16, 1200), 0), (tap(220, 0.22, 1500), int(SR * 0.11)), (sine(110, 0.5, 7, attack=0.01) * 0.35, int(SR * 0.11))), 0.5, wet=0.25)
# финальная кнопка: плотный мягкий «клик» с низом
save('button', mix((tap(140, 0.16, 1800), 0), (sine(70, 0.35, 10, attack=0.004) * 0.6, 0)), 0.5, wet=0.2)
print('ok', sorted(os.listdir(out)))
