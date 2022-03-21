import { render, screen } from '@testing-library/react';
import { ActiveLink } from '.';

jest.mock("next/router", () => ({
    useRouter() {
        return {
            asPath: "/"
        }
    }
}));

describe('Activelink component', () => {

    it('renders correctly', () => {
        render(<ActiveLink
            href="/"
            activeClassName="active"
        >
            <a>Home</a>
        </ActiveLink>)

        expect(screen.getByText('Home')).toBeInTheDocument();
    })

    it('adds active class if active link as currently active', () => {
         render(<ActiveLink
            href="/"
            activeClassName="active"
        >
            <a>Home</a>
        </ActiveLink>)

        expect(screen.getByText('Home')).toHaveClass('active');
    })
});