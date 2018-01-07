// rollup.config.js
import typescript from 'rollup-plugin-typescript2'

export default {
  entry: './src/index.ts',

  plugins: [
    typescript({
      include: ['*.ts', '**/*.ts', '../**/*.ts'],
      exclude: ['../**/*.d.ts'],
    }),
  ],
}
