import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import terser from '@rollup/plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import analyze from 'rollup-plugin-analyzer';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

const production = !process.env.ROLLUP_WATCH;

// Get package version from package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const version = pkg.version;

function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = spawn(
                'npm',
                ['run', 'start', '--', '--dev'],
                {
                    stdio: ['ignore', 'inherit', 'inherit'],
                    shell: true,
                }
            );

            process.on('SIGTERM', toExit);
            process.on('exit', toExit);
        },
    };
}

function make_config(input, output, name, extra_plugins) {
    let default_plugins = [
        resolve({
            browser: true,
            dedupe: ['svelte'],
        }),
        commonjs(),
        postcss({
            extensions: ['.css'],
            inject: true,  // Inject CSS into JS
            extract: false, // Don't extract to separate files
            minimize: production,
            // Using a simple configuration without special handling for FontAwesome
            use: [],
            // Set baseDirectories to include node_modules for proper resolution
            loaders: [
                {
                    name: 'css',
                    test: /\.css$/,
                    options: {
                        // This helps with path resolution for imports
                        importLoaders: 1,
                        modules: false
                    }
                }
            ]
        }),
        typescript({
            sourceMap: !production,
            inlineSources: !production,
        }),
        production && terser(),
        production && analyze({ summaryOnly: true }),
    ];
    return {
        input: input,
        output: {
            sourcemap: !production,
            format: 'umd',
            name: name,
            dir: output,
        },
        plugins: [...extra_plugins, ...default_plugins.filter(Boolean)],
        watch: {
            clearScreen: false,
        },
    };
}

let svelte_plugins = [
    svelte({
        preprocess: sveltePreprocess({
            sourceMap: !production,
        }),
        compilerOptions: {
            dev: !production,
        },
        emitCss: false, // Keep CSS in components
    }),
    json({ compact: true }),
    replace({
        preventAssignment: true,
        values: {
            'process.env.VERSION': JSON.stringify(version),
            'process.env.BUILD_DATE': JSON.stringify(new Date().toISOString()),
            'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development')
        }
    }),
    !production && serve(),
    !production && livereload('public'),
].filter(Boolean);

export default [
    make_config(
        'src/extensions/quizdownHighlight.ts',
        'public/build/extensions/',
        'quizdownHighlight',
        []
    ),
    make_config(
        'src/extensions/quizdownKatex.ts',
        'public/build/extensions/',
        'quizdownKatex',
        []
    ),
    make_config('src/quizdown.ts', 'public/build/', 'quizdown', svelte_plugins),
];