"""Extract a quiet British Isles silhouette from Natural Earth public domain GeoJSON."""

import json
from pathlib import Path


source = Path(__file__).parents[2] / "tmp" / "ne_50m_admin_0_countries.geojson"
target = Path(__file__).parents[1] / "dist" / "assets" / "british-isles.svg"
features = json.loads(source.read_text(encoding="utf-8"))["features"]


def polygons(geometry):
    if geometry["type"] == "MultiPolygon":
        return geometry["coordinates"]
    return [geometry["coordinates"]]


def point(lon, lat):
    return round((lon + 12) * 80 * 0.59, 1), round((61 - lat) * 80, 1)


paths = []
for feature in features:
    name = feature["properties"].get("ADMIN")
    if name not in {"United Kingdom", "Ireland"}:
        continue
    pieces = []
    for polygon in polygons(feature["geometry"]):
        for ring in polygon:
            coords = [point(*coordinate[:2]) for coordinate in ring]
            pieces.append("M" + " L".join(f"{x},{y}" for x, y in coords) + "Z")
    paths.append(f'<path d="{" ".join(pieces)}"/>')

target.write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 1000" '
    'aria-hidden="true"><g fill="#4f77b1" fill-opacity=".43" fill-rule="evenodd">'
    + "".join(paths)
    + "</g></svg>",
    encoding="utf-8",
)
print(target)
