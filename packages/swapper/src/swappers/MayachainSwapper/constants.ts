import { bchChainId, type ChainId } from '@shapeshiftoss/caip'
import { KnownChainIds } from '@shapeshiftoss/types'
import { isUtxoChainId } from '@shapeshiftoss/utils'

import type { SupportedChainIds, SwapSource } from '../../types'
import { SwapperName } from '../../types'

export const MAYA_PRECISION = 10

export const sellSupportedChainIds: Record<ChainId, boolean> = {
  [KnownChainIds.EthereumMainnet]: true,
  [KnownChainIds.BitcoinMainnet]: true,
  [KnownChainIds.ArbitrumMainnet]: true,
  [KnownChainIds.ThorchainMainnet]: true,
  [KnownChainIds.DashMainnet]: true,
  [KnownChainIds.MayachainMainnet]: true,
}

export const buySupportedChainIds: Record<ChainId, boolean> = {
  [KnownChainIds.EthereumMainnet]: true,
  [KnownChainIds.BitcoinMainnet]: true,
  [KnownChainIds.ArbitrumMainnet]: true,
  [KnownChainIds.ThorchainMainnet]: true,
  [KnownChainIds.DashMainnet]: true,
  [KnownChainIds.MayachainMainnet]: true,
}

export const MAYACHAIN_SUPPORTED_CHAIN_IDS: SupportedChainIds = {
  sell: Object.keys(sellSupportedChainIds),
  buy: Object.keys(buySupportedChainIds),
}

export const MAYACHAIN_STREAM_SWAP_SOURCE: SwapSource = `${SwapperName.Mayachain} • Streaming`
export const MAYACHAIN_LONGTAIL_SWAP_SOURCE: SwapSource = `${SwapperName.Mayachain} • Long-tail`
export const MAYACHAIN_LONGTAIL_STREAMING_SWAP_SOURCE: SwapSource = `${SwapperName.Mayachain} • Long-tail streaming`

export const MAYACHAIN_OUTBOUND_FEE_CACAO_UNIT = '200000000'

export const BTC_MAXIMUM_BYTES_LENGTH = 80

export const getMaxBytesLengthByChainId = (chainId: ChainId) => {
  if (isUtxoChainId(chainId)) return BTC_MAXIMUM_BYTES_LENGTH
  return Infinity
}
