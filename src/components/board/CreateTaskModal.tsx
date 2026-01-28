import { useForm } from 'react-hook-form';
import { CreateTaskRequest } from '../../types/api';
import { Modal } from '../Modal';

export const CreateTaskModal = ({
  columnId,
  onClose,
  onSubmit,
  isSubmitting
}: {
  columnId: number;
  onClose: () => void;
  onSubmit: (payload: CreateTaskRequest) => void;
  isSubmitting: boolean;
}) => {
  const { register, handleSubmit } = useForm<CreateTaskRequest>({ defaultValues: { columnId } });

  return (
    <Modal title="Create task" onClose={onClose}>
      <form onSubmit={handleSubmit((values) => onSubmit({ ...values, columnId }))}>
        <div className="form-row">
          <label>Title</label>
          <input className="input" {...register('title', { required: true })} />
        </div>
        <div className="form-row">
          <label>Description</label>
          <textarea className="input" rows={3} {...register('description')} />
        </div>
        <div className="form-row">
          <label>Tags (comma separated)</label>
          <input className="input" placeholder="design,frontend" {...register('tags')} />
        </div>
        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create task'}
        </button>
      </form>
    </Modal>
  );
};
