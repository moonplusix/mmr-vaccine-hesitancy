"""Export chart primitives, never inferred statistical series, from the reference."""
import json
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
drawings = fitz.open(ROOT.parent/'tmp'/'海报a0主图.pdf')[0].get_drawings()

def path(d):
    result=[]
    last=None
    for kind,*points in d['items']:
        if last != points[0]:
            result.append(f'M{points[0].x} {points[0].y}')
        if kind=='l':
            result.append(f'L{points[1].x} {points[1].y}')
        elif kind=='c':
            result.append('C'+' '.join(f'{p.x} {p.y}' for p in points[1:]))
        else:
            raise ValueError(kind)
        last=points[-1]
    return ''.join(result)

points=[]
for i in range(324,379):
    d=drawings[i]; b=d['rect']
    x=(b.x0+b.x1)/2; y=(b.y0+b.y1)/2
    points.append(dict(x=x,y=y,year=1958+round((x-940.594)/(1855.031-940.594)*56),hollow=d['color'] is not None))
age=[]
for year,median,index in [(2014,16,408),(2016,15,411),(2017,11,414),(2018,20,417)]:
    b=drawings[index]['rect']
    age.append(dict(year=year,median=median,x=b.x0,top=b.y0,bottom=b.y1,minApprox=round((2192.511-b.y1)/(2192.511-1975.734)*60),maxApprox=round((2192.511-b.y0)/(2192.511-1975.734)*60)))
data=dict(birthArea=path(drawings[323])+'Z',birthPoints=sorted(points,key=lambda p:p['x']),age=age)
(ROOT/'dist/cohort-geometry.js').write_text('// Reference geometry; approximate readings are not raw statistical data.\nexport const cohortGeometry = '+json.dumps(data,separators=(',',':'))+';\n',encoding='utf-8')
print('Exported',len(points),'birth-year points and',len(age),'age intervals.')
