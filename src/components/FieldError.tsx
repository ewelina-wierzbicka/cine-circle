type Props = {
  error?: string;
};

/** The validation message under an input. Renders nothing when there is none. */
export function FieldError({ error }: Props) {
  if (!error) return null;
  return <p className="text-error text-sm mt-2">{error}</p>;
}
