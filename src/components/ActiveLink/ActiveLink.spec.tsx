import { render } from '@testing-library/react';
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
        const { getByText } = render(<ActiveLink
            href="/"
            activeClassName="active"
        >
            <a>Home</a>
        </ActiveLink>)

        expect(getByText('Home')).toBeInTheDocument();
    })

    it('adds active class if active link as currently active', () => {
        const { getByText } = render(<ActiveLink
            href="/"
            activeClassName="active"
        >
            <a>Home</a>
        </ActiveLink>)

        expect(getByText('Home')).toHaveClass('active');
    })
});