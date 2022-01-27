interface StepInterface {
  func:() => Promise<void>
}
const Step0 = ({func}: StepInterface) => {
  return (
    <div className="mt-4 flex flex-col items-center select-none">
      <p className="font-medium">Register wallet account in Ancon Protocol Contract</p>
      <div
        onClick={func}
        className="mt-4 bg-purple-700 border-2 border-purple-700 rounded-lg px-4 py-2 text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer"
      >
        <p>Claim</p>
      </div>
    </div>
  );
}

export default Step0;
