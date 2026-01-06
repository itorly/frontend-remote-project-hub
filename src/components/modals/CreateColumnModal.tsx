import { useForm } from "react-hook-form";
import type { CreateColumnRequest } from "../../api/types";
import { Modal } from "./Modal";

type CreateColumnModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateColumnRequest) => void;
};

export function CreateColumnModal({ open, onClose, onSubmit }: CreateColumnModalProps) {
  const { register, handleSubmit, reset } = useForm<CreateColumnRequest>({
    defaultValues: { name: "", position: undefined },
  });

  const submit = (values: CreateColumnRequest) => {
    onSubmit(values);
    reset();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create column">
      <form onSubmit={handleSubmit(submit)} style={{ display: "grid", gap: "0.75rem" }}>
        <label className="label">
          Column name
          <input
            className="input"
            placeholder="Backlog"
            {...register("name", { required: true, minLength: 2 })}
          />
        </label>
        <label className="label">
          Position (optional)
          <input
            className="input"
            type="number"
            min={0}
            placeholder="0"
            {...register("position", { valueAsNumber: true })}
          />
        </label>
        <button className="btn btn-primary" type="submit">
          Create
        </button>
      </form>
    </Modal>
  );
}
