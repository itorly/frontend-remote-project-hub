import { ReactNode } from 'react';

export const Modal = ({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) => (
  <div className="modal-backdrop" role="dialog">
    <div className="card modal-card">
      <div className="flex space-between" style={{ marginBottom: '0.5rem' }}>
        <h3>{title}</h3>
        <button className="button secondary" onClick={onClose}>
          Close
        </button>
      </div>
      {children}
    </div>
  </div>
);
