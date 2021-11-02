export function getCertInfo(cert: Buffer | string) {
  const tls = require('tls')
  const net = require('net')
  const secureContext = tls.createSecureContext({ cert })
  const socket = new tls.TLSSocket(new net.Socket(), { secureContext })
  return socket.getCertificate()
}
