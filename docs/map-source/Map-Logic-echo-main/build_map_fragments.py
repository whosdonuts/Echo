import json

HERO_SLUGS = {
    "concrete-beach",
    "weldon-library",
    "western-community-centre-ucc",
    "university-college",
    "richard-ivey-school-of-business",
    "lawson-hall",
    "renaissance-square-uwo",
    "modern-stonehenge",
    "the-fries",
    "weldon-library-tetris-wall"
}

with open("pogomap_cleaned.json", "r", encoding="utf-8") as f:
    data = json.load(f)

xs = [float(item["x_decoded"]) for item in data]
ys = [float(item["y_decoded"]) for item in data]

min_x, max_x = min(xs), max(xs)
min_y, max_y = min(ys), max(ys)

fragments = []

for item in data:
    x = float(item["x_decoded"])
    y = float(item["y_decoded"])

    normalized_x = (x - min_x) / (max_x - min_x)
    normalized_y = (y - min_y) / (max_y - min_y)

    fragments.append({
        "id": f'frag-{item["slug"]}',
        "name": item["name"],
        "slug": item["slug"],
        "mapX": x,
        "mapY": y,
        "normalizedX": normalized_x,
        "normalizedY": normalized_y,
        "hero": item["slug"] in HERO_SLUGS,
        "accessible": True,
        "momentIds": []
    })

with open("echoes_map_fragments.json", "w", encoding="utf-8") as f:
    json.dump(fragments, f, indent=2)

print(f"Built {len(fragments)} map fragments")