import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import replace from '@rollup/plugin-replace';
import dts from 'vite-plugin-dts';
import path from 'path';

let gitInfo = {
    branch: '',
    commit: '',
    tags: '',
    commitDate: '',
};

try {
    gitInfo = {
        branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
        commit: execSync('git rev-parse --short HEAD').toString().trim(),
        tags: '',
        commitDate: execSync('git log -1 --format=%cd --date=iso').toString().trim(),
    };

    try {
        gitInfo.tags = execSync('git tag --points-at HEAD | paste -sd "," -').toString().trim();
    } catch {
        gitInfo.tags = '';
    }
} catch {
    // eslint-disable-next-line no-console
    console.log('Directory does not have a Git repository, skipping git info');
}

export default defineConfig({
    plugins: [
        replace({
            '__VERSION__': process.env.npm_package_version,
            '__GIT_BRANCH__': gitInfo.branch,
            '__GIT_COMMIT__': gitInfo.commit,
            '__GIT_TAGS__': gitInfo.tags === '' ? '' : `T:${gitInfo.tags}`,
            '__GIT_COMMIT_DATE__': gitInfo.commitDate,
            '__SYSTEM_INFO__': `${process.platform} ${process.arch} ${process.version}`,
            preventAssignment: true,
        }),
        dts({
            outDir: 'dist',
            insertTypesEntry: true,
        }),
    ],
    build: {
        target: 'esnext',
        outDir: 'dist',
        lib: {
            entry: './src/index.ts',
            formats: ['es', 'cjs'],
            fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs',
        },
        rollupOptions: {
            external: [
                '@utilarium/overcontext',
                'zod',
            ],
            output: {
                preserveModules: true,
                preserveModulesRoot: 'src',
                exports: 'named',
            },
        },
        modulePreload: false,
        minify: false,
        sourcemap: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
});
