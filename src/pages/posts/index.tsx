import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '../../services/prismic';
import styles from './styles.module.scss';

export type Post = {
    slug: string;
    title: string;
    excerpt: string;
    updated_at: string;
}

export interface Posts {
    posts: Post[];
}

export default function Posts({ posts }: Posts) {
    return (
        <>
            <Head>
                <title>Posts | ig.news</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>
                    {posts?.map((post: Post) => (
                        <Link
                            key={post.slug}
                            href={`/posts/${post.slug}`}
                        >
                            <a>
                                <time>{post.updated_at}</time>
                                <strong>{post.title}</strong>
                                <p>{post.excerpt}</p>
                            </a>
                        </Link>
                    ))}
                </div>
            </main>
        </>
    );
}

export async function getServerSideProps({ previewData }) {
    const client = createClient({ previewData })

    const response = await client.getAllByType('posts', {
        pageSize: 100,
    })

    const posts = response?.map((post: any) => {
        return {
            slug: post.uid,
            title: post.data.title,
            excerpt: post.data.content.find((content: any) => content.type === 'paragraph')?.text,
            updated_at: new Date(post.last_publication_date).toLocaleDateString('pt-PT', {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
            })
        }
    });

    return {
        props: { posts }, // Will be passed to the page component as props
    }
}