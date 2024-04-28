export interface VaultAuthFormSchema {
  'config-vault': {
    type: string
    entity: string
    placeholder: string
    inputValues: {
      fields: string[]
    }
    modelTransformer: (val: string) => { id: string }
    keyFromObject: string
  }
}
