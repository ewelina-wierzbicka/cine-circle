type Props = {
  /** Wire this to the field's `aria-describedby` so the message is announced. */
  id?: string;
  error?: string;
};

/** The validation message under a form field. Renders nothing without an error. */
export function FieldError({ id, error }: Props) {
  if (!error) return null;

  return (
    <p id={id} className="text-error text-sm mt-2">
      {error}
    </p>
  );
}
