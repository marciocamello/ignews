import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { getSession } from 'next-auth/react';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { createClient } from '../../services/prismic';

jest.mock('../../services/stripe')

const post = {
    slug: 'fake-slug',
    title: 'Fake title 1',
    content: '<p>Fake excerpt 1</p>',
    updated_at: '2020-01-01',
};

jest.mock("next-auth/react");

jest.mock('../../services/prismic')

describe('Post page', () => {

    it('renders correctly', () => {
        render(<Post post={post} />);

        expect(screen.getByText('Fake title 1')).toBeInTheDocument();
        expect(screen.getByText('Fake excerpt 1')).toBeInTheDocument();
    });

    it('redirects user if no subscription is found', async () => {
        const getSessionMocked = mocked(getSession);

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: null,
        } as any);

        const response = await getServerSideProps({
            params: {
                slug: 'fake-slug',
            },
        } as any);

        expect(response).toEqual(
            expect.objectContaining({
                redirect: expect.objectContaining({
                    destination: '/',
                })
            })
        )
    });

    it('loads initial data', async () => {
        const getSessionMocked = mocked(getSession);
        const getPrismicClientMocked = mocked(createClient);

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-subscription-id',
        } as any);

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

        const response = await getServerSideProps({
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