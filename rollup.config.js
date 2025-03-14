import {rollupPluginHTML} from '@web/rollup-plugin-html';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';

// A shared HTML transform function for both index.html and 404.html
const transformHTMLFunction = html => {
  // Clean up the HTML by removing empty lines and comment placeholders
  html = html.replace(/<!-- Bootstrap CSS -->\s+/g, '');
  html = html.replace(/<!-- Bootstrap Icons CSS -->\s+/g, '');
  html = html.replace(/<!-- Font Awesome CSS -->\s+/g, '');

  // Remove any existing script tags except the README.md loader
  html = html.replace(/<script src="[^>]*><\/script>\s*/g, '');

  // Remove any existing CSS links
  html = html.replace(/<link rel="stylesheet" href="[^>]*>\s*/g, '');

  // Add our bundle CSS link properly
  html = html.replace('</head>', '  <link rel="stylesheet" href="bundle.css">\n</head>');

  // Save the README.md loader script but remove other scripts
  const readmeScript = html.match(/<script>[\s\S]*?fetch\(['"]\.\/README\.md['"]\)[\s\S]*?<\/script>/);
  html = html.replace(/<script>[\s\S]*?<\/script>/g, '');

  // Add the README.md loader script and our bundle script at the end
  if (readmeScript) {
    html = html.replace('</body>', `  ${readmeScript[0]}\n  <script type="module" src="bundle.js"></script>\n</body>`);
  } else {
    html = html.replace('</body>', '  <script type="module" src="bundle.js"></script>\n</body>');
  }

  return html;
};

export default [
  // Bundle 1: Process JS and CSS
  {
    input: 'src/main.js',
    output: {
      file: 'dist/bundle.js',
      format: 'es',
      // Don't mangle function names at all - sacrifices some compression for reliability
      compact: false
    },
    plugins: [
      // Handle CSS
      postcss({
        extract: 'bundle.css',
        minimize: true
      }),

      // Handle JS dependencies
      nodeResolve(),
      commonjs(),

      // Very conservative Terser settings
      terser({
        mangle: false,  // Don't rename variables or functions
        compress: {
          sequences: false,
          conditionals: true,
          comparisons: true,
          booleans: true,
          loops: true,
          unused: false,  // Don't remove "unused" code
          hoist_funs: false,
          hoist_vars: false,
          if_return: true,
          join_vars: false,
          dead_code: true
        },
        format: {
          comments: false,
          indent_level: 0,
          beautify: false,
          braces: true,
        }
      })
    ]
  },

  // Bundle 2: Process index.html
  {
    input: 'public/index.html',
    output: {
      dir: 'dist',
      entryFileNames: '[name].js',
      assetFileNames: '[name][extname]',
    },
    plugins: [
      rollupPluginHTML({
        flattenOutput: true,
        minify: false,
        extractAssets: false,
        name: 'index.html',
        transformHtml: [transformHTMLFunction]
      }),

      // This plugin helps to clean up unwanted files
      {
        name: 'cleanup',
        generateBundle(outputOptions, bundle) {
          // Remove any HTML-related JS files
          Object.keys(bundle).forEach(id => {
            if (id.endsWith('.js') && id !== 'bundle.js') {
              delete bundle[id];
            }
          });
        }
      }
    ]
  },

  // Bundle 3: Process 404.html
  {
    input: 'public/404.html',
    output: {
      dir: 'dist',
      entryFileNames: '[name].js',
      assetFileNames: '[name][extname]',
    },
    plugins: [
      rollupPluginHTML({
        flattenOutput: true,
        minify: false,
        extractAssets: false,
        name: '404.html',
        transformHtml: [transformHTMLFunction]
      }),

      // Clean up unwanted files
      {
        name: 'cleanup',
        generateBundle(outputOptions, bundle) {
          // Remove any HTML-related JS files
          Object.keys(bundle).forEach(id => {
            if (id.endsWith('.js') && id !== 'bundle.js') {
              delete bundle[id];
            }
          });
        }
      },

      // Copy other files (README.md and netlify.toml)
      copy({
        targets: [
          {src: 'README.md', dest: 'dist'},
          {src: 'public/netlify.toml', dest: 'dist'}
        ]
      })
    ]
  }
];