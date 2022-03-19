
import { PrismicPreview } from '@prismicio/next';
import { PrismicProvider } from '@prismicio/react';
import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';
import Link from 'next/link';
import { Header } from '../components/Header';
import { linkResolver, repositoryName } from '../services/prismic';
import '../styles/global.scss';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <SessionProvider session={pageProps.session}>
            <PrismicProvider
                linkResolver={linkResolver}
                internalLinkComponent={({ href, children, ...props }) => (
                    <Link href={href}>
                        <a {...props}>
                            {children}
                        </a>
                    </Link>
                )}
            >
                <PrismicPreview repositoryName={repositoryName}>
                    <Header />
                    <Component {...pageProps} />
                </PrismicPreview>
            </PrismicProvider>
        </SessionProvider>
    )
}

export default MyApp
