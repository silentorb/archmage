import * as https from 'https'
import * as fs from 'fs'
import * as Buffer from 'buffer'

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

// export function request(host: string, port: number)
