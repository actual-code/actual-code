const { carlo, rpc } = window

const _params = carlo.loadParams()

export const addReportCallback = async (
  cb: (type: string, hash: string, data: string | Buffer) => void
) => {
  const [reporter] = await _params
  await reporter.addCallback(rpc.handle(cb))
}

export const initActualCode = async (id: string) => {
  const [, backend] = await _params
  return backend.initActualCode(id)
}
