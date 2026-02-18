import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Updates from '../Updates';

// Mock fetch globally
global.fetch = jest.fn();

describe('Updates', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should render updates component', () => {
    render(<Updates />);

    expect(screen.getByText(/Updates/i)).toBeInTheDocument();
    expect(screen.getByText(/These notes are pulled from the README/i)).toBeInTheDocument();
  });

  it('should show loading indicator initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Updates />);

    expect(screen.getByText(/Loading updates.../i)).toBeInTheDocument();
  });

  it('should display default planned improvements when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Updates />);

    await waitFor(() => {
      expect(screen.getByText(/Planned Improvements/i)).toBeInTheDocument();
      expect(screen.getByText(/Migrate to a Node backend script/i)).toBeInTheDocument();
    });
  });

  it('should display default open bugs when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Updates />);

    await waitFor(() => {
      expect(screen.getByText(/Open Bugs/i)).toBeInTheDocument();
      expect(screen.getByText(/Player projections are currently always 0/i)).toBeInTheDocument();
    });
  });

  it('should parse and display planned improvements from README', async () => {
    const mockReadme = `
# Fantasy Football Tracker

## Planned Improvements
- First improvement item
- Second improvement item
- Third improvement item

## Open Bugs
- Bug 1
- Bug 2
`;

    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => mockReadme,
    });

    render(<Updates />);

    await waitFor(() => {
      expect(screen.getByText(/First improvement item/i)).toBeInTheDocument();
      expect(screen.getByText(/Second improvement item/i)).toBeInTheDocument();
      expect(screen.getByText(/Third improvement item/i)).toBeInTheDocument();
    });
  });

  it('should parse and display open bugs from README', async () => {
    const mockReadme = `
# Fantasy Football Tracker

## Planned Improvements
- Improvement 1

## Open Bugs
- First bug description
- Second bug description
- Third bug description
`;

    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => mockReadme,
    });

    render(<Updates />);

    await waitFor(() => {
      expect(screen.getByText(/First bug description/i)).toBeInTheDocument();
      expect(screen.getByText(/Second bug description/i)).toBeInTheDocument();
      expect(screen.getByText(/Third bug description/i)).toBeInTheDocument();
    });
  });

  it('should handle empty README sections', async () => {
    const mockReadme = `
# Fantasy Football Tracker

## Planned Improvements

## Open Bugs
`;

    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => mockReadme,
    });

    render(<Updates />);

    await waitFor(() => {
      // Should fall back to defaults
      expect(screen.getByText(/Migrate to a Node backend script/i)).toBeInTheDocument();
    });
  });

  it('should handle HTTP error responses', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<Updates />);

    await waitFor(() => {
      // Should fall back to defaults
      expect(screen.getByText(/Planned Improvements/i)).toBeInTheDocument();
      expect(screen.getByText(/Open Bugs/i)).toBeInTheDocument();
    });
  });

  it('should handle empty response text', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => '',
    });

    render(<Updates />);

    await waitFor(() => {
      // Should fall back to defaults
      expect(screen.getByText(/Planned Improvements/i)).toBeInTheDocument();
    });
  });

  it('should fetch from correct GitHub URL', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => '## Planned Improvements\n- Test',
    });

    render(<Updates />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/joshuasellers/fantasy-football-tracker/main/README.md'
      );
    });
  });

  it('should display both sections side by side', async () => {
    const mockReadme = `
## Planned Improvements
- Plan 1
- Plan 2

## Open Bugs
- Bug 1
- Bug 2
`;

    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => mockReadme,
    });

    render(<Updates />);

    await waitFor(() => {
      const plannedSection = screen.getByText(/Planned Improvements/i).closest('.updates-card');
      const bugsSection = screen.getByText(/Open Bugs/i).closest('.updates-card');

      expect(plannedSection).toBeInTheDocument();
      expect(bugsSection).toBeInTheDocument();
      expect(plannedSection).toHaveTextContent('Plan 1');
      expect(bugsSection).toHaveTextContent('Bug 1');
    });
  });

  it('should handle case-insensitive section matching', async () => {
    const mockReadme = `
## planned improvements
- Lowercase section

## OPEN BUGS
- Uppercase section
`;

    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => mockReadme,
    });

    render(<Updates />);

    await waitFor(() => {
      expect(screen.getByText(/Lowercase section/i)).toBeInTheDocument();
      expect(screen.getByText(/Uppercase section/i)).toBeInTheDocument();
    });
  });

  it('should not show loading indicator after data loads', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => '## Planned Improvements\n- Test',
    });

    render(<Updates />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading updates.../i)).not.toBeInTheDocument();
    });
  });
});

