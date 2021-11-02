import { assert } from 'chai'
import { loadDotEnv } from '../src'
import * as https from 'https'
import * as fs from 'fs'
import * as Buffer from 'buffer'

/*
The certificates in this test were generated with OpenSSL such as:

openssl req -x509 -newkey rsa:4096 -keyout server-key.pem -out server-cert.pem -days 365 -nodes

With CN set to 127.0.0.1

 */

const axios = require('axios')

const host = '127.0.0.1'
const port = 3005

const serverCert = loadCert('server-cert.pem')
const client1Cert = loadCert('client1-cert.pem')
const client2Cert = loadCert('client2-cert.pem')
const client3Cert = loadCert('client3-cert.pem')

export function loadCert(filename: string): Buffer {
  return fs.readFileSync(`test/certs/${filename}`)
}

export async function startTestServer(host: string, port: number, options: any) {
  return new Promise<any>((resolve, reject) => {
    const server = https.createServer(options, (req, res) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      res.end('Hello World')
    })

    server.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}/`)
      resolve(server)
    })
  })
}

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
    ca: serverCert, // The authorized server certificate
    cert, // The client certificate
    key, // the client certificate private key
    // CJ: I don't know why this is needing to be overridden even when the host matches the cert CN
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
      ca: [client1Cert, client2Cert], // The list of authorized client certificates
      requestCert: true, // This is required for authenticating clients
      cert: serverCert,
      key: loadCert('server-key.pem'),
      servername: '127.0.0.1',
    }
    server = await startTestServer(host, port, serverOptions)
  })

  after(async function () {
    if (server) await new Promise(r => server.close(r))
  })

  describe('tls authentication', function () {
    it('works', async function () {
      // The first two agents use authorized certificates
      // while the third agent uses a certificate that is valid but not included in the server's `ca` configuration

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
