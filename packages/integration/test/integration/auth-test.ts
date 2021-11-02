import { assert } from 'chai'
import { loadDotEnv } from '../src'
import { loadCert, startTestServer } from '../src/test-server'
import * as https from 'https'

const axios = require('axios')

const host = '127.0.0.1'
const port = 3005

const serverCert = loadCert('server-cert.pem')
const client1Cert = loadCert('client1-cert.pem')
const client2Cert = loadCert('client2-cert.pem')
const client3Cert = loadCert('client3-cert.pem')

export async function authRequest(httpsAgent: https.Agent) {
  try {
    return await axios({
      method: 'get',
      url: `https://${host}:${port}`,
      httpsAgent,
    })
  } catch (error) {
    error.isError = true
    return error
  }
}

export function newClientAgent(cert: Buffer | string, key: Buffer | string) {
  return new https.Agent({
    keepAlive: true,
    ca: serverCert,
    cert,
    key,
    // I don't know why this is needing to be overridden when the host matches the cert CN
    checkServerIdentity: function (host, cert) {
      return host === cert.subject.CN ? undefined : Error('Invalid server host for TLS certificate')
    }
  })
}

describe('auth-test', function () {
  this.timeout(15000)
  let server: any

  before(async function () {
    loadDotEnv()

    const serverOptions = {
      ca: [client1Cert, client2Cert],
      requestCert: true,
      cert: serverCert,
      servername: '127.0.0.1',
      key: loadCert('server-key.pem'),
    }
    server = await startTestServer(host, port, serverOptions)
  })

  after(async function () {
    if (server) await new Promise(r => server.close(r))
  })

  describe('tls authentication', function () {
    it('works', async function () {
      const agent1 = newClientAgent(client1Cert, loadCert('client1-key.pem'))
      const agent2 = newClientAgent(client2Cert, loadCert('client2-key.pem'))
      const agent3 = newClientAgent(client3Cert, loadCert('client3-key.pem'))

      const response = await authRequest(agent1)
      const response2 = await authRequest(agent2)
      const response3 = await authRequest(agent3)

      assert.strictEqual(response.data, 'Hello World')
      assert.strictEqual(response2.data, 'Hello World')
      assert.isTrue(response3.isError)
    })
  })

})
