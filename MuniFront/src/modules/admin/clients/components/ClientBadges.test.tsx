import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientTypeBadge } from './ClientTypeBadge';
import { ClientStatusBadge } from './ClientStatusBadge';

describe('ClientTypeBadge', () => {
  it('shows "Local" for LOCAL', () => {
    render(<ClientTypeBadge value="LOCAL" />);
    expect(screen.getByText('Local')).toBeInTheDocument();
  });

  it('shows "No local" for NO_LOCAL', () => {
    render(<ClientTypeBadge value="NO_LOCAL" />);
    expect(screen.getByText('No local')).toBeInTheDocument();
  });

  it('shows "Jubilado" for JUBILADO', () => {
    render(<ClientTypeBadge value="JUBILADO" />);
    expect(screen.getByText('Jubilado')).toBeInTheDocument();
  });

  it('shows "Ayuda social" for AYUDA_SOCIAL', () => {
    render(<ClientTypeBadge value="AYUDA_SOCIAL" />);
    expect(screen.getByText('Ayuda social')).toBeInTheDocument();
  });

  it('does not show internal codes', () => {
    render(<ClientTypeBadge value="NO_LOCAL" />);
    expect(screen.queryByText('NO_LOCAL')).not.toBeInTheDocument();
  });
});

describe('ClientStatusBadge', () => {
  it('shows Activo for active clients', () => {
    render(<ClientStatusBadge active={true} />);
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('shows Inactivo for inactive clients', () => {
    render(<ClientStatusBadge active={false} />);
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });
});
