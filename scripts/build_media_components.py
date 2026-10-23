"""Measure reference semicircles as primitives and reuse only image components."""
import base64
import json
import re
from io import BytesIO
from pathlib import Path
import xml.etree.ElementTree as ET
import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
page = fitz.open(ROOT.parent / 'tmp' / '海报a0主图.pdf')[1]
drawings = page.get_drawings()
groups = [range(263,268), range(251,263), range(1425,1438), range(1438,1451), range(1451,1466), range(1472,1483), range(1466,1472)]
geometry = []
def color(value):
    return '#' + ''.join(f'{round(v*255):02x}' for v in value) if value else None
for indices in groups:
    parts = []
    for index in indices:
        drawing = drawings[index]
        items = drawing['items']
        assert len(items) == 2 and all(item[0] == 'c' for item in items)
        start, end = items[0][1], items[-1][-1]
        radius = (end.x-start.x)/2
        assert radius > 0
        parts.append(dict(cx=round((start.x+end.x)/2,3), cy=round((start.y+end.y)/2,3), r=round(radius,3), lower=items[0][2].y>start.y, fill=color(drawing.get('fill')), stroke=color(drawing.get('color')), curves=[[[point.x,point.y] for point in item[1:]] for item in items]))
    geometry.append(parts)

# Parse the source only at build time; never ship the complete poster artwork.
original = ET.fromstring(page.get_svg_image())
parents = {child:node for node in original.iter() for child in node}
def opacity(node):
    value = 1.0
    while node is not None:
        value *= float(node.get('opacity', 1))
        node = parents.get(node)
    return value
def matching_path(drawing, paint):
    start,end=drawing['items'][0][1],drawing['items'][-1][-1]
    for node in original.iter():
        if not node.tag.endswith('path') or node.get(paint) in (None,'none'):
            continue
        values=[float(v) for v in re.findall(r'-?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?',node.get('transform',''))]
        if len(values)!=6 or values[:4]!=[1,0,0,-1] or abs(values[4]-start.x)>.005 or abs(values[5]-start.y)>.005:
            continue
        numbers=[float(v) for v in re.findall(r'-?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?',node.get('d',''))]
        if len(numbers)>=4 and abs(values[4]+numbers[-2]-end.x)<.005 and abs(values[5]-numbers[-1]-end.y)<.005:
            return node
    return None
for indices,parts in zip(groups,geometry):
    for index,part in zip(indices,parts):
        drawing=drawings[index]
        if part['fill']:
            node=matching_path(drawing,'fill')
            assert node is not None, ('Missing fill',index)
            part['fillOpacity']=opacity(node)*float(node.get('fill-opacity',1))
        if part['stroke']:
            node=matching_path(drawing,'stroke')
            assert node is not None, ('Missing stroke',index)
            part['strokeOpacity']=opacity(node)*float(node.get('stroke-opacity',1))
            part['strokeWidth']=float(node.get('stroke-width',1))
(ROOT/'dist/media-geometry.js').write_text('// Independent semicircle control points and paint; reference geometry, not article counts.\nexport const discGeometry = '+json.dumps(geometry,separators=(',',':'))+';\n',encoding='utf-8')
def path_data(drawing):
    commands=[]
    last=None
    for item in drawing['items']:
        if last is None or item[1] != last:
            commands.append(f'M{item[1].x} {item[1].y}')
        if item[0]=='c':
            commands.append('C'+' '.join(f'{point.x} {point.y}' for point in item[2:]))
        elif item[0]=='l':
            commands.append(f'L{item[2].x} {item[2].y}')
        last=item[-1]
    return ''.join(commands)
band_node=next(node for node in original.iter() if node.get('fill')=='#ffffff' and '477.774' in node.get('transform',''))
film_node=next(node for node in original.iter() if node.get('id')=='image_4850')
film_matrix=parents[film_node].get('transform')
guides=[]
for index in [1407,1408,1409,5525,5526,5527,5528]:
    drawing=drawings[index]
    node=matching_path(drawing,'stroke')
    guides.append(dict(d=path_data(drawing),width=drawing['width'],stroke=color(drawing['color']),opacity=opacity(node) if node is not None else drawing['stroke_opacity'],dash='.01 9' if index==1409 else '.01 5',cap='round' if drawing['lineCap'][0]==1 else 'butt'))
veils=[]
for index,clip in [(6655,[985,530,400,790]),(6656,[1470,350,400,790])]:
    node=matching_path(drawings[index],'fill')
    assert node is not None, ('Missing backdrop',index)
    veils.append(dict(d=path_data(drawings[index])+'Z',fill=color(drawings[index]['fill']),opacity=opacity(node),clip=clip))
components=dict(ribbon=dict(d=path_data(drawings[1488])+'Z',fill='#ffffff',opacity=opacity(band_node)),guides=guides,veils=veils,film=dict(transform=film_matrix,width=int(film_node.get('width')),height=int(film_node.get('height'))))
# Preserve the original article-mark layout separately from the newer coding workbook.
components['drops']=[dict(d=path_data(d)+'Z',fill=color(d['fill']),x=d['rect'].x0,y=d['rect'].y0) for d in drawings if len(d['items'])==7 and abs(d['rect'].width-12.837)<.06 and abs(d['rect'].height-15.347)<.06 and d['fill'] and d['rect'].y0>800 and d['rect'].x0>450]
components['photos']=[]
for identifier,filename in [('image_696','media-press-1998.webp'),('image_708','media-press-2007-right.webp'),('image_711','media-press-2007.webp'),('image_714','media-press-2010-right.webp'),('image_717','media-press-2010.webp'),('image_5552','media-talk-2016.webp')]:
    node=next(node for node in original.iter() if node.get('id')==identifier)
    components['photos'].append(dict(asset=filename,transform=parents[node].get('transform'),width=int(node.get('width')),height=int(node.get('height'))))
components['documents']=[]
for identifier in ['image_2293','image_2302','image_3032','image_3766','image_3769','image_3771','image_3774','image_3776','image_4847','image_4853','image_4855','image_4858','image_4860','image_4863','image_4865','image_5527','image_5530','image_5537','image_5539','image_5541','image_5543','image_5545','image_5547']:
    node=next(node for node in original.iter() if node.get('id')==identifier)
    filename='reference-document-'+identifier.removeprefix('image_')+'.webp'
    bitmap=Image.open(BytesIO(base64.b64decode(node.get('{http://www.w3.org/1999/xlink}href').split(',',1)[1])))
    bitmap.save(ROOT/'dist/assets'/filename,'WEBP',quality=94,method=6)
    components['documents'].append(dict(asset=filename,transform=parents[node].get('transform'),width=int(node.get('width')),height=int(node.get('height'))))
(ROOT/'dist/media-lines.js').write_text('// Independently rendered line and image placement components measured from the reference.\nexport const mediaLines = '+json.dumps(components,separators=(',',':'))+';\n',encoding='utf-8')
for identifier, filename in [('image_696','media-press-1998.webp'), ('image_708','media-press-2007-right.webp'), ('image_711','media-press-2007.webp'), ('image_714','media-press-2010-right.webp'), ('image_717','media-press-2010.webp'), ('image_5552','media-talk-2016.webp'), ('image_4850','media-screen.webp')]:
    node = next(node for node in original.iter() if node.get('id') == identifier)
    bitmap = Image.open(BytesIO(base64.b64decode(node.get('{http://www.w3.org/1999/xlink}href').split(',',1)[1])))
    bitmap.thumbnail((1200,900))
    bitmap.save(ROOT/'dist/assets'/filename,'WEBP',quality=94,method=6)
print('Measured',sum(map(len,geometry)),'semicircles; exported',len(components['drops']),'article marks, six photos and',len(components['documents']),'document images.')
