import json
import base64

def b64decode_safe(value):
    try:
        return base64.b64decode(value).decode("utf-8")
    except Exception:
        return value

with open("pogomap_raw.json", "r", encoding="utf-8") as f:
    data = json.load(f)

cleaned = []

for raw_id, item in data.items():
    cleaned.append({
        "raw_id": raw_id,
        "id_decoded": b64decode_safe(item.get("zfgs62", "")),
        "name": item.get("rfs21d", ""),
        "slug": item.get("rgqaca", ""),
        "x_decoded": b64decode_safe(item.get("z3iafj", "")),
        "y_decoded": b64decode_safe(item.get("f24sfvs", "")),
        "type_code": b64decode_safe(item.get("xgxg35", "")),
        "type_code_2": b64decode_safe(item.get("y74hda", "")),
        "showcase_status": item.get("showcase_status"),
        "exraid_status": item.get("exraid_status"),
        "verified": item.get("verified"),
    })

with open("pogomap_cleaned.json", "w", encoding="utf-8") as f:
    json.dump(cleaned, f, indent=2)