import { render, screen } from '@testing-library/react';
import { Header } from '.';

jest.mock("next/router", () => ({
    useRouter() {
        return {
            asPath: "/"
        }
    }
}));

jest.mock("next-auth/react", () => ({
    useSession() {
        return {
            data: null,
            status: "authenticated"
        }
    }
}));

describe('Header component', () => {

    it('renders correctly', () => {
        render(<Header />)

        //screen.logTestingPlaygroundURL();

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Posts')).toBeInTheDocument();
    })
});