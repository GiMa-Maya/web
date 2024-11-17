import type { StdSignDoc } from '@keplr-wallet/types'
import type { AssetId } from '@shapeshiftoss/caip'
import { fromAssetId, mayachainAssetId } from '@shapeshiftoss/caip'
import type { BTCSignTx } from '@shapeshiftoss/hdwallet-core'
import { isSome } from '@shapeshiftoss/utils'

import type {
  BuyAssetBySellIdInput,
  CosmosSdkTransactionExecutionProps,
  Swapper,
  SwapperConfig,
  UtxoTransactionExecutionProps,
} from '../../types'
import { executeEvmTransaction } from '../../utils'
import { buySupportedChainIds, sellSupportedChainIds } from './constants'
import type { MayanodePoolResponse } from './types'
import { poolAssetIdToAssetId } from './utils/poolAssetHelpers/poolAssetHelpers'
import { mayaService } from './utils/mayaService'

const getSupportedAssets = async (
  config: SwapperConfig,
): Promise<{
  supportedSellAssetIds: AssetId[]
  supportedBuyAssetIds: AssetId[]
}> => {
  const daemonUrl = config.REACT_APP_MAYACHAIN_NODE_URL
  const mayachainSwapLongtailEnabled = config.REACT_APP_FEATURE_MAYACHAINSWAP_LONGTAIL
  let supportedSellAssetIds: AssetId[] = [mayachainAssetId]
  let supportedBuyAssetIds: AssetId[] = [mayachainAssetId]
  const poolResponse = await mayaService.get<MayanodePoolResponse[]>(
    `${daemonUrl}/lcd/mayachain/pools`,
  )

  const longtailTokensJson = await import('./generated/generatedMayaLongtailTokens.json')
  const longtailTokens: AssetId[] = longtailTokensJson.default
  const l1Tokens = poolResponse.isOk()
    ? poolResponse
        .unwrap()
        .data.filter(pool => pool.status === 'Available')
        .map(pool => poolAssetIdToAssetId(pool.asset))
        .filter(isSome)
    : []

  const allTokens = mayachainSwapLongtailEnabled ? [...longtailTokens, ...l1Tokens] : l1Tokens

  allTokens.forEach(assetId => {
    const chainId = fromAssetId(assetId).chainId
    sellSupportedChainIds[chainId] && supportedSellAssetIds.push(assetId)
    buySupportedChainIds[chainId] && supportedBuyAssetIds.push(assetId)
  })

  return { supportedSellAssetIds, supportedBuyAssetIds }
}

export const mayachainSwapper: Swapper = {
  executeEvmTransaction,

  executeCosmosSdkTransaction: async (
    txToSign: StdSignDoc,
    { signAndBroadcastTransaction }: CosmosSdkTransactionExecutionProps,
  ): Promise<string> => {
    return await signAndBroadcastTransaction(txToSign)
  },

  executeUtxoTransaction: async (
    txToSign: BTCSignTx,
    { signAndBroadcastTransaction }: UtxoTransactionExecutionProps,
  ): Promise<string> => {
    return await signAndBroadcastTransaction(txToSign)
  },

  filterAssetIdsBySellable: async (_, config): Promise<AssetId[]> =>
    await getSupportedAssets(config).then(({ supportedSellAssetIds }) => supportedSellAssetIds),

  filterBuyAssetsBySellAssetId: async ({
    assets,
    sellAsset,
    config,
  }: BuyAssetBySellIdInput): Promise<AssetId[]> => {
    const { supportedSellAssetIds, supportedBuyAssetIds } = await getSupportedAssets(config)
    if (!supportedSellAssetIds.includes(sellAsset.assetId)) return []
    return assets
      .filter(
        asset =>
          supportedBuyAssetIds.includes(asset.assetId) && asset.assetId !== sellAsset.assetId,
      )
      .map(asset => asset.assetId)
  },
}
