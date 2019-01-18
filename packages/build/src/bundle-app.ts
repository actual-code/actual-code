import Bundler from 'parcel-bundler'

export const bundleApp = (
  entries: string[],
  outDir: string,
  watch: boolean
) => {
  const opt: any = {
    outDir,
    outFile: 'index.html',
    watch,
    target: 'browser',
    hmr: false,
  }
  const bundler = new Bundler(entries, opt)
  return bundler.bundle()
}
