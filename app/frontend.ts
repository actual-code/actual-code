export const {
  runMarkdown,
  initSandbox,
  getFileList,
  carlo,
  rpc
} = window as any

const _params = carlo.loadParams()

// export const setReportCallback = async cb => {
//   const [reporter] = await _params
//   await reporter.setCallback(rpc.handle(cb))
// }

// setReportCallback((type, data) => {
//   console.log(type, data)
// })
