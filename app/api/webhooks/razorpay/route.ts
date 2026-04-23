import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify signature
    const hash = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log(`📨 Razorpay Webhook Event: ${event.event}`);

    switch (event.event) {
      case 'payment.authorized':
        const authorizedPayment = event.payload.payment.entity;
        console.log('✅ Payment authorized:', {
          paymentId: authorizedPayment.id,
          amount: authorizedPayment.amount,
          status: authorizedPayment.status,
        });
        break;

      case 'payment.failed':
        const failedPayment = event.payload.payment.entity;
        console.error('❌ Payment failed:', {
          paymentId: failedPayment.id,
          amount: failedPayment.amount,
          errorCode: failedPayment.error_code,
          errorDescription: failedPayment.error_description,
        });
        // Note: Frontend order controller will handle payment failure emails
        break;

      case 'payment.captured':
        const capturedPayment = event.payload.payment.entity;
        console.log('✅ Payment captured:', {
          paymentId: capturedPayment.id,
          amount: capturedPayment.amount / 100 + ' INR',
          status: capturedPayment.status,
        });
        // Note: Email already sent from order creation
        break;

      case 'order.paid':
        const paidOrder = event.payload.order.entity;
        console.log('✅ Order marked as paid:', {
          orderId: paidOrder.id,
          amount: paidOrder.amount / 100 + ' INR',
          status: paidOrder.status,
        });
        break;

      case 'payment.method.issued':
        console.log('💳 Payment method issued:', event.payload.payment_method.entity);
        break;

      default:
        console.log(`ℹ️ Unhandled event: ${event.event}`);
    }

    // Log webhook event for tracking
    console.log('📊 Webhook processed successfully:', {
      event: event.event,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ received: true, status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error.message);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}
