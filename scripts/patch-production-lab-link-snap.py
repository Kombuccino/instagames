from pathlib import Path
p=Path('src/core/ProductionLab.tsx')
s=p.read_text()
old="  function nearestMagnet(world: Point, thresholdPx: number, exclude?: LinkEndpoint) {\n"
new="  function nearestMagnet(world: Point, thresholdPx: number, exclude?: LinkEndpoint): { endpoint: LinkEndpoint; point: Point; distance: number } | null {\n"
assert old in s
s=s.replace(old,new,1)
s=s.replace("    return best\n  }\n\n  function resolveEndpointAt", "    return best as { endpoint: LinkEndpoint; point: Point; distance: number } | null\n  }\n\n  function resolveEndpointAt", 1)
p.write_text(s)
