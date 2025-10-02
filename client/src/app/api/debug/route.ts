import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Check environment variables
    const hasMongoUri = !!process.env.MONGODB_URI;
    const nodeEnv = process.env.NODE_ENV;
    
    // Check MongoDB connection
    let mongoStatus = 'not connected';
    try {
      if (mongoose.connections[0].readyState === 1) {
        mongoStatus = 'connected';
      } else {
        mongoStatus = 'disconnected';
      }
    } catch (error) {
      mongoStatus = 'error: ' + (error as Error).message;
    }
    
    return NextResponse.json({
      status: 'debug_info',
      timestamp: new Date().toISOString(),
      environment: {
        hasMongoUri,
        nodeEnv,
        mongoStatus
      },
      mongoConnections: mongoose.connections.length
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
