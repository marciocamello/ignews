import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { createClient } from '../../services/prismic';

jest.mock('../../services/stripe')

const post = {
    slug: 'fake-slug',
    title: 'Fake title 1',
    content: '<p>Fake excerpt 1</p>',
    updated_at: '2020-01-01',
};

jest.mock("next-auth/react");
jest.mock("next/router");
jest.mock('../../services/prismic')

describe('Post preview page', () => {

    it('renders correctly', () => {
        const useSessionMocked = mocked(useSession);

        useSessionMocked.mockReturnValueOnce({
            data: null,
            status: "authenticated"
        } as any);

        render(<Post post={post} />);

        expect(screen.getByText('Fake title 1')).toBeInTheDocument();
        expect(screen.getByText('Fake excerpt 1')).toBeInTheDocument();
        expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
    });

    it('redirects user to full post when user is subscribed', async () => {
        const useSessionMocked = mocked(useSession);
        const useRouterMocked = mocked(useRouter);

        const pushMocked = jest.fn();

        useSessionMocked.mockReturnValueOnce({
            data: {
                activeSubscription: 'fake-subscription-id',
            }
        } as any);

        useRouterMocked.mockReturnValueOnce({
            push: pushMocked,
        } as any);

        render(<Post post={post} />);

        expect(pushMocked).toHaveBeenCalledWith('/posts/fake-slug');
    });

    it('loads initial data', async () => {
        const getPrismicClientMocked = mocked(createClient);

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce(
                {
                    uid: 'fake-slug',
                    data: {
                        title: 'Fake title 1',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Fake excerpt 1',
                            },
                        ],
                    },
                    last_publication_date: '2020-01-01',
                },
            ),
        } as any);

        const response = await getStaticProps({
            params: {
                slug: 'fake-slug',
            },
        } as any);

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: 'fake-slug',
                        title: 'Fake title 1',
                        content: '<p>Fake excerpt 1</p>',
                        updated_at: '01 de janeiro de 2020',
                    }
                }
            })
        )
    });
});