import { readJsonSync, walkSync } from 'https://deno.land/std/fs/mod.ts'
import traverse from 'https://cdn.pika.dev/traverse@^0.6.6'

export interface FileInfo {
  path: string
  name: string
  isFile: boolean
  isDirectory: boolean
  isSymlink: boolean
}

export interface TraverseContext {
  path: string[]
  notLeaf: boolean
  isLeaf: boolean
}

export interface Traversal {
  get: (path: string[]) => unknown
  forEach: (callback: (value: string) => void) => void
}

export interface TraversalData {
  defaultTraversal: Traversal
  translationTraversal: Traversal
}

type Walker = (fileInfo: FileInfo, data: TraversalData) => void

export default function walkLocales(
  defaultLocalePath: string,
  localesPath: string,
  walker: Walker,
) {
  const defaultLocaleFileName = defaultLocalePath.split('/').splice(-1)[0]
  const defaultLocaleJson = readJsonSync(defaultLocalePath)
  const defaultTraversal = traverse(defaultLocaleJson)

  if (localesPath.endsWith('.json')) {
    const translation = readJsonSync(localesPath)
    const translationTraversal = traverse(translation)
    const fileInfo = {
      path: localesPath,
      name: localesPath.split('/').splice(-1)[0],
      isFile: true,
      isDirectory: false,
      isSymlink: false,
    }
    walker(fileInfo, { defaultTraversal, translationTraversal })
    return
  }

  for (const fileInfo of walkSync(localesPath)) {
    if (!fileInfo.isFile || fileInfo.name === defaultLocaleFileName) {
      continue
    }
    const translation = readJsonSync(fileInfo.path)
    const translationTraversal = traverse(translation)
    walker(fileInfo, { defaultTraversal, translationTraversal })
  }
}
