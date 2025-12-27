import React from 'react';
import { render, screen } from '@testing-library/react';
import ExportSnapshot from '../../frontend/src/components/ExportSnapshot';

describe('ExportSnapshot', ()=>{
  test('renders export button with accessible label', ()=>{
    render(<ExportSnapshot targetId="root" />);
    const btn = screen.getByRole('button', { name: /export snapshot/i });
    expect(btn).toBeInTheDocument();
  });
});
