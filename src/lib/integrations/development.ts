export interface CodeGenerationRequest {
  language: string;
  framework?: string;
  requirements: string[];
  architecture: 'monolith' | 'microservices' | 'serverless';
  database?: string;
  features: string[];
}

export interface CodeReviewResult {
  score: number;
  issues: CodeIssue[];
  suggestions: string[];
  securityConcerns: string[];
  performanceIssues: string[];
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'suggestion';
  line: number;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DeploymentConfig {
  platform: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure';
  environment: 'development' | 'staging' | 'production';
  buildCommand: string;
  outputDirectory: string;
  environmentVariables: Record<string, string>;
}

export class DevelopmentAssistant {
  async generateCode(request: CodeGenerationRequest): Promise<{
    files: { path: string; content: string }[];
    documentation: string;
    setupInstructions: string[];
    dependencies: string[];
  }> {
    const files: { path: string; content: string }[] = [];
    const dependencies: string[] = [];

    switch (request.language) {
      case 'typescript':
        files.push(...this.generateTypeScriptProject(request));
        dependencies.push('typescript', '@types/node');
        break;
      case 'python':
        files.push(...this.generatePythonProject(request));
        dependencies.push('fastapi', 'uvicorn');
        break;
      case 'javascript':
        files.push(...this.generateJavaScriptProject(request));
        dependencies.push('express', 'cors');
        break;
    }

    if (request.framework) {
      dependencies.push(request.framework);
    }

    return {
      files,
      documentation: this.generateDocumentation(request),
      setupInstructions: this.generateSetupInstructions(request),
      dependencies
    };
  }

  async reviewCode(code: string, language: string = 'typescript'): Promise<CodeReviewResult> {
    const issues: CodeIssue[] = [];
    const suggestions: string[] = [];
    const securityConcerns: string[] = [];
    const performanceIssues: string[] = [];

    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      if (line.includes('console.log')) {
        issues.push({
          type: 'warning',
          line: index + 1,
          message: 'Remove console.log statements in production code',
          severity: 'low'
        });
      }

      if (line.includes('eval(')) {
        issues.push({
          type: 'error',
          line: index + 1,
          message: 'Use of eval() is dangerous and should be avoided',
          severity: 'critical'
        });
        securityConcerns.push('eval() usage detected');
      }

      if (line.includes('var ')) {
        suggestions.push('Consider using const or let instead of var');
      }

      if (line.length > 120) {
        issues.push({
          type: 'suggestion',
          line: index + 1,
          message: 'Line too long, consider breaking it up',
          severity: 'low'
        });
      }
    });

    if (code.includes('for (') && code.includes('.length')) {
      performanceIssues.push('Consider using forEach or map for better readability');
    }

    const score = Math.max(0, 100 - (issues.length * 5));

    return {
      score,
      issues,
      suggestions,
      securityConcerns,
      performanceIssues
    };
  }

  async deployProject(config: DeploymentConfig): Promise<{
    deploymentId: string;
    url: string;
    status: 'pending' | 'building' | 'ready' | 'error';
    logs: string[];
  }> {
    const deploymentId = `deploy_${Date.now()}`;
    
    return {
      deploymentId,
      url: `https://${deploymentId}.${config.platform}.app`,
      status: 'pending',
      logs: [
        'Deployment initiated',
        'Building project...',
        'Installing dependencies...'
      ]
    };
  }

  async monitorSystem(systemId: string): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    responseTime: number;
    errorRate: number;
    metrics: Record<string, number>;
    alerts: string[];
  }> {
    return {
      status: 'healthy',
      uptime: 99.9,
      responseTime: 150,
      errorRate: 0.1,
      metrics: {
        cpu: 45,
        memory: 60,
        disk: 30,
        network: 25
      },
      alerts: []
    };
  }

  private generateTypeScriptProject(request: CodeGenerationRequest): { path: string; content: string }[] {
    return [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'generated-project',
          version: '1.0.0',
          scripts: {
            dev: 'ts-node src/index.ts',
            build: 'tsc',
            start: 'node dist/index.js'
          },
          dependencies: {},
          devDependencies: {
            typescript: '^5.0.0',
            '@types/node': '^20.0.0',
            'ts-node': '^10.0.0'
          }
        }, null, 2)
      },
      {
        path: 'src/index.ts',
        content: `// Generated TypeScript application
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Generated TypeScript API' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2020',
            module: 'commonjs',
            outDir: './dist',
            rootDir: './src',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true
          },
          include: ['src/**/*'],
          exclude: ['node_modules', 'dist']
        }, null, 2)
      }
    ];
  }

  private generatePythonProject(request: CodeGenerationRequest): { path: string; content: string }[] {
    return [
      {
        path: 'main.py',
        content: `# Generated Python application
from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Generated Python API")

@app.get("/")
async def root():
    return {"message": "Generated Python API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
`
      },
      {
        path: 'requirements.txt',
        content: `fastapi==0.104.1
uvicorn==0.24.0
`
      }
    ];
  }

  private generateJavaScriptProject(request: CodeGenerationRequest): { path: string; content: string }[] {
    return [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'generated-js-project',
          version: '1.0.0',
          scripts: {
            start: 'node index.js',
            dev: 'nodemon index.js'
          },
          dependencies: {
            express: '^4.18.0',
            cors: '^2.8.5'
          }
        }, null, 2)
      },
      {
        path: 'index.js',
        content: `// Generated JavaScript application
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Generated JavaScript API' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`
      }
    ];
  }

  private generateDocumentation(request: CodeGenerationRequest): string {
    return `# Generated ${request.language} Project

## Overview
This project was generated based on your requirements:
${request.requirements.map(req => `- ${req}`).join('\n')}

## Architecture
- Type: ${request.architecture}
- Language: ${request.language}
${request.framework ? `- Framework: ${request.framework}` : ''}
${request.database ? `- Database: ${request.database}` : ''}

## Features
${request.features.map(feature => `- ${feature}`).join('\n')}

## Getting Started
1. Install dependencies
2. Configure environment variables
3. Run the development server

## API Endpoints
- GET / - Health check endpoint

## Deployment
This project is ready for deployment on modern platforms like Vercel, Netlify, or AWS.
`;
  }

  private generateSetupInstructions(request: CodeGenerationRequest): string[] {
    const instructions = ['Clone the repository'];
    
    switch (request.language) {
      case 'typescript':
      case 'javascript':
        instructions.push('npm install', 'npm run dev');
        break;
      case 'python':
        instructions.push('pip install -r requirements.txt', 'python main.py');
        break;
    }
    
    return instructions;
  }
}
