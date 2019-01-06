const { carlo, rpc } = window

const _params = carlo.loadParams()

export const initActualCode = async (id: string) => {
  const [backend] = await _params
  return backend.initActualCode(id)
}
