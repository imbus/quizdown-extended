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
        // Add postcss plugin to handle CSS files
        postcss({
            extensions: ['.css'],
            minimize: production,
            extract: output + '/bundle.css'
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
            // Add postcss for processing styles in svelte components
            postcss: true,
        }),
        compilerOptions: {
            // enable run-time checks when not in production
            dev: !production,
        },
        // Extract component CSS into separate files
        emitCss: true,
    }),
    json({ compact: true }),
    // Replace version injector with @rollup/plugin-replace
    replace({
        preventAssignment: true,
        values: {
            'process.env.VERSION': JSON.stringify(version),
            'process.env.BUILD_DATE': JSON.stringify(new Date().toISOString()),
            'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development')
        }
    }),
    //live preview in dev mode
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