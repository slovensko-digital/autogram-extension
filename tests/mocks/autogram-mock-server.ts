import http from 'http';

export class AutogramMockServer {
  private server: http.Server;
  private port = 21777; // Default Autogram port

  constructor() {
    this.server = http.createServer((req, res) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        this.handleRequest(req, res, body);
      });
    });
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse, body: string) {
    res.setHeader('Content-Type', 'application/json');
    
    try {
      const requestData = JSON.parse(body);
      
      // Handle different request types
      if (requestData.method === 'system.info') {
        res.end(JSON.stringify({
          id: requestData.id,
          result: {
            version: '1.0.0',
            name: 'Autogram Mock',
            capabilities: ['sign'],
          },
          error: null
        }));
      } else if (requestData.method === 'sign') {
        // Mock signing response
        setTimeout(() => {
          res.end(JSON.stringify({
            id: requestData.id,
            result: {
              signed: true,
              signatures: [
                {
                  id: 'mock-signature-id',
                  signedBy: 'Mock User',
                  signedAt: new Date().toISOString()
                }
              ]
            },
            error: null
          }));
        }, 500); // Simulate delay
      } else {
        // Default response for unknown methods
        res.end(JSON.stringify({
          id: requestData.id,
          result: null,
          error: {
            code: -32601,
            message: 'Method not found'
          }
        }));
      }
    } catch (e) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        error: 'Invalid JSON',
        details: (e as Error).message
      }));
    }
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`Autogram mock server running on port ${this.port}`);
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('Autogram mock server stopped');
        resolve();
      });
    });
  }
}
