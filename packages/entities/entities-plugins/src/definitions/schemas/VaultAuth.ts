import type { VaultAuthFormSchema } from '../../types/plugins/vault-auth'

export const vaultAuthFormSchema: VaultAuthFormSchema = {
  'config-vault': {
    type: 'AutoSuggest',
    entity: 'vaults',
    placeholder: 'Select a Vault',
    inputValues: {
      fields: ['prefix', 'name', 'id'],
    },
    modelTransformer: (val: string) => ({ id: val }),
    keyFromObject: 'id',
  },
}
