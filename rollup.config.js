import {rollupPluginHTML} from '@web/rollup-plugin-html';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default {
    input: 'public/index.html',
    output: {
        dir: 'dist',
        format: 'es'
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        rollupPluginHTML({
            input: 'public/*.html',
        }),
        copy({
            targets: [
                {src: 'README.md', dest: 'dist'},
                {src: 'public/netlify.toml', dest: 'dist'}
            ]
        })
    ]
};