import { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { SubscribeButton } from '../components/SubscribeButton';
import { stripe } from '../services/stripe';
import styles from './home.module.scss';

interface HomeProps {
    product: {
        priceId: string;
        amount: number;
    }
}

export default function Home({ product }: HomeProps) {
    return (
        <>
            <Head>
                <title>Home | ig.news</title>
            </Head>

            <main className={styles.contentContainer}>
                <section className={styles.hero}>
                    <span>👏 Hey, welcome</span>
                    <h1>News about the <span>React</span> world.</h1>
                    <p>
                        Get access to all the publications <br />
                        <span>or {product.amount} month</span>
                    </p>

                    <SubscribeButton
                        priceId={product.priceId}
                    />
                </section>

                <Image
                    src="/images/avatar.svg"
                    alt="Girl coding"
                    width={600}
                    height={800}
                />
            </main>
        </>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const price = await stripe.prices.retrieve('price_1KeFN9KPDJYp9M1NGOTdgz03', {
        expand: ['product']
    });

    const product = {
        priceId: price.id,
        amount: new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(price.unit_amount / 100),
    };

    return {
        props: {
            product
        },
        revalidate: 60 * 60 * 24 // 1 day
    }
}