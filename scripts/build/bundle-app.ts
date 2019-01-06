import Bundler from 'parcel-bundler'

export const bundleApp = (entry: string, watch: boolean) => {
  const opt: any = {
    outDir: './dist/app',
    outFile: 'index.html',
    watch,
    target: 'browser',
    hmr: false
  }
  const bundler = new Bundler(entry, opt)
  return bundler.bundle()
}
