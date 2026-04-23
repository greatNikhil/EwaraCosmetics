import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case 'payment.authorized':
        console.log('✅ Payment authorized:', event.payload.payment.entity.id);
        // TODO: Update order status in database
        break;

      case 'payment.failed':
        const failedPayment = event.payload.payment.entity;
        console.error('❌ Payment failed:', failedPayment.id);
        // TODO: Update order status to failed
        break;

      case 'payment.captured':
        const capturedPayment = event.payload.payment.entity;
        console.log('✅ Payment captured:', capturedPayment.id);
        // TODO: Send order confirmation email
        break;

      case 'order.paid':
        const paidOrder = event.payload.order.entity;
        console.log('✅ Order paid:', paidOrder.id);
        // TODO: Update order status to completed
        break;

      default:
        console.log(`Unhandled event: ${event.event}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
