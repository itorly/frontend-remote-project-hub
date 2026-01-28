import { useForm } from 'react-hook-form';
import { Modal } from './Modal';

export const CreateColumnModal = ({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit
}: {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string }) => void;
}) => {
  const { register, handleSubmit } = useForm<{ name: string }>({ defaultValues: { name: '' } });

  if (!isOpen) return null;

  return (
    <Modal title="Create column" onClose={onClose}>
      <form onSubmit={handleSubmit((values) => onSubmit(values))}>
        <div className="form-row">
          <label>Name</label>
          <input className="input" {...register('name', { required: true })} />
        </div>
        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create column'}
        </button>
      </form>
    </Modal>
  );
};
