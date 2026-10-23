"""Export the independent semicircle legend, never a complete poster."""
from pathlib import Path
from copy import deepcopy
import xml.etree.ElementTree as ET
import re
import fitz
from svgelements import Path as SVGPath, Matrix

ROOT = Path(__file__).resolve().parents[1]
scope = {'__file__': str(ROOT / 'scripts/extract_poster_vectors.py')}
code = (ROOT / 'scripts/extract_poster_vectors.py').read_text(encoding='utf-8').split('for name, bounds in REGIONS.items():')[0]
exec(code, scope)
page = scope['source'][1]
original = ET.fromstring(page.get_svg_image(text_as_path=True))
scope['definitions'] = {e.get('id'): e for e in original.iter() if e.get('id')}
for name, bounds in [('media-legend', (100,610,930,1010))]:
    clip = fitz.Rect(bounds)
    root = deepcopy(original)
    root.set('viewBox', f'{clip.x0} {clip.y0} {clip.width} {clip.height}')
    root.set('width', str(clip.width))
    root.set('height', str(clip.height))
    scene = list(root)[1]
    scope['prune'](scene, (1,0,0,1,0,0), clip, name)
    # Remove page-sized background / map and long guides; retain glyphs and legend primitives.
    def clean(node, parent=(1,0,0,1,0,0)):
        local = Matrix(node.get('transform', 'matrix(1,0,0,1,0,0)'))
        world = scope['compose'](parent, (local.a,local.b,local.c,local.d,local.e,local.f))
        for child in list(node):
            if child.tag.endswith('g'):
                clean(child, world)
            elif child.tag.endswith('path'):
                m = Matrix(child.get('transform', 'matrix(1,0,0,1,0,0)'))
                p = SVGPath(child.get('d', 'M0 0'))
                p *= Matrix(*scope['compose'](world,(m.a,m.b,m.c,m.d,m.e,m.f)))
                box = p.bbox()
                if box and (box[2]-box[0]>500 or box[3]-box[1]>450):
                    node.remove(child)
    clean(scene)
    defs = root.find(f'{scope["NS"]}defs')
    refs = set()
    def collect(node):
        for child in node.iter():
            for value in child.attrib.values():
                refs.update(re.findall(r'url\(#([^)]*)\)', value))
            href = child.get(scope['HREF'], '')
            if href.startswith('#'):
                refs.add(href[1:])
    collect(scene)
    visited = set()
    while refs - visited:
        identifier = next(iter(refs - visited))
        visited.add(identifier)
        if identifier in scope['definitions']:
            collect(scope['definitions'][identifier])
    for node in list(defs):
        if node.get('id') not in refs:
            defs.remove(node)
    (ROOT / 'dist/assets' / f'{name}.svg').write_text(ET.tostring(root, encoding='unicode'), encoding='utf-8')
    page.get_pixmap(matrix=fitz.Matrix(1,1),clip=clip).save(ROOT.parent/'tmp'/f'{name}-check.png')
