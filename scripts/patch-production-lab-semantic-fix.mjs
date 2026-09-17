import { readFileSync, writeFileSync } from 'node:fs'

const path = 'src/core/ProductionLab.tsx'
let text = readFileSync(path, 'utf8')
const before = "            id: nodeId, ownerScreenId: screen.id, title: annotation.type === 'note' ? 'Observation' : 'Annotation', text: annotation.text ?? '', reference: '',\n            x: screen.x + MASTER_WIDTH + 70, y: screen.y + 80 + index * 32,"
const after = "            id: nodeId, ownerScreenId: screen.id, title: annotation.type === 'note' ? 'Observation' : 'Annotation', text: annotation.text ?? '', reference: '', tags: ['NOTE'],\n            x: screen.x + MASTER_WIDTH + 70, y: screen.y + 80 + index * 32,"
const found = text.split(before).length - 1
if (found !== 1) throw new Error(`expected one migrated-node pattern, found ${found}`)
text = text.replace(before, after)
writeFileSync(path, text)
console.log('Migrated review nodes now carry NOTE tags.')
