import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import Home, { getStaticProps } from '../../pages';
import { stripe } from '../../services/stripe';

jest.mock("next/router");

jest.mock("next-auth/react", () => ({
    useSession() {
        return {
            data: null,
            status: "authenticated"
        }
    }
}));

jest.mock('../../services/stripe')

describe('Home page', () => {

    it('renders correctly', () => {
        render(<Home
            product={{
                priceId: 'fake-price-id',
                amount: 'R$10,00',
            }}
        />);

        expect(screen.getByText('for R$10,00 month')).toBeInTheDocument();
    });

    it('loads initial data', async () => {
        const retriveStripePricesMocked = mocked(stripe.prices.retrieve);

        retriveStripePricesMocked.mockResolvedValueOnce({
            id: 'fake-price-id',
            unit_amount: 1000,
        } as any);

        const response = await getStaticProps({});

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    product: {
                        priceId: 'fake-price-id',
                        amount: '$10.00',
                    }
                }
            })
        )
    });
});