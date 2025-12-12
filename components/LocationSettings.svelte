<script lang="ts">
  import type { SaveLocationMode, LocationSettingsValue, NoteContext } from './types'
  interface Props { value: LocationSettingsValue; ctx?: NoteContext; onChange: (v: LocationSettingsValue) => void }
  let { value, ctx, onChange }: Props = $props()
  let local = $state({ ...value })
  $effect(() => { onChange(local) })
  function preview() {
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const base = local.saveLocationMode === 'vault_assets'
      ? 'assets/'
      : local.saveLocationMode === 'filename_assets'
      ? `${(ctx?.filename || 'note')}.assets/`
      : local.saveLocationMode === 'filepath_assets'
      ? `${(ctx?.file_path || '')}/assets/`
      : local.customLocationPattern
    return base
      .replace(/\{date\}/g, date)
      .replace(/\{filename\}/g, ctx?.filename || 'note')
      .replace(/\{file_path\}/g, ctx?.file_path || '')
      .replace(/\{vault\}\//g, '')
  }
</script>

<div>
  <label><input type="radio" name="loc" value="vault_assets" bind:group={local.saveLocationMode}>Save to vault/assets/</label>
  <label><input type="radio" name="loc" value="filename_assets" bind:group={local.saveLocationMode}>Save to {`{filename}.assets/`}</label>
  <label><input type="radio" name="loc" value="filepath_assets" bind:group={local.saveLocationMode}>Save to {`{file_path}/assets/`}</label>
  <label><input type="radio" name="loc" value="custom" bind:group={local.saveLocationMode}>Custom directory</label>
  {#if local.saveLocationMode === 'custom'}
    <div>
      <input placeholder={"{vault}/assets/{date}/"} bind:value={local.customLocationPattern}>
    </div>
  {/if}
  <div>Example: {preview()}</div>
</div>
