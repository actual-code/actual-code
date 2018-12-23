export const { stringifyHtml, getFileList, carlo, rpc } = window as any

const _params = carlo.loadParams()

export const setReportCallback = async cb => {
  const [reporter] = await _params
  await reporter.setCallback(rpc.handle(cb))
}

export const initActualCode = async (id: string) => {
  const [, backend] = await _params
  return backend.initActualCode(id)
}
