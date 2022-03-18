/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from 'stream';
import Stripe from "stripe";
import { stripe } from "../../../services/stripe";
import { saveSubscription } from "../_lib/manageSubscription";

async function buffer(stream: Readable) {
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
        chunks.push(
            typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk
        );
    }

    return Buffer.concat(chunks);
}

export const config = {
    api: {
        bodyParser: false,
    },
}

const relevantEvents = new Set([
    'checkout.session.completed',
    //'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
]);

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const buf = await buffer(req);
        const secret = req.headers['stripe-signature'];

        let event: Stripe.Event;

        try {

            event = stripe.webhooks.constructEvent(
                buf,
                secret,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(err);
            res.status(400).send({
                error: 'Webhook Error: ' + err.message,
            });
        }

        const { type } = event;

        if (relevantEvents.has(type)) {
            try {
                switch (type) {
                    //case 'customer.subscription.created':
                    case 'customer.subscription.updated':
                    case 'customer.subscription.deleted':

                        const subscription = event.data.object as Stripe.Subscription;

                        await saveSubscription(
                            subscription.id.toString(),
                            subscription.customer.toString(),
                            false
                        );

                        break;
                    case 'checkout.session.completed':

                        const checkoutSession = event.data.object as Stripe.Checkout.Session;

                        await saveSubscription(
                            checkoutSession.subscription.toString(),
                            checkoutSession.customer.toString(),
                            true
                        );

                        break;
                    default:
                        throw new Error(`Unexpected event type: ${type}`);
                }
            } catch (err) {
                console.log(err);
                res.json({
                    error: 'Webhook Error: ' + err.message,
                });
            }
        }

        res.json({
            received: true,
        });
    } else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}