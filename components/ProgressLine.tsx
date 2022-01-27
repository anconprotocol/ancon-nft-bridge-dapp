import React, { useEffect, useState } from "react";

interface ProgressLineProps {
  steps: number;
  step: number;
}
function ProgressLine({ steps, step }: ProgressLineProps) {
  const [items, setItems] = useState({
    completed: [] as number[],
    notCompleted: [] as number[],
  });
  const createArray = () => {
    const length = [];
    const complete = [];

    for (let index = 1; index < steps - step; index++) {
      length.push(index);
    }
    for (let index = 0; index < step; index++) {
      complete.push(index);
    }
    setItems({ completed: complete, notCompleted: length });
  };
  useEffect(() => {
    createArray();
  }, [step]);

  return (
    <div className="">
      {step != 0 ? (
        <div className="pb-2 flex space-x-3 justify-center">
          {items.completed.map((key) => (
            <div
              className="h-0.5 bg-green-700 rounded w-1/12"
              key={key}
            ></div>
          ))}
          {step != steps && (
            <div className="h-1 bg-green-700 rounded w-1/12 animate-pulse"></div>
          )}

          {items.notCompleted.map((key) => (
            <div
              className="h-0.5 bg-slate-700 rounded w-1/12"
              key={key}
            ></div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default ProgressLine;
