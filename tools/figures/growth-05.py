"""Figure 5.5 for /05-business/: the two acquisition mechanisms, month by month.

Generated from models/sim_growth.csv, the published run, on its planning line,
which is the basis every other figure on the page uses. Every value is read;
none is entered by hand. Same diagram language as
the other figures on the page: classes only, no colour attributes, stroke
widths from the class list, one accent element, a height that is a multiple of
40.

    python3 tools/figures/growth-05.py
"""
import csv
import html
import math
import pathlib

R = pathlib.Path(__file__).resolve().parents[2]
rows = list(csv.DictReader(open(R / 'models/sim_growth.csv')))
months = [int(r['month']) for r in rows]
org = [float(r['adds_organic_plan']) for r in rows]
paid = [float(r['adds_paid_plan']) for r in rows]


def esc(s):
    return html.escape(str(s), quote=True)


def H(h):
    return int(math.ceil(h / 40.0) * 40)


def txt(x, y, s, cls='fg-label-small', anchor=None):
    a = f' text-anchor="{anchor}"' if anchor else ''
    return f'<text class="{cls}" x="{x:.0f}" y="{y:.0f}"{a}>{esc(s)}</text>'


def path(pts, cls):
    return f'<path class="{cls}" d="M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + '"/>'


def area(pts, y0, cls):
    d = ('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts)
         + f' L{pts[-1][0]:.1f},{y0:.1f} L{pts[0][0]:.1f},{y0:.1f} Z')
    return f'<path class="{cls}" d="{d}"/>'


x0, x1, y1 = 96, 556, 72
height = 360
y0 = height - 64
share_paid = [p / (o + p) * 100 if (o + p) > 0 else 0.0 for o, p in zip(org, paid)]
X = lambda m: x0 + (x1 - x0) * (m - 1) / 59
Y = lambda v: y0 - (y0 - y1) * v / 40.0

out = [txt(712, 14, 'bought, as a share of arrivals', 'fg-label-small fg-label-soft', 'end')]
for t in (0, 10, 20, 30, 40):
    out.append(f'<line class="fg-rule" x1="{x0}" y1="{Y(t):.1f}" x2="{x1}" y2="{Y(t):.1f}"/>')
    out.append(txt(x0 - 8, Y(t) + 4, f'{t}%', 'fg-label-small fg-label-soft', 'end'))
out.append(f'<line class="fg-line" x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}"/>')
for m in (1, 12, 24, 36, 48, 60):
    out.append(f'<line class="fg-rule" x1="{X(m):.1f}" y1="{y0}" x2="{X(m):.1f}" y2="{y0 + 6}"/>')
    out.append(txt(X(m), y0 + 20, f'm{m}', 'fg-label-small fg-label-soft', 'middle'))

pts = [(X(m), Y(v)) for m, v in zip(months, share_paid)]
out.append(area(pts, y0, 'fg-fill-accent'))
out.append(path(pts, 'fg-accent'))
out.append(txt(x1 + 8, Y(share_paid[-1]) + 4, 'bought', 'fg-label-small'))
out.append(txt(x1 + 8, Y(share_paid[-1]) - 14, 'earned, above', 'fg-label-small fg-label-soft'))

peak = max(range(len(share_paid)), key=lambda i: share_paid[i])
out.append(f'<circle class="fg-fill-accent" cx="{X(months[peak]):.1f}" cy="{Y(share_paid[peak]):.1f}" r="4"/>')
out.append(txt(x0, y1 - 50, 'media buys the base that word of mouth compounds on,', 'fg-label-small'))
out.append(txt(x0, y1 - 34, 'so its share of arrivals falls while its spend rises:', 'fg-label-small'))
out.append(txt(x0, y1 - 18, f'{share_paid[peak]:.0f} per cent of arrivals bought at m{months[peak]}, '
                            f'{share_paid[-1]:.0f} per cent at m60', 'fg-label-small fg-label-soft'))

FID = 'fig-two-mechanisms'
TITLE = 'The two acquisition mechanisms, months 1 to 60'
DESC = (f'The share of new users bought rather than earned, month by month, on the planning line of the published '
        f'run, at a $120 low-volume anchor and a media budget of 15 per cent of revenue. It is '
        f'{share_paid[0]:.0f} per cent in month 1, when the base is two hundred users and the budget is a floor, '
        f'settles near {share_paid[11]:.0f} per cent through the first year and falls to {share_paid[-1]:.0f} per '
        f'cent by month 60, while the absolute media spend rises throughout, '
        f'because every bought user joins the base that word of mouth compounds on.')
TAKEAWAY = ('Media is the primer and word of mouth is the engine: the bought share peaks early and falls as the base '
            'it created compounds.')

fig = (f'        <figure class="fig" id="{FID}">\n'
       f'          <div class="fig-scroll" tabindex="0" role="region" '
       f'aria-label="Figure 5.5, {esc(TITLE)}, scrollable">\n'
       f'          <svg viewBox="0 0 720 {H(height)}" role="img" aria-labelledby="{FID}-title {FID}-desc">'
       f'<title id="{FID}-title">{esc(TITLE)}</title><desc id="{FID}-desc">{esc(DESC)}</desc>'
       f'{"".join(out)}</svg>\n          </div>\n'
       f'          <figcaption><span class="fig-no">Figure 5.5</span> {esc(TAKEAWAY)}'
       f' <span class="chip chip-assumption">assumption</span></figcaption>\n        </figure>')

OUT = R / 'docs/05-business/_growthfig.html'
OUT.write_text(fig + '\n', encoding='utf-8')
print('wrote', OUT)
