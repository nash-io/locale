import { readJsonSync, walkSync } from 'https://deno.land/std/fs/mod.ts'
import traverse from 'https://cdn.pika.dev/traverse@^0.6.6'

interface FileInfo {
  path: string
  name: string
  isFile: boolean
  isDirectory: boolean
  isSymlink: boolean
}

interface TraverseContext {
  path: string[]
  notLeaf: boolean
  isLeaf: boolean
}

const en = readJsonSync('./locales/en.json')
const enTraversal = traverse(en)

interface CallbackData {
  enTraversal: typeof enTraversal
  translationTraversal: typeof enTraversal
}
type Callback = (fileInfo: FileInfo, data: CallbackData) => void

export default function walkLocales(callback: Callback) {
  for (const fileInfo of walkSync('./locales/')) {
    if (!fileInfo.isFile || fileInfo.name === 'en.json') {
      continue
    }

    const translation = readJsonSync(fileInfo.path)
    const translationTraversal = traverse(translation)

    callback(fileInfo, { enTraversal, translationTraversal })
  }
}
