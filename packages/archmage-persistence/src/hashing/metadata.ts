
const metadataCache: any = {}

export function getMetadataInstance(type: any) {
  const instance = metadataCache[type]
  if (instance) return instance
  const newInstance = new type()
  metadataCache[type] = newInstance
  return newInstance
}

export function getMetadataValue(type: any, metadataKey: Symbol, property: string) {
  const instance = getMetadataInstance(type)
  return Reflect.getMetadata(metadataKey, instance, property)
}
