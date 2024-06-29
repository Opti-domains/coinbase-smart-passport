import { useEnsName, usePublicClient, useAccount, useChains, useReadContract } from 'wagmi';
import packet from 'dns-packet';
import { Chain, mainnet } from 'viem/chains';

// Same address across chains
const UNIVERSAL_ENS_REGISTRY = '0x8888110038E46D4c4ba75aFF88EaAC6f9aA537c1';
const UNIVERSAL_ENS_REGISTRY_OPERATOR =
  '0x888811AC3DC01628eBD22b1Aa01a35825aD997e8';

const ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'getReverseUniversalResolver',
    outputs: [
      {
        internalType: 'contract UniversalResolverTemplate',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'name',
        type: 'bytes',
      },
    ],
    name: 'getRegistryByName',
    outputs: [
      {
        internalType: 'contract ENS',
        name: 'registry',
        type: 'address',
      },
      {
        internalType: 'contract UniversalResolverTemplate',
        name: 'universalResolver',
        type: 'address',
      },
      {
        internalType: 'contract Resolver',
        name: 'resolver',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'node',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'finalOffset',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface UseUniversalEnsReverseResolverProps {
  address?: string;
  chainId?: number;
  operator?: string;
}

export function useUniversalEnsReverseResolver({
  address,
  chainId,
  operator = UNIVERSAL_ENS_REGISTRY_OPERATOR,
}: UseUniversalEnsReverseResolverProps) {
  return useReadContract({
    abi: ABI,
    address: address && chainId ? UNIVERSAL_ENS_REGISTRY : undefined,
    args: [address as `0x${string}`, operator as `0x${string}`],
    chainId,
    functionName: 'getReverseUniversalResolver',
  });
}

interface UseUniversalEnsRegistryResolverProps {
  name?: string | null;
  chainId?: number;
  operator?: string;
}

export function useUniversalEnsRegistryResolver({
  chainId,
  name,
  operator = UNIVERSAL_ENS_REGISTRY_OPERATOR,
}: UseUniversalEnsRegistryResolverProps) {
  return useReadContract({
    abi: ABI,
    address: name && chainId ? UNIVERSAL_ENS_REGISTRY : undefined,
    args: [
      operator as `0x${string}`,
      '0x' + (packet as any).name.encode(name || '').toString('hex') as `0x${string}`,
    ],
    chainId,
    functionName: 'getRegistryByName',
  });
}


export function useMainnet() {
  const chainId = mainnet.id;
  const chains = useChains();
  const enabled = chains?.some((chain: Chain) => chain?.id === chainId);

  return { chainId, enabled };
}


export function useMainnetEnsName(address: `0x${string}` | undefined) {
  const { chain } = useAccount();
  const { chainId: mainnetChainId, enabled } = useMainnet();

  const {
    data: universalResolver,
    isError,
    isLoading,
  } = useUniversalEnsReverseResolver({ address, chainId: chain?.id });

  console.log(universalResolver, isError, isLoading, address, chain?.id)

  const { data: ensName } = useEnsName({
    address:
      isLoading ||
      isError ||
      !universalResolver ||
      universalResolver === '0x0000000000000000000000000000000000000000'
        ? undefined
        : address,
    chainId: chain?.id,
    // universalResolverAddress: universalResolver,
  });

  const { data: ensNameMainnet } = useEnsName({
    address,
    chainId: mainnetChainId,
  });

  if (isLoading) return undefined;
  if (
    isError ||
    !universalResolver ||
    universalResolver === '0x0000000000000000000000000000000000000000'
  )
    return ensNameMainnet;
  return ensName;
}
