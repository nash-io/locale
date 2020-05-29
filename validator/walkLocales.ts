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
  clone: () => unknown
  forEach: (callback: (value: string) => void) => void
}

export interface TraversalData {
  defaultTraversal: Traversal
  translationTraversal: Traversal
  locale: string
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
    const translationFileName = localesPath.split('/').splice(-1)[0]
    const fileInfo = {
      path: localesPath,
      name: translationFileName,
      isFile: true,
      isDirectory: false,
      isSymlink: false,
    }
    walker(fileInfo, {
      defaultTraversal,
      translationTraversal,
      locale: translationFileName.replace(/\.json$/, ''),
    })
    return
  }

  for (const fileInfo of walkSync(localesPath)) {
    if (!fileInfo.isFile || fileInfo.name === defaultLocaleFileName) {
      continue
    }
    const translation = readJsonSync(fileInfo.path)
    const translationTraversal = traverse(translation)
    walker(fileInfo, {
      defaultTraversal,
      translationTraversal,
      locale: fileInfo.name.replace(/\.json$/, ''),
    })
  }
}
