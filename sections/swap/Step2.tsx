import React from "react";

function Step2() {
  return (
    <div className="flex flex-col items-center">
      <div
        className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-dashed border-primary-500 mt-4"
        role="status"
      ></div>
      <p className="animate-pulse mt-4">
        Wait for a few minutes while we transfer the token...
      </p>
    </div>
  );
}

export default Step2;
