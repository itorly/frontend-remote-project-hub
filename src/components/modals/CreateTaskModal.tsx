import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Column, CreateTaskRequest } from "../../api/types";
import { Modal } from "./Modal";

type CreateTaskModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateTaskRequest) => void;
  columns: Column[];
  defaultColumnId?: number | null;
};

export function CreateTaskModal({
  open,
  onClose,
  onSubmit,
  columns,
  defaultColumnId,
}: CreateTaskModalProps) {
  const { register, handleSubmit, reset, watch, setValue } = useForm<CreateTaskRequest>({
    defaultValues: {
      title: "",
      description: "",
      columnId: defaultColumnId || columns[0]?.id,
      tags: "",
      dueDate: "",
    },
  });

  const selectedColumnId = watch("columnId");

  useEffect(() => {
    if (defaultColumnId) {
      setValue("columnId", defaultColumnId);
    }
  }, [defaultColumnId, setValue]);

  const submit = (values: CreateTaskRequest) => {
    onSubmit({ ...values, columnId: Number(values.columnId) });
    reset({ columnId: defaultColumnId || columns[0]?.id });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create task">
      <form onSubmit={handleSubmit(submit)} style={{ display: "grid", gap: "0.75rem" }}>
        <label className="label">
          Title
          <input
            className="input"
            placeholder="Design hero"
            {...register("title", { required: true, minLength: 2 })}
          />
        </label>
        <label className="label">
          Description
          <textarea
            className="input"
            placeholder="What should happen?"
            style={{ minHeight: 90 }}
            {...register("description")}
          />
        </label>
        <label className="label">
          Column
          <select className="input" {...register("columnId")} defaultValue={selectedColumnId}>
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.name}
              </option>
            ))}
          </select>
        </label>
        <label className="label">
          Tags (comma separated)
          <input className="input" placeholder="frontend, q1" {...register("tags")} />
        </label>
        <label className="label">
          Due date
          <input className="input" type="date" {...register("dueDate")} />
        </label>
        <button className="btn btn-primary" type="submit">
          Create task
        </button>
      </form>
    </Modal>
  );
}
