"""Compare the independently rendered curve components with the PDF geometry."""
import json
import re
from pathlib import Path
import fitz

ROOT=Path(__file__).resolve().parents[1]
drawings=fitz.open(ROOT.parent/'tmp/海报a0主图.pdf')[1].get_drawings()
def module(name,export):
    return json.loads((ROOT/'dist'/name).read_text(encoding='utf-8').split(f'export const {export} = ')[1].rstrip(';\n'))
def multiply(a,b):
    out=[0]*(len(a)+len(b)-1)
    for i,x in enumerate(a):
        for j,y in enumerate(b):out[i+j]+=x*y
    return out
def curve_area(points):
    def polynomial(v):return [v[0],3*(v[1]-v[0]),3*(v[2]-2*v[1]+v[0]),v[3]-3*v[2]+3*v[1]-v[0]]
    x=polynomial([p[0] for p in points]);y=polynomial([p[1] for p in points])
    dx=[i*x[i] for i in range(1,4)];dy=[i*y[i] for i in range(1,4)]
    return sum((a-b)/(i+1) for i,(a,b) in enumerate(zip(multiply(x,dy),multiply(y,dx))))/2
def area(items):
    cross=lambda p,q:(p[0]*q[1]-q[0]*p[1])/2
    value=0;first=items[0][1];last=first
    for kind,*points in items:
        value+=curve_area(points) if kind=='c' else cross(points[0],points[1]);last=points[-1]
    return abs(value+cross(last,first))
def svg_items(path):
    current=None;out=[]
    for command,coordinates in re.findall(r'([MLC])([^MLCZ]+)',path):
        values=[float(v) for v in coordinates.split()]
        points=list(zip(values[::2],values[1::2]))
        if command=='M':current=points[0]
        else:out.append((command.lower(),current,*points));current=points[-1]
    return out

geometry=module('media-geometry.js','discGeometry')
components=module('media-lines.js','mediaLines')
groups=[range(263,268),range(251,263),range(1425,1438),range(1438,1451),range(1451,1466),range(1472,1483),range(1466,1472)]
differences=[]
for indices,parts in zip(groups,geometry):
    for index,part in zip(indices,parts):
        native=[('c',*curve) for curve in part['curves']]
        differences.append(abs(area(native)-area(drawings[index]['items'])))
reference=area(drawings[1488]['items'])
rendered=area(svg_items(components['ribbon']['d']))
assert max(differences)<1e-8 and abs(reference-rendered)<1e-8
assert all(p['strokeWidth']==1 for parts in geometry for p in parts if p['stroke'])
report=dict(reference_band_area_pdf_pt2=reference,current_band_area_pdf_pt2=rendered,band_area_difference_pdf_pt2=abs(reference-rendered),semicircle_parts=sum(map(len,geometry)),current_control_point_max_area_difference_pdf_pt2=max(differences),current_stroke_widths_pdf_pt=[1.0],reference_band_opacity=components['ribbon']['opacity'],film_transform=components['film']['transform'])
(ROOT/'GEOMETRY_AUDIT_20261022.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
