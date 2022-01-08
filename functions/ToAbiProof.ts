import { ethers } from "ethers";
import { base64 } from "ethers/lib/utils";

const toAbiProof = (z: any) => {
  console.log("key", base64.decode(z.key));
  z.key = ethers.utils.hexlify(base64.decode(z.key));
  console.log("value", base64.decode(z.value));
  z.value = ethers.utils.hexlify(base64.decode(z.value));

  z.leaf.prefix = ethers.utils.hexlify(base64.decode(z.leaf.prefix));
  z.leaf.hash = 1;
  z.path = z.path.map((x: any) => {
    let suffix;
    if (!!x.suffix) {
      suffix = ethers.utils.hexlify(base64.decode(x.suffix));
      return {
        valid: true,
        prefix: ethers.utils.hexlify(base64.decode(x.prefix)),
        suffix: suffix,
        hash: 1,
      };
    } else {
      return {
        valid: true,
        prefix: ethers.utils.hexlify(base64.decode(x.prefix)),
        hash: 1,
        suffix: "0x",
      };
    }
  });
  z.leaf.prehash_key = 0;
  z.leaf.len = z.leaf.length;
  z.valid = true;
  z.leaf.valid = true;
  console.log("to abi proof", z);
  return z;
};

export default toAbiProof;
