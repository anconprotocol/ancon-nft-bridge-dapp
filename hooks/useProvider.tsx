declare let window: any;
//custom hook that check the provider
function useProvider() {
  let provider;
  if (typeof window !== "undefined") {
    if (window.ethereum) {
      provider = window.ethereum;
      // console.log("provider", provider);
    } else if (window.web3) {
      provider = window.web3.currentProvider;
      // console.log("provider", provider);
    } else {
      window.alert("no connected");
    }
    return provider;
  }
}

export default useProvider;
