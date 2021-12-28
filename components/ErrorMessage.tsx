import { messagePrefix } from "@ethersproject/hash";

interface ErrorMessageProps {
  message: string;
  show: boolean;
}
const ErrorMessage = ({ message, show }: ErrorMessageProps) => {
  return (
    <p className="text-red-600 font-bold text-sm">
      {show && message}
    </p>
  );
};

export default ErrorMessage;
