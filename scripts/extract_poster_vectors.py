"""Extract original SVG regions without changing opacity, paths, or typography.

Requires PyMuPDF and svgelements. Crops retain original vectors and embedded
portraits; unused objects and glyph definitions are removed from each file.
"""
from pathlib import Path
from copy import deepcopy
import re
import sys
import xml.etree.ElementTree as ET
import fitz
from svgelements import Path as SVGPath, Matrix

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'tmp' / '海报a0主图.pdf'
ASSETS = ROOT / 'dist' / 'assets'
REGIONS = {
    'poster-background': (0, 0, 3370.39, 2383.94),
    'poster-actors': (2810, 350, 3358, 2000),
    'poster-birth-cohorts': (850, 1910, 1890, 2290),
    'poster-age-range': (2430, 1910, 2845, 2290),
    'poster-weave': (80, 430, 2910, 1905),
}
source = fitz.open(SOURCE)
original = ET.fromstring(source[0].get_svg_image(text_as_path=True))
NS = '{http://www.w3.org/2000/svg}'
HREF = '{http://www.w3.org/1999/xlink}href'
ET.register_namespace('', NS[1:-1])
ET.register_namespace('xlink', HREF[1:HREF.index('}')])
definitions = {e.get('id'): e for e in original.iter() if e.get('id')}

def compose(p, q):
    a,b,c,d,e,f = p
    A,B,C,D,E,F = q
    return (a*A+c*B,b*A+d*B,a*C+c*D,b*C+d*D,a*E+c*F+e,b*E+d*F+f)

def prune(element, parent, clip, name):
    local = Matrix(element.get('transform', 'matrix(1,0,0,1,0,0)'))
    world = compose(parent, (local.a,local.b,local.c,local.d,local.e,local.f))
    kind = element.tag.removeprefix(NS)
    if kind == 'g':
        for child in list(element):
            if not prune(child, world, clip, name):
                element.remove(child)
        return len(element) > 0
    target = definitions.get(element.get(HREF, '').lstrip('#')) if kind == 'use' else element
    if target is None:
        return False
    if target.tag == f'{NS}image':
        w, h = float(target.get('width')), float(target.get('height'))
        path = SVGPath(f'M0 0H{w}V{h}H0Z')
    else:
        path = SVGPath(target.get('d', 'M0 0'))
    path *= Matrix(*world)
    bbox = path.bbox()
    if bbox is None:
        return False
    rect = fitz.Rect(bbox)
    visible = rect + (-3,-3,3,3)
    if not visible.intersects(clip):
        return False
    if name == 'poster-background':
        return kind == 'path' and ((abs(rect.x0-950.367)<1 and rect.height>2700) or element.get('fill') == '#00206a')
    if name == 'poster-actors' and rect.x0 < 2800 and rect.width > 300 and element.get('fill') != '#00206a':
        return False
    if name == 'poster-weave':
        # Adjacent role labels share the source page, not this subfigure.
        if rect.x0 > 2800 and rect.y0 > 1000:
            return False
        fill = element.get('fill', '').lower()
        series = None
        if rect.width > 1800 and rect.height > 500:
            series = 'cases' if fill == '#d7cef4' else ('mmr2' if rect.y0 > 570 else 'mmr1') if fill == '#ddf1f4' else None
        if fill == '#f92d59':
            series = 'deaths'
        if kind == 'path' and 5 < rect.width < 15 and abs(rect.width-rect.height) < 2:
            center_y = (rect.y0+rect.y1)/2
            if fill == '#d7cef4':
                series = 'cases'
            elif fill == '#ddf1f4':
                for low, split, high in [(490,570,622),(1050,1130,1207),(1530,1575,1691)]:
                    if low < center_y < high:
                        series = 'mmr1' if center_y < split else 'mmr2'
        if series:
            element.set('class', f'weave-series series-{series}')
    return True

for name, bounds in REGIONS.items():
    if len(sys.argv) > 1 and name not in sys.argv[1:]:
        continue
    page = source[0]
    clip = fitz.Rect(bounds)
    root = deepcopy(original)
    root.set('viewBox', ' '.join(map(str, (clip.x0,clip.y0,clip.width,clip.height))))
    root.set('width', str(clip.width))
    root.set('height', str(clip.height))
    root.set('preserveAspectRatio', 'xMidYMid meet')
    scene = list(root)[1]
    prune(scene, (1,0,0,1,0,0), clip, name)
    defs = root.find(f'{NS}defs')
    refs = set()
    def collect_refs(node):
        for child in node.iter():
            for value in child.attrib.values():
                refs.update(re.findall(r'url\(#([^)]*)\)', value))
            if child.get(HREF, '').startswith('#'):
                refs.add(child.get(HREF)[1:])
    collect_refs(scene)
    visited = set()
    while refs - visited:
        identifier = next(iter(refs - visited))
        visited.add(identifier)
        if identifier in definitions:
            collect_refs(definitions[identifier])
    for node in list(defs):
        if node.get('id') not in refs:
            defs.remove(node)
    retained = {node.get('id') for node in root.iter() if node.get('id')}
    for identifier in refs - retained:
        if identifier in definitions:
            defs.append(deepcopy(definitions[identifier]))
    # Prefix local IDs so several inline subfigures can coexist on the page.
    svg = ET.tostring(root, encoding='unicode')
    svg = re.sub(r'id="([^"]+)"', lambda m: f'id="{name}-{m[1]}"', svg)
    svg = re.sub(r'url\(#([^)]*)\)', lambda m: f'url(#{name}-{m[1]})', svg)
    svg = re.sub(r'xlink:href="#([^"]+)"', lambda m: f'xlink:href="#{name}-{m[1]}"', svg)
    (ASSETS / f'{name}.svg').write_text(svg, encoding='utf-8')
    page.get_pixmap(matrix=fitz.Matrix(.5,.5), clip=clip).save(ROOT.parent / 'tmp' / f'{name}-review.png')
    print(name, len(svg))
