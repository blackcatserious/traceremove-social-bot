import { NextRequest, NextResponse } from 'next/server';
import { handleAPIError, ValidationError } from '@/lib/error-handling';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  name: string;
  config: Record<string, any>;
  nextSteps: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  trigger: WorkflowStep;
  steps: WorkflowStep[];
  schedule?: {
    type: 'cron' | 'interval' | 'event';
    value: string;
  };
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  successRate: number;
}

const workflows: Map<string, Workflow> = new Map();

const workflowTemplates = [
  {
    id: 'content-publishing',
    name: 'Automated Content Publishing',
    description: 'Generate and publish content across multiple platforms',
    steps: [
      { type: 'trigger', name: 'Schedule Trigger', config: { cron: '0 9 * * *' } },
      { type: 'action', name: 'Generate Content', config: { model: 'gpt-4o', topic: 'AI ethics' } },
      { type: 'action', name: 'Review Content', config: { threshold: 0.8 } },
      { type: 'action', name: 'Publish to Social', config: { platforms: ['twitter', 'linkedin'] } }
    ]
  },
  {
    id: 'data-sync',
    name: 'Notion Database Sync',
    description: 'Sync data between Notion databases and PostgreSQL',
    steps: [
      { type: 'trigger', name: 'Webhook Trigger', config: { source: 'notion' } },
      { type: 'action', name: 'Extract Data', config: { database: 'all' } },
      { type: 'action', name: 'Transform Data', config: { format: 'postgresql' } },
      { type: 'action', name: 'Load to Database', config: { upsert: true } }
    ]
  },
  {
    id: 'performance-monitoring',
    name: 'System Performance Monitoring',
    description: 'Monitor system performance and send alerts',
    steps: [
      { type: 'trigger', name: 'Interval Trigger', config: { interval: '5m' } },
      { type: 'action', name: 'Check Metrics', config: { endpoints: ['all'] } },
      { type: 'condition', name: 'Performance Check', config: { threshold: 2000 } },
      { type: 'action', name: 'Send Alert', config: { channels: ['email', 'slack'] } }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const workflowId = searchParams.get('id');

    switch (action) {
      case 'list':
        return NextResponse.json({
          workflows: Array.from(workflows.values()),
          templates: workflowTemplates,
          stats: {
            total: workflows.size,
            active: Array.from(workflows.values()).filter(w => w.status === 'active').length,
            totalRuns: Array.from(workflows.values()).reduce((sum, w) => sum + w.runCount, 0)
          }
        });

      case 'get':
        if (!workflowId) {
          throw new ValidationError('Workflow ID is required');
        }
        const workflow = workflows.get(workflowId);
        if (!workflow) {
          return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
        }
        return NextResponse.json({ workflow });

      case 'templates':
        return NextResponse.json({ templates: workflowTemplates });

      case 'run':
        if (!workflowId) {
          throw new ValidationError('Workflow ID is required');
        }
        const result = await executeWorkflow(workflowId);
        return NextResponse.json({ result });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Workflow automation API error:', error);
    const { response, status } = handleAPIError(error);
    return NextResponse.json(response, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, workflow, workflowId } = await request.json();

    switch (action) {
      case 'create':
        if (!workflow) {
          throw new ValidationError('Workflow data is required');
        }
        const newWorkflow = createWorkflow(workflow);
        return NextResponse.json({ 
          message: 'Workflow created successfully',
          workflow: newWorkflow 
        });

      case 'update':
        if (!workflowId || !workflow) {
          throw new ValidationError('Workflow ID and data are required');
        }
        const updatedWorkflow = updateWorkflow(workflowId, workflow);
        return NextResponse.json({ 
          message: 'Workflow updated successfully',
          workflow: updatedWorkflow 
        });

      case 'delete':
        if (!workflowId) {
          throw new ValidationError('Workflow ID is required');
        }
        workflows.delete(workflowId);
        return NextResponse.json({ message: 'Workflow deleted successfully' });

      case 'toggle':
        if (!workflowId) {
          throw new ValidationError('Workflow ID is required');
        }
        const toggledWorkflow = toggleWorkflow(workflowId);
        return NextResponse.json({ 
          message: 'Workflow status toggled',
          workflow: toggledWorkflow 
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Workflow automation POST error:', error);
    const { response, status } = handleAPIError(error);
    return NextResponse.json(response, { status });
  }
}

function createWorkflow(workflowData: Partial<Workflow>): Workflow {
  const workflow: Workflow = {
    id: `workflow_${Date.now()}`,
    name: workflowData.name || 'Untitled Workflow',
    description: workflowData.description || '',
    status: 'draft',
    trigger: workflowData.trigger || {
      id: 'trigger_1',
      type: 'trigger',
      name: 'Manual Trigger',
      config: {},
      nextSteps: []
    },
    steps: workflowData.steps || [],
    schedule: workflowData.schedule,
    runCount: 0,
    successRate: 0
  };

  workflows.set(workflow.id, workflow);
  return workflow;
}

function updateWorkflow(workflowId: string, updates: Partial<Workflow>): Workflow | null {
  const workflow = workflows.get(workflowId);
  if (!workflow) return null;

  const updatedWorkflow = { ...workflow, ...updates };
  workflows.set(workflowId, updatedWorkflow);
  return updatedWorkflow;
}

function toggleWorkflow(workflowId: string): Workflow | null {
  const workflow = workflows.get(workflowId);
  if (!workflow) return null;

  workflow.status = workflow.status === 'active' ? 'inactive' : 'active';
  workflows.set(workflowId, workflow);
  return workflow;
}

async function executeWorkflow(workflowId: string): Promise<any> {
  const workflow = workflows.get(workflowId);
  if (!workflow) {
    throw new Error('Workflow not found');
  }

  if (workflow.status !== 'active') {
    throw new Error('Workflow is not active');
  }

  const executionId = `exec_${Date.now()}`;
  const startTime = Date.now();
  
  try {
    const results = [];
    
    for (const step of workflow.steps) {
      const stepResult = await executeStep(step, workflow);
      results.push({
        stepId: step.id,
        stepName: step.name,
        success: stepResult.success,
        output: stepResult.output,
        duration: stepResult.duration
      });
      
      if (!stepResult.success && step.type !== 'condition') {
        break;
      }
    }
    
    const success = results.every(r => r.success);
    const duration = Date.now() - startTime;
    
    workflow.runCount++;
    workflow.successRate = (workflow.successRate * (workflow.runCount - 1) + (success ? 1 : 0)) / workflow.runCount;
    workflow.lastRun = new Date();
    
    return {
      executionId,
      workflowId,
      success,
      duration,
      steps: results,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    workflow.runCount++;
    workflow.successRate = (workflow.successRate * (workflow.runCount - 1)) / workflow.runCount;
    workflow.lastRun = new Date();
    
    throw error;
  }
}

async function executeStep(step: WorkflowStep, workflow: Workflow): Promise<any> {
  const startTime = Date.now();
  
  try {
    let result;
    
    switch (step.type) {
      case 'action':
        result = await executeAction(step, workflow);
        break;
      case 'condition':
        result = await executeCondition(step, workflow);
        break;
      case 'delay':
        result = await executeDelay(step);
        break;
      default:
        result = { success: true, output: 'Step executed' };
    }
    
    return {
      success: true,
      output: result,
      duration: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      output: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    };
  }
}

async function executeAction(step: WorkflowStep, workflow: Workflow): Promise<any> {
  switch (step.name) {
    case 'Generate Content':
      return { message: 'Content generated successfully', contentId: `content_${Date.now()}` };
    case 'Publish to Social':
      return { message: 'Published to social media', platforms: step.config.platforms };
    case 'Send Alert':
      return { message: 'Alert sent', channels: step.config.channels };
    case 'Extract Data':
      return { message: 'Data extracted', records: Math.floor(Math.random() * 100) };
    default:
      return { message: `Action ${step.name} executed` };
  }
}

async function executeCondition(step: WorkflowStep, workflow: Workflow): Promise<any> {
  const threshold = step.config.threshold || 0;
  const currentValue = Math.random() * 3000;
  const passed = currentValue < threshold;
  
  return {
    condition: step.name,
    passed,
    currentValue,
    threshold,
    message: passed ? 'Condition passed' : 'Condition failed'
  };
}

async function executeDelay(step: WorkflowStep): Promise<any> {
  const delay = step.config.delay || 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  return { message: `Delayed for ${delay}ms` };
}
