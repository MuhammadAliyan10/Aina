import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { user } = await validateRequest();
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (slug[0] === "subscription") {
      const billing = await prisma.billing.findFirst({
        where: { userId: user.id },
        select: {
          plan: true,
          status: true,
          amount: true,
          billingDate: true,
          stripeSubscriptionId: true,
        },
      });
      const data = billing || {
        plan: "Free",
        status: "inactive",
        billingDate: null,
        amount: 0,
      };
      return NextResponse.json(
        { ...data, nextBillingDate: data.billingDate?.toISOString() || null },
        { status: 200 }
      );
    } else if (slug[0] === "payment-methods") {
      const billing = await prisma.billing.findFirst({
        where: { userId: user.id },
      });
      if (!billing?.stripeCustomerId)
        return NextResponse.json([], { status: 200 });
      const paymentMethods = await stripe.paymentMethods.list({
        customer: billing.stripeCustomerId,
        type: "card",
      });
      return NextResponse.json(
        paymentMethods.data.map((pm) => ({
          id: pm.id,
          type: "credit_card",
          lastFour: pm.card!.last4,
          expiry: `${pm.card!.exp_month}/${pm
            .card!.exp_year.toString()
            .slice(-2)}`,
          isDefault: pm.id === billing.stripeDefaultPaymentMethodId,
        })),
        { status: 200 }
      );
    } else if (slug[0] === "history") {
      const invoices = await prisma.invoice.findMany({
        where: { billing: { userId: user.id } },
        select: {
          id: true,
          issuedAt: true,
          amount: true,
          status: true,
          stripeInvoiceId: true,
        },
        orderBy: { issuedAt: "desc" },
      });
      const data = await Promise.all(
        invoices.map(async (invoice) => ({
          id: invoice.id,
          date: invoice.issuedAt.toISOString().split("T")[0],
          description: `Plan Billing - ${invoice.issuedAt.toLocaleString(
            "default",
            { month: "long" }
          )}`,
          amount: invoice.amount,
          status: invoice.status,
          receiptUrl: invoice.stripeInvoiceId
            ? (
                await stripe.invoices.retrieve(invoice.stripeInvoiceId)
              ).hosted_invoice_url
            : undefined,
        }))
      );
      return NextResponse.json(data, { status: 200 });
    }
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 404 });
  } catch (error) {
    console.error("Error in billing GET:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { user } = await validateRequest();
  const { slug } = await params;
  const body = await request.json();
  const { userId } = body;

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (slug[0] === "payment-methods") {
      const { cardNumber, expiry, cvc } = body;
      if (!cardNumber || !expiry || !cvc)
        return NextResponse.json(
          { error: "Missing card details" },
          { status: 400 }
        );

      let billing = await prisma.billing.findFirst({
        where: { userId: user.id },
      });
      if (!billing) {
        const customer = await stripe.customers.create({ email: user.email });
        billing = await prisma.billing.create({
          data: { userId: user.id, stripeCustomerId: customer.id },
        });
      }

      const [expMonth, expYear] = expiry.split("/");
      const paymentMethod = await stripe.paymentMethods.create({
        type: "card",
        card: {
          number: cardNumber,
          exp_month: parseInt(expMonth),
          exp_year: parseInt(`20${expYear}`),
          cvc,
        },
      });
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: billing.stripeCustomerId!,
      });
      if (!billing.stripeDefaultPaymentMethodId) {
        await prisma.billing.update({
          where: { id: billing.id },
          data: { stripeDefaultPaymentMethodId: paymentMethod.id },
        });
      }

      return NextResponse.json(
        {
          id: paymentMethod.id,
          type: "credit_card",
          lastFour: paymentMethod.card!.last4,
          expiry: `${paymentMethod.card!.exp_month}/${paymentMethod
            .card!.exp_year.toString()
            .slice(-2)}`,
          isDefault: paymentMethod.id === billing.stripeDefaultPaymentMethodId,
        },
        { status: 201 }
      );
    } else if (slug[0] === "subscription" && slug[1] === "cancel") {
      const billing = await prisma.billing.findFirst({
        where: { userId: user.id },
      });
      if (!billing?.stripeSubscriptionId)
        return NextResponse.json(
          { error: "No active subscription" },
          { status: 400 }
        );

      const subscription = await stripe.subscriptions.update(
        billing.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );
      await prisma.billing.update({
        where: { id: billing.id },
        data: { status: "canceled" },
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 404 });
  } catch (error) {
    console.error("Error in billing POST:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { user } = await validateRequest();
  const { slug } = await params;
  const body = await request.json();
  const { userId, id } = body;

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (slug[0] !== "payment-methods" || !id)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const billing = await prisma.billing.findFirst({
      where: { userId: user.id },
    });
    if (!billing?.stripeCustomerId)
      return NextResponse.json({ error: "No billing record" }, { status: 404 });

    await stripe.paymentMethods.detach(id);
    if (billing.stripeDefaultPaymentMethodId === id) {
      await prisma.billing.update({
        where: { id: billing.id },
        data: { stripeDefaultPaymentMethodId: null },
      });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      { error: "Failed to delete payment method" },
      { status: 500 }
    );
  }
}
