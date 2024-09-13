import {
  FOX_STAKING_V1_ABI,
  RFOX_PROXY_CONTRACT,
  viemClientByNetworkId,
} from '@shapeshiftoss/contracts'
import { skipToken, useQuery } from '@tanstack/react-query'
import type { ReadContractQueryKey } from '@wagmi/core/query'
import { useMemo } from 'react'
import type { Address, ReadContractReturnType } from 'viem'
import { getAddress } from 'viem'
import { readContract } from 'viem/actions'
import { arbitrum } from 'viem/chains'
import type { Config } from 'wagmi'

type GetUnstakingRequestCountQueryKey = ReadContractQueryKey<
  typeof FOX_STAKING_V1_ABI,
  'getUnstakingRequestCount',
  readonly [Address],
  Config
>
type UnstakingRequestCount = ReadContractReturnType<
  typeof FOX_STAKING_V1_ABI,
  'getUnstakingRequestCount',
  readonly [Address]
>
type UseGetUnstakingRequestCountQueryProps<SelectData = UnstakingRequestCount> = {
  stakingAssetAccountAddress: string | undefined
  select?: (unstakingRequestCount: UnstakingRequestCount) => SelectData
}
const client = viemClientByNetworkId[arbitrum.id]

export const useGetUnstakingRequestCountQuery = <SelectData = UnstakingRequestCount>({
  stakingAssetAccountAddress,
  select,
}: UseGetUnstakingRequestCountQueryProps<SelectData>) => {
  // wagmi doesn't expose queryFn, so we reconstruct the queryKey and queryFn ourselves to leverage skipToken type safety
  const queryKey: GetUnstakingRequestCountQueryKey = useMemo(
    () => [
      'readContract',
      {
        address: RFOX_PROXY_CONTRACT,
        functionName: 'getUnstakingRequestCount',
        args: [
          stakingAssetAccountAddress ? getAddress(stakingAssetAccountAddress) : ('' as Address),
        ],
        chainId: arbitrum.id,
      },
    ],
    [stakingAssetAccountAddress],
  )

  const getUnstakingRequestCountQueryFn = useMemo(
    () =>
      stakingAssetAccountAddress
        ? () =>
            readContract(client, {
              abi: FOX_STAKING_V1_ABI,
              address: RFOX_PROXY_CONTRACT,
              functionName: 'getUnstakingRequestCount',
              args: [getAddress(stakingAssetAccountAddress)],
            })
        : skipToken,
    [stakingAssetAccountAddress],
  )

  const unstakingRequestCountQuery = useQuery({
    queryKey,
    queryFn: getUnstakingRequestCountQueryFn,
    select,
    retry: false,
  })

  return { ...unstakingRequestCountQuery, queryKey }
}
