import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

const literalPattern1 = '\\x20\\x20\\x20\\x20\\x20\\x20\\x20#define\\x20saturate(a)\\x20clamp(a,\\x200.0,\\x201.0)'
const literalReplacement1 = '\\x20\\x20\\x20\\x20\\x20\\x20\\x20#ifndef\\x20saturate\\x0a#define\\x20saturate(a)\\x20clamp(\\x20a,\\x200.0,\\x201.0\\x20)\\x0a#endif'

const literalPattern2 = '\\x23define\\x20saturate(a)\\x20clamp(\\x20a,\\x200.0,\\x201.0\\x20)'
const literalReplacement2 = '#ifndef\\x20saturate\\x0a#define\\x20saturate(a)\\x20clamp(\\x20a,\\x200.0,\\x201.0\\x20)\\x0a#endif'

function patchShader(content: string): string {
  let patched = content
  if (content.includes(literalPattern1)) {
    patched = patched.replace(literalPattern1, literalReplacement1)
  }
  if (content.includes(literalPattern2)) {
    patched = patched.replace(literalPattern2, literalReplacement2)
  }
  return patched
}

function patchXViewerFile() {
  const filePath = path.join(process.cwd(), 'node_modules/@x-viewer/core/dist/index.esm.js')
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8')
    const patched = patchShader(content)
    
    if (patched !== content) {
      fs.writeFileSync(filePath, patched)
      console.log('[fix-shader-macro] Patched @x-viewer/core for saturate macro conflict')
    }
  }
}

export default function fixShaderMacro(): Plugin {
  return {
    name: 'fix-shader-macro',
    config() {
      patchXViewerFile()
    },
  }
}
