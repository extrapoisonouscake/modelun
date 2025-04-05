import { Spinner } from "../ui/spinner";

export const PendingContent = <T,>({
  children,
  value,
  empty,
}: {
  children: (data: Exclude<T, undefined>) => React.ReactNode;
  value: T;
  empty?: React.ReactNode;
}) => {
  if (value === null) {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (value === undefined) {
    return empty;
  }

  return <>{children(value as Exclude<T, undefined>)}</>;
};
