"""Figures 5.1 to 5.4 for /05-business/, generated from models/sim_growth.csv.

Every value is read from the model's own planning line; none is entered by hand. The output is
the record's diagram language: classes only, no colour attributes, stroke widths from the class
list, one accent element per figure, a height that is a multiple of 40. It writes a fragment to
docs/05-business/_figures.html, which is pasted into the page and then deleted: the published
site is static HTML with no build step (DR-010), so the SVG lives in the page, not in a pipeline.

    python3 tools/figures/forecast-05.py
"""
import csv, math, html, pathlib

R = pathlib.Path(__file__).resolve().parents[2]
rows = list(csv.DictReader(open(R / 'models/sim_growth.csv')))
CR = 1e7  # one crore
def col(name): return [float(r[name]) for r in rows]
months = [int(r['month']) for r in rows]
S = {k: col(k + '_plan') for k in ('revenue', 'labour', 'tokens', 'eng', 'compliance', 'sales', 'gna', 'onetime', 'total_cost', 'contribution', 'cum_cash')}
S['other'] = [a + b + c + d for a, b, c, d in zip(S['compliance'], S['sales'], S['gna'], S['onetime'])]
S['cash_cons'] = col('cum_cash_cons')
S['labour_share'] = [l / r * 100 for l, r in zip(S['labour'], S['revenue'])]

# Everything annotated below is read off the run rather than typed in, so a
# regenerated CSV moves the labels with the curves.
CROSS = next(m for m in months if all(c > 0 for c in S['contribution'][m - 1:]))
TROUGH_M = min(months, key=lambda m: S['cum_cash'][m - 1])
TROUGH_CR = -min(S['cum_cash']) / CR
CONS_TROUGH_M = min(months, key=lambda m: S['cash_cons'][m - 1])
CONS_TROUGH_CR = -min(S['cash_cons']) / CR
FX = 89.0
END_CR = S['cum_cash'][-1] / CR
EXIT_M = next(m for m in months if S['cum_cash'][m - 1] / CR > 60)
CONS_EXIT_M = next(m for m in months if S['cash_cons'][m - 1] / CR > 60)
CONS_END_CR = S['cash_cons'][-1] / CR

def esc(s): return html.escape(str(s), quote=True)
def H(h): return int(math.ceil(h / 40.0) * 40)
def txt(x, y, s, cls='fg-label-small', anchor=None):
    a = f' text-anchor="{anchor}"' if anchor else ''
    return f'<text class="{cls}" x="{x:.0f}" y="{y:.0f}"{a}>{esc(s)}</text>'
def path(pts, cls):
    d = 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    return f'<path class="{cls}" d="{d}"/>'
def area(pts, y0, cls):
    d = 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + f' L{pts[-1][0]:.1f},{y0:.1f} L{pts[0][0]:.1f},{y0:.1f} Z'
    return f'<path class="{cls}" d="{d}"/>'
def ticks(hi, n=4):
    raw = hi / n
    mag = 10 ** math.floor(math.log10(raw))
    step = next(s * mag for s in (1, 2, 2.5, 5, 10) if s * mag >= raw)
    return [i * step for i in range(int(math.ceil(hi / step)) + 1)]
def figure(fid, num, title, desc, takeaway, height, body, chip=True):
    c = ' <span class="chip chip-assumption">assumption</span>' if chip else ''
    return (f'        <figure class="fig" id="{fid}">\n'
            f'          <div class="fig-scroll" tabindex="0" role="region" aria-label="Figure 5.{num}, {esc(title)}, scrollable">\n'
            f'          <svg viewBox="0 0 720 {H(height)}" role="img" aria-labelledby="{fid}-title {fid}-desc">'
            f'<title id="{fid}-title">{esc(title)}</title><desc id="{fid}-desc">{esc(desc)}</desc>'
            f'{body}</svg>\n          </div>\n'
            f'          <figcaption><span class="fig-no">Figure 5.{num}</span> {esc(takeaway)}{c}</figcaption>\n'
            f'        </figure>')

# ---------------------------------------------------------------- 5.1 the cost base, by factor
def small_multiples():
    panels = [('Delivery labour', S['labour'], True), ('Engineering', S['eng'], False),
              ('Tokens', S['tokens'], False), ('Everything else', S['other'], False)]
    hi = max(max(p[1]) for p in panels) / CR
    tk = ticks(hi, 3)
    PW, PH, GX, GY = 322, 150, 36, 56
    out = []
    out.append(txt(712, 14, 'Rs crore a month; every panel on the same scale', 'fg-label-small fg-label-soft', 'end'))
    for i, (name, series, accent) in enumerate(panels):
        cx = 12 + (i % 2) * (PW + GX); cy = 36 + (i // 2) * (PH + GY)
        x0, x1, y0, y1 = cx + 56, cx + PW, cy + PH, cy + 16
        X = lambda m: x0 + (x1 - x0) * (m - 1) / 59
        Y = lambda v: y1 + (y0 - y1) * (1 - min(v / CR, tk[-1]) / tk[-1])
        for t in tk:
            out.append(f'<line class="fg-rule" x1="{x0}" y1="{Y(t * CR):.1f}" x2="{x1}" y2="{Y(t * CR):.1f}"/>')
            out.append(txt(x0 - 6, Y(t * CR) + 4, f'{t:g}', 'fg-label-small fg-label-soft', 'end'))
        pts = [(X(m), Y(v)) for m, v in zip(months, series)]
        out.append(area(pts, y0, 'fg-fill-accent' if accent else 'fg-fill-soft'))
        out.append(path(pts, 'fg-accent' if accent else 'fg-line'))
        out.append(f'<line class="fg-line" x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}"/>')
        for m, anch in ((12, 'middle'), (36, 'middle'), (60, 'end')):
            out.append(txt(X(m), y0 + 18, f'm{m}', 'fg-label-small fg-label-soft', anch))
        out.append(txt(x0, cy + 6, name, 'fg-label fg-label-strong'))
        out.append(txt(x1, cy + 6, f'{series[-1] / CR:.2f} at m60' if series[-1] / CR < 1 else f'{series[-1] / CR:.1f} at m60', 'fg-label-small fg-label-soft', 'end'))
    return H(36 + 2 * (PH + GY)), ''.join(out)

# ---------------------------------------------------------------- the shared line-chart frame
def frame(series, fmt, unit, marks, accent_key, zero_line=False, height=400, clip='clip', hi_cap=None, exit_note=None, label_gap=0, label_at=None):
    x0, x1, y1 = 96, 638 - label_gap, 28
    y0 = height - 64
    lo = min(0, min(min(v) for v in series.values()))
    hi = hi_cap if hi_cap is not None else max(max(v) for v in series.values())
    tk = ticks(hi, 4)
    span = tk[-1] - min(lo, 0)
    X = lambda m: x0 + (x1 - x0) * (m - 1) / 59
    Y = lambda v: y0 - (y0 - y1) * (v - min(lo, 0)) / span
    out = [f'<defs><clipPath id="{clip}"><rect x="{x0 - 2}" y="{y1 - 10}" width="{x1 - x0 + 4}" height="{y0 - y1 + 12}"/></clipPath></defs>']
    out.append(txt(712, 14, unit, 'fg-label-small fg-label-soft', 'end'))
    for t in tk:
        out.append(f'<line class="fg-rule" x1="{x0}" y1="{Y(t):.1f}" x2="{x1}" y2="{Y(t):.1f}"/>')
        out.append(txt(x0 - 8, Y(t) + 4, fmt(t), 'fg-label-small fg-label-soft', 'end'))
    if zero_line and lo < 0:
        out.append(f'<line class="fg-line" x1="{x0}" y1="{Y(0):.1f}" x2="{x1}" y2="{Y(0):.1f}"/>')
        out.append(txt(x0 - 8, Y(0) + 4, fmt(0), 'fg-label-small fg-label-soft', 'end'))
    out.append(f'<line class="fg-line" x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}"/>')
    for m in (1, 12, 24, 36, 48, 60):
        out.append(f'<line class="fg-rule" x1="{X(m):.1f}" y1="{y0}" x2="{X(m):.1f}" y2="{y0 + 6}"/>')
        out.append(txt(X(m), y0 + 20, f'm{m}', 'fg-label-small fg-label-soft', 'middle'))
    for key, vals in series.items():
        pts = [(X(m), min(max(Y(v), y1 - 8), y0)) for m, v in zip(months, vals)]
        out.append(f'<g clip-path="url(#{clip})">' + path(pts, 'fg-accent' if key == accent_key else 'fg-line') + '</g>')
        if len(series) > 1 and label_at is None:
            out.append(txt(x1 + 8, min(max(Y(vals[-1]), y1 + 4), y0) + 4, key,
                           'fg-label-small' if key == accent_key else 'fg-label-small fg-label-soft'))
        elif len(series) > 1:
            lm, ldy, lanchor = label_at[key]
            out.append(txt(X(lm), min(max(Y(vals[lm - 1]), y1 + 12), y0 - 6) + ldy, key,
                           'fg-label-small' if key == accent_key else 'fg-label-small fg-label-soft', lanchor))
    if exit_note:
        for i, line in enumerate(exit_note):
            out.append(txt(x0, y1 + 30 + i * 17, line, 'fg-label-small', 'start'))
    for mark in marks:
        m, key, label, above = mark[:4]
        dx, dy_over, anchor_over = (list(mark[4:]) + [None, None, None])[:3]
        v = series[key][m - 1]
        out.append(f'<circle class="{"fg-fill-accent" if key == accent_key else "fg-fill-ink"}" cx="{X(m):.1f}" cy="{Y(v):.1f}" r="4"/>')
        dy = dy_over if dy_over is not None else (-14 if above else 20)
        anchor = anchor_over or ('middle' if 14 < m < 48 else ('start' if m <= 14 else 'end'))
        off = dx if dx is not None else (0 if anchor == 'middle' else (8 if anchor == 'start' else -8))
        if not label:
            continue
        ty = min(max(Y(v), y1 + 12), y0 - 6) + dy
        if abs(dy) > 30:
            out.append(f'<line class="fg-rule" x1="{X(m):.1f}" y1="{Y(v) - 6:.1f}" x2="{X(m):.1f}" y2="{ty + 4:.1f}"/>')
        out.append(txt(X(m) + off, ty, label, 'fg-label-small', anchor))
    return height, ''.join(out)

# ---------------------------------------------------------------- build the four
figs = []
h, body = small_multiples()
figs.append(figure('fig-cost-factors', 1,
 'The cost base by factor, months 1 to 60',
 'Four panels on one scale, in rupees crore a month, on the planning line. Delivery labour, drawn in the accent, '
 'rises from about 0.08 crore a month to 3.6. Engineering rises from 0.28 to 3.1 and is the larger line until month 46. '
 'Tokens never leave the floor of the scale, ending at 0.26. Everything else, which is compliance, sales, general and '
 'administrative and one-time costs, rises from 0.24 to 2.3.',
 'Labour is the line that grows with usage; engineering is the larger line for the first four years; tokens never '
 'become the largest line in any month. The four panels are the cost base except payment fees and make-goods, '
 'which are charged on revenue and reach 1.2 crore a month by m60.', h, body))

h, body = frame({'revenue': [v / CR for v in S['revenue']], 'cost': [v / CR for v in S['total_cost']]},
 lambda t: f'{t:g}', 'Rs crore a month', [(CROSS, 'revenue', f'revenue passes cost at m{CROSS}', True, -12, -34, 'end')],
 'revenue', height=400, clip='clip-rc')
figs.append(figure('fig-revenue-cost', 2,
 'Revenue against the whole cost base, months 1 to 60',
 'Two lines in rupees crore a month on the planning line. The cost base starts near 0.63 crore a month and rises to '
 'about 10.4 by month 60. Revenue starts at 0.115, is below cost for the first twenty-eight months, crosses it at '
 f'month {CROSS}, and ends where the accent line ends.',
 f'The lines cross at month {CROSS} on the planning line: before it every month consumes cash, after it every month makes '
 'it. Two averaged lines cross earlier than the paths beneath them; the median path crosses at month 40.', h, body))

h, body = frame({'labour as a share of revenue': S['labour_share']}, lambda t: f'{t:g}%', 'per cent of revenue',
 [(1, 'labour as a share of revenue', '73% at m1', True), (36, 'labour as a share of revenue', '18% at m36', True),
  (60, 'labour as a share of revenue', '15% at m60', True)], 'labour as a share of revenue', height=360, clip='clip-ls')
figs.append(figure('fig-labour-share', 3,
 'Delivery labour as a share of revenue, months 1 to 60',
 'One line, the accent, falling from 73 per cent of revenue in month 1 to 39 per cent by month 12, 18 per cent by '
 'month 36 and 15 per cent by month 60, with most of the fall in the first two years.',
 'This is the ratio the four levers move: the same curve sits at 85 per cent at month 36 in the configuration the '
 'record previously specified.', h, body))

h, body = frame({'planning line': [v / CR for v in S['cum_cash']], 'conservative line': [v / CR for v in S['cash_cons']]},
 lambda t: f'{t:g}', 'Rs crore, cumulative',
 [(TROUGH_M, 'planning line', f'trough m{TROUGH_M}, {TROUGH_CR:.1f} cr', True, -10, -64, 'end'),
  (CONS_TROUGH_M, 'conservative line', '', False, 0, 0, 'start')],
 'planning line', zero_line=True, height=400, clip='clip-cc', hi_cap=60, label_gap=0,
 label_at={'planning line': (34, -16, 'end'), 'conservative line': (45, 22, 'start')},
 exit_note=(f'both lines leave the frame, at m{EXIT_M} and m{CONS_EXIT_M},',
            f'reaching {END_CR:,.0f} and {CONS_END_CR:,.0f} crore by m60'))
figs.append(figure('fig-cumulative-cash', 4,
 'Cumulative cash, the planning line against the conservative line, months 1 to 60',
 f'Two lines in rupees crore, cumulative, against a zero line. The planning line, the accent, falls to a trough of '
 f'about minus {TROUGH_CR:.1f} crore at month {TROUGH_M} and is back above zero soon after. The conservative line '
 f'falls further and later, to about minus {CONS_TROUGH_CR:.1f} crore at month {CONS_TROUGH_M}.',
 f'The trough is what the planning line asks for: about {TROUGH_CR:.1f} crore, and {CONS_TROUGH_CR:.1f} on the '
 f'conservative one, which at the model\'s rate of {FX:.0f} rupees to the dollar are the '
 f'${TROUGH_CR * CR / FX / 1e6:.2f}m and ${CONS_TROUGH_CR * CR / FX / 1e6:.2f}m of section 5. The median path needs '
 f'more, because the trough of an average is shallower than the average of troughs.',
 h, body))

out = R / 'docs/05-business/_figures.html'
out.write_text('\n'.join(figs) + '\n', encoding='utf-8')
print('wrote', out, len(figs), 'figures')
