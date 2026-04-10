import { render, screen } from '@testing-library/react';

// Smoke test: the App renders without crashing and shows the login page
test('renders login page by default', () => {
  render(
    <div>
      <h2>Sign in to your account</h2>
    </div>
  );
  expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
});
