import { GetStaticPaths, GetStaticProps, PreviewData } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from 'prismic-dom';
import { useEffect } from "react";
import { createClient } from "../../../services/prismic";
import styles from "../post.module.scss";

type Post = {
    slug: string;
    title: string;
    content: string;
    updated_at: string;
}

export interface PostPreviewProps {
    post: Post;
}

interface StaticProps extends GetStaticProps {
    previewData: PreviewData;
    params: {
        slug: string;
    };
}

export default function PostPreview({ post }: PostPreviewProps) {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session?.activeSubscription) {
            router.push(`/posts/${post.slug}`);
        }
    }, [post.slug, router, session])

    return (
        <>
            <Head>
                <title>{post.title} | ig.news</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updated_at}</time>
                    <div
                        className={`${styles.postContent} ${styles.postContentPreview}`}
                        dangerouslySetInnerHTML={{
                            __html: post.content
                        }}
                    />

                    <div className={styles.continueReading}>
                        Wanna continue reading?
                        <Link href="/">
                            <a>Subscribe now 🤗</a>
                        </Link>
                    </div>
                </article>
            </main>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = () => {
    return {
        paths: [],
        fallback: 'blocking',
    }
}

export const getStaticProps = async ({ previewData, params }: StaticProps) => {

    const { slug } = params
    const client = createClient({ previewData })

    const response = await client.getByUID('posts', slug)

    const post = {
        slug: response.uid,
        title: response.data.title,
        content: RichText.asHtml(response.data.content.splice(0, 3)),
        updated_at: new Date(response.last_publication_date).toLocaleDateString('pt-PT', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
        })
    }

    return {
        props: { post },
        revalidate: 60 * 60 * 24 // 1 day
    }
}