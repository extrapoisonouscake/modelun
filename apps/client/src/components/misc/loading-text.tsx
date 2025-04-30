import { Spinner } from "../ui/spinner";

export function LoadingText({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center items-center gap-2 mt-[5vmin]">
      <Spinner className="animate-[spin_0.65s_linear_infinite] text-gray-500" />
      {children}
    </div>
  );
}
