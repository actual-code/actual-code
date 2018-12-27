import Bundler from 'parcel-bundler'

export const watchApp = (entry: string) => {
  const opt: any = {
    outDir: './dist/app',
    outFile: 'index.html',
    watch: true,
    target: 'browser',
    hmr: false
  }
  const bundler = new Bundler(entry, opt)
  bundler.bundle()
}
