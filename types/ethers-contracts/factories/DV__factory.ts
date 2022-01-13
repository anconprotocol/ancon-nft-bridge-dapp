/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { DV, DVInterface } from "../DV";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256[]",
        name: "dv",
        type: "uint256[]",
      },
    ],
    name: "LogDV",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "payee",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "weiAmount",
        type: "uint256",
      },
    ],
    name: "Withdrawn",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "payee",
        type: "address",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_fee",
        type: "uint256",
      },
    ],
    name: "setFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "pos",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "ruc21",
        type: "uint256[]",
      },
    ],
    name: "getCharsAt",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "seed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "ruc21",
        type: "uint256[]",
      },
    ],
    name: "calc",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405266071afd498d000060005534801561001b57600080fd5b50600180546001600160a01b031916331790556110398061003d6000396000f3fe608060405234801561001057600080fd5b50600436106100725760003560e01c8063b4dbca2911610050578063b4dbca29146100bc578063ced72f87146100dc578063fe1e6fa7146100ee57600080fd5b806351cff8d91461007757806369fe0e2d1461008c5780637d94792a1461009f575b600080fd5b61008a610085366004610da5565b610101565b005b61008a61009a366004610dd5565b6101aa565b6100a76101f8565b60405190151581526020015b60405180910390f35b6100cf6100ca366004610e9f565b610984565b6040516100b39190610edc565b6000545b6040519081526020016100b3565b6100e06100fc366004610f20565b6109e5565b6001546001600160a01b0316331461014f5760405162461bcd60e51b815260206004820152600c60248201526b24a72b20a624a22faaa9a2a960a11b60448201526064015b60405180910390fd5b476101636001600160a01b03831647610a28565b816001600160a01b03167f7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d58260405161019e91815260200190565b60405180910390a25050565b6001546001600160a01b031633146101f35760405162461bcd60e51b815260206004820152600c60248201526b24a72b20a624a22faaa9a2a960a11b6044820152606401610146565b600055565b6001546000906001600160a01b031633146102445760405162461bcd60e51b815260206004820152600c60248201526b24a72b20a624a22faaa9a2a960a11b6044820152606401610146565b60057f634d5695a469e6b9efa5533f382fbd1ad9158e3381ded76522fe2a423fb706d28190557f99f766f76cd58c1c532f5e19ff17e60721e36052c47b07e32e31825c80d76e5a81905560047f8e0b32fd77fade94289ef485e6ac163376d09623e06de98b6ea7c84dfdde2f5681905560037f82a4eb424021353cc766ac30194b7d5bf43f3cb8194c4805ac805a55b2a7f0ac8190557f43a40ae1d156b90395c7a90a76c813c6a60b641000ec181a8e91691458823edd83905560077f5832ed2ba53d789708be30c5f69f0b9ef692d77231a61745b7041ae1a1fa366681905560097fbb48f9a51b2be1fd8412d917210f00c0d51e2131292ffe8c765bfe8902ea577481905560017fe773cb4eb01d7e32c2ccb53d6ca9e933eabef96100d8f7fdd4d6988c85ffc2e58190557f59d51db2540d36ae987dfddb8a29a83816452c62070d36184e4e2cd3b1b60c8c86905560647f84fa35e963a209ed7b6693816f0819bcb70c934337c6902235d48a9c59ebe6eb557feb972bfd9e24bc26d8a6be6cef621408cbdcf8fa2ccd03b0e5bf1d9b7c401dee81905560027ffb8d863de1250aa620936e91467e1af01a92eb0e70a9507f29fbc3ded4c65f258190557f63383099118369e3b7e10810450c200ba30ca74f16a798c21d846e7b8f29f8e58590557f42029653146ebe413226ce23cfae86379992b393c3fb402468cadcf83978e5178690557ff4685705f1e8a2b5fd642201d4d95d225954347b60a0666e52091bfb5827846b87905560067f28e9ee75ff7f20824c25d4723851092a869ffac611a3eb059570d6e187e595ac8190557f092cab17842493b2edda637060cc3c8ddc4df49ea6b6667f2f4548f0f0e594bf85905560087fd028fcdb5d38510ad32704f5f3fabe271b0f5e8628c1c338e58a9c11174989c48190557fa205889fbe2196c922c843010181591e2912400186c4d347c9b7a44ef40c4a2c8590557f855db7cc0af49aa912543d366c2b099441c41f0cfa65f4caeb352462785462da8490557fc29ccf1405d46e3650025b4cb3dd2c6fea976ca3366b6639ae6c9b22378c92558390557f7cc2ad579ffe0e9670c4ed407723dde34cdc5f3ce03ea5a5fd278a558b291aec8790557fae01d7727e6eee9de04cfde373d61a6d46a5148baca09e4486c66e17138a24b08990557fb5393891b91a131a387ee1b19930cdd1ad27daef25ba41760fd9b6d081b525a18690557fdcb221fdc0ba66b5eb19aeae0a60c0b2f50a4b4f8cb643ac2923465c5b40d9f48190557f5beabe2a4ac2efcb1ef0c3fce4ecf091cc06ebc530b7479d4ad6e5674a9a28b48590557ff75dfdb90ad9f042c3f4bf794eb2e7b55595be3fceeb5802f74ec4ab0e8839548390557f12c53b7dfecb6f34e40fe42497c12ecc8c3c5ff824562a2c63180d8345f313998790557fee56fc309edd227cd64a43efdc7b9df8e0d68fc66d1a914838f33ce6722d06308890557ff40f9e2dfa205a982c8d28e97e755a86365736fa89255090e997e69e8c06d0668990557f3ebe71c8df1f0fac22f9f6d009841943c073a488bb96cc1c85a6dc6cb92e55428290557f0d60a508ebb86c28623483b6a7bf2e80fc3af8771db795d276285a14f2c284498690557f2d19eda09601d1463635d7fc9423b306d872432a8744d619896dcaa1b49aef2c8190557fa317fea477ba68011b572a98152ad41791d628652947d866e9083028565b055b8590557ffd02b3c5f17049b33cb3cfc1a3d245469deabcec0fb1528b1c0b2cc275f233048490557f1894fd0e41d99b56d28c1f24fb97a9b497e57dc1fd6819d17002662649ea3b488390557f6e8ec730b807831c9c870c30fc5c1950c8dd0c9945878d95b1ecbd3b3d15c5698790557f6974cef7ff82f6da1264065296afbb5dc8e0b2d2e62280969714a65bb37144db8890557f8bcf888a2aa1166affe869ce25a8507445ab0b024ba9c2ea8d2c7b1a1443786c8990557f622de4a18708fee3fc5670e88a00b03646420ea4046b070b0aac5b2284b5e5328290557f9f0bfb77eb6bf68bf66da56e6652f40179fe32427beec0f7e878ac20f154caf08690557f0ec379e567beb8643f1191ab2ac3cccd8ef506d0fac27dfd60dcbd5f839cbcd3557f2cbad2c35e5adbe3735df24cde4cd4d0a73ee8913139f5c08bfc106c52cbd6c48490557fc0e0b270d6a3842be26232ffb2e2840cbd127be11ca0803d93db818e2f486328929092557f88d093c7bb7ffa4817e8a385b1bb36c7eac72ba24b12e945976fec5fb5fd7687557f6cd47c6a0928bdd7255b3c178b34a6ddc8f0f1294bfd810402dd8982df5392d7939093557f23e0abd83bd4ce040928401cbeba0558b4c7d8d34df42acf3480bf2d89650ffd939093557ff4f1eceb25b3be01f51e2842b621105eb6b3f24b07b11efd4fe0e494eac0da45939093557f0422f2c6de3e18611017c94f3c4adf9a2cea53e208383a19ce72529447103185556000527f83ec6a1f0257b830b5e016457c9cf1435391bf56cc98f369a58a54fe937724656020527fb5912c52f63f06346f393a383d476a869b371e04d35406c964c4c6b955fb0ce85590565b606060008061099284610b46565b604080516002808252606082018352939550919350600092906020830190803683370190505090506109c8828260136000610c84565b90925090506109db828260146001610c84565b9695505050505050565b600082815260026020526040812082518290849086908110610a0957610a09610f67565b6020026020010151815260200190815260200160002054905092915050565b80471015610a785760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a20696e73756666696369656e742062616c616e63650000006044820152606401610146565b6000826001600160a01b03168260405160006040518083038185875af1925050503d8060008114610ac5576040519150601f19603f3d011682016040523d82523d6000602084013e610aca565b606091505b5050905080610b415760405162461bcd60e51b815260206004820152603a60248201527f416464726573733a20756e61626c6520746f2073656e642076616c75652c207260448201527f6563697069656e74206d617920686176652072657665727465640000000000006064820152608401610146565b505050565b6060806060610b566006856109e5565b60051480610b6e5750610b6a6007856109e5565b6005145b15610bdd57610b7e6007856109e5565b60051415610ba857600584600781518110610b9b57610b9b610f67565b6020026020010181815250505b610bb36006856109e5565b60051415610bdd57600584600681518110610bd057610bd0610f67565b6020026020010181815250505b610be8600a856109e5565b6004148015610c015750610bfd600b856109e5565b6003145b15610c4957600484600a81518110610c1b57610c1b610f67565b602002602001018181525050600384600b81518110610c3c57610c3c610f67565b6020026020010181815250505b610c54600a856109e5565b60051415610c7e57600584600a81518110610c7157610c71610f67565b6020026020010181815250505b93915050565b6060806000600285825b8115610ce457898281518110610ca657610ca6610f67565b602002602001015183610cb99190610f93565b610cc39085610fb2565b9350610cd0836001610fb2565b9250610cdd600183610fca565b9150610c8e565b60008415610d26576000610cf9600b87610fe1565b9050801580610d085750806001145b15610d165760009150610d24565b610d2181600b610fca565b91505b505b87610d6c57808b601481518110610d3f57610d3f610f67565b602002602001018181525050808a600081518110610d5f57610d5f610f67565b6020026020010181815250505b8760011415610d9657808a600181518110610d8957610d89610f67565b6020026020010181815250505b50989997985050505050505050565b600060208284031215610db757600080fd5b81356001600160a01b0381168114610dce57600080fd5b9392505050565b600060208284031215610de757600080fd5b5035919050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112610e1557600080fd5b8135602067ffffffffffffffff80831115610e3257610e32610dee565b8260051b604051601f19603f83011681018181108482111715610e5757610e57610dee565b604052938452858101830193838101925087851115610e7557600080fd5b83870191505b84821015610e9457813583529183019190830190610e7b565b979650505050505050565b600060208284031215610eb157600080fd5b813567ffffffffffffffff811115610ec857600080fd5b610ed484828501610e04565b949350505050565b6020808252825182820181905260009190848201906040850190845b81811015610f1457835183529284019291840191600101610ef8565b50909695505050505050565b60008060408385031215610f3357600080fd5b82359150602083013567ffffffffffffffff811115610f5157600080fd5b610f5d85828601610e04565b9150509250929050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b6000816000190483118215151615610fad57610fad610f7d565b500290565b60008219821115610fc557610fc5610f7d565b500190565b600082821015610fdc57610fdc610f7d565b500390565b600082610ffe57634e487b7160e01b600052601260045260246000fd5b50069056fea264697066735822122031a234c42189d1c56dd2baec7669e0988236b7c0f4636a3d6c94135a4260aef364736f6c634300080b0033";

type DVConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DVConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DV__factory extends ContractFactory {
  constructor(...args: DVConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<DV> {
    return super.deploy(overrides || {}) as Promise<DV>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): DV {
    return super.attach(address) as DV;
  }
  connect(signer: Signer): DV__factory {
    return super.connect(signer) as DV__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DVInterface {
    return new utils.Interface(_abi) as DVInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): DV {
    return new Contract(address, _abi, signerOrProvider) as DV;
  }
}