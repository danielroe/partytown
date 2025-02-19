import { BuildOptions, copyOutputToTests, fileSize, jsBannerPlugin, versionPlugin } from './utils';
import { join } from 'path';
import { minifyPlugin } from './minify';
import type { OutputOptions, RollupOptions } from 'rollup';

export function buildMainSnippet(opts: BuildOptions): RollupOptions {
  const partytownDebug: OutputOptions = {
    file: join(opts.distLibDebugDir, 'partytown.js'),
    format: 'es',
    exports: 'none',
    plugins: [versionPlugin(opts), ...minifyPlugin(opts, true)],
  };

  const partytownMin: OutputOptions = {
    file: join(opts.distLibDir, 'partytown.js'),
    format: 'es',
    exports: 'none',
    plugins: [
      ...minifyPlugin(opts, false),
      {
        name: 'snippetClosure',
        generateBundle(opts, bundle) {
          for (const f in bundle) {
            const b = bundle[f];
            if (b.type === 'chunk') {
              b.code = b.code.replace(`"use strict";`, ``).trim();
            }
          }
        },
      },
      fileSize(),
    ],
  };

  const output = [partytownDebug];
  if (!opts.isDev) {
    output.push(partytownMin);
  }

  return {
    input: join(opts.tscLibDir, 'main', 'snippet-entry.js'),
    output,
    plugins: [jsBannerPlugin(opts), copyOutputToTests(opts)],
  };
}
