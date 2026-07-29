/**
 * Architecture Contract Tests
 *
 * Verifies that Clean Architecture layer boundaries are respected.
 *
 * ## Rules verified:
 *
 * 1. **Domain** (`src/domain/`) must NOT import from:
 *    - Infrastructure (`src/infrastructure/`)
 *    - Pages/Interfaces (`src/pages/`)
 *    - Database (`src/db/`)
 *
 * 2. **Application** (`src/application/`) must NOT import from:
 *    - Infrastructure (`src/infrastructure/`)
 *    - Pages/Interfaces (`src/pages/`)
 *    - Database (`src/db/`)
 *
 * 3. **Infrastructure** (`src/infrastructure/`) must NOT import from:
 *    - Application (`src/application/`)
 *    - Pages/Interfaces (`src/pages/`)
 *
 * These are import-resolution checks. If a violation exists, the test
 * will list the offending files and the specific import paths.
 *
 * @see docs/architecture.md
 * @see CONTEXT.md — Ubiquitous Language & Glossary
 */

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SRC_DIR = path.resolve(import.meta.dirname ?? __dirname, '..') // resolves to src/

/** Extract the path from every `from '…'` or `from "…"` statement. */
function extractImportPaths(source: string): string[] {
  const paths: string[] = []
  const re = /from\s+['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = re.exec(source)) !== null) {
    paths.push(match[1])
  }

  // Also catch dynamic imports: import('…')
  const dynamicRe = /import\s*\(['"]([^'"]+)['"]\)/g
  while ((match = dynamicRe.exec(source)) !== null) {
    paths.push(match[1])
  }

  // Also catch require(): require('…')
  const requireRe = /require\s*\(['"]([^'"]+)['"]\)/g
  while ((match = requireRe.exec(source)) !== null) {
    paths.push(match[1])
  }

  return paths
}

/** Recursively walk a directory and yield all `.ts` file paths. */
function* walkTsFiles(dir: string, excludeTestFiles = false): Generator<string> {
  if (!fs.existsSync(dir)) return

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      yield* walkTsFiles(fullPath, excludeTestFiles)
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      // Skip test files when the caller asks
      if (excludeTestFiles && entry.name.endsWith('.test.ts')) continue
      // Skip declaration files
      if (entry.name.endsWith('.d.ts')) continue
      yield fullPath
    }
  }
}

/**
 * Check that none of the files under `layerDir` import from forbidden directories.
 * Returns a list of human-readable violation strings (empty = clean).
 */
function checkLayerImports(
  layerDir: string,
  label: string,
  forbidden: string[],
  excludeTestFiles = false,
): string[] {
  const violations: string[] = []

  for (const filePath of walkTsFiles(layerDir, excludeTestFiles)) {
    const source = fs.readFileSync(filePath, 'utf-8')
    const importPaths = extractImportPaths(source)

    for (const importPath of importPaths) {
      for (const forbidden of forbidden) {
        if (
          importPath === forbidden ||
          importPath.startsWith(`${forbidden}/`) ||
          importPath.includes(`/${forbidden}/`) ||
          importPath.startsWith(`@/${forbidden}`)
        ) {
          const relativePath = path.relative(SRC_DIR, filePath)
          violations.push(`  ❌ ${relativePath} imports from "${forbidden}" via: ${importPath}`)
        }
      }
    }
  }

  return violations
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('🧱 Clean Architecture layer boundaries', () => {
  // -----------------------------------------------------------------------
  // Rule 1: Domain must be pure — no infrastructure, pages, or db
  // -----------------------------------------------------------------------
  it('domain layer must not import from infrastructure, pages, or db', () => {
    const domainDir = path.resolve(SRC_DIR, 'domain')
    const violations = checkLayerImports(
      domainDir,
      'Domain',
      ['infrastructure', 'pages', 'db'],
      false, // don't exclude test files — even tests in domain should be pure
    )

    if (violations.length > 0) {
      console.log(`\n⚠️  Domain layer violations (${violations.length}):`)
      violations.forEach((v) => console.log(v))
    }

    expect(violations).toHaveLength(0)
  })

  // -----------------------------------------------------------------------
  // Rule 2: Application depends only on domain interfaces, not infrastructure
  // -----------------------------------------------------------------------
  it('application layer must not directly import from infrastructure, pages, or db', () => {
    const appDir = path.resolve(SRC_DIR, 'application')
    const violations = checkLayerImports(
      appDir,
      'Application',
      ['infrastructure', 'pages', 'db'],
      true, // exclude test files — application tests may use mocks that import vitest
    )

    if (violations.length > 0) {
      console.log(`\n⚠️  Application layer violations (${violations.length}):`)
      violations.forEach((v) => console.log(v))
    }

    expect(violations).toHaveLength(0)
  })

  // -----------------------------------------------------------------------
  // Rule 3: Infrastructure implements domain ports — should not reach up
  //         to application or pages
  // -----------------------------------------------------------------------
  it('infrastructure layer must not import from application or pages', () => {
    const infraDir = path.resolve(SRC_DIR, 'infrastructure')
    const violations = checkLayerImports(
      infraDir,
      'Infrastructure',
      ['application', 'pages'],
      true, // exclude test files
    )

    if (violations.length > 0) {
      console.log(`\n⚠️  Infrastructure layer violations (${violations.length}):`)
      violations.forEach((v) => console.log(v))
    }

    expect(violations).toHaveLength(0)
  })
})
