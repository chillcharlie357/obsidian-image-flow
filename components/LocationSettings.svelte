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

  const OPTIONS = [
    { value: 'vault_assets', label: 'Vault Assets', desc: 'Save to vault/assets/' },
    { value: 'filename_assets', label: 'Current File Assets', desc: 'Save to {filename}.assets/' },
    { value: 'filepath_assets', label: 'Current Folder Assets', desc: 'Save to {file_path}/assets/' },
    { value: 'custom', label: 'Custom', desc: 'Define your own path pattern' },
  ]
</script>

<div class="setting-item">
  <div class="setting-item-info">
    <div class="setting-item-name">Location Mode</div>
    <div class="setting-item-description">Choose where to save the images</div>
  </div>
  <div class="setting-item-control">
    <select bind:value={local.saveLocationMode} class="dropdown">
      {#each OPTIONS as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  </div>
</div>

{#if local.saveLocationMode === 'custom'}
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">Custom Path Pattern</div>
      <div class="setting-item-description">
        Available: {`{vault}, {date}, {filename}, {file_path}`}
      </div>
    </div>
    <div class="setting-item-control">
      <input type="text" bind:value={local.customLocationPattern} placeholder="{`{vault}/assets/{date}/`}">
    </div>
  </div>
{/if}

<div class="setting-item">
  <div class="setting-item-info">
    <div class="setting-item-name">Preview Path</div>
    <div class="setting-item-description">The image will be saved to:</div>
  </div>
  <div class="setting-item-control">
    <span class="preview-text">{preview()}</span>
  </div>
</div>

<style>
  .preview-text {
    font-family: var(--font-monospace);
    color: var(--text-accent);
    background-color: var(--background-secondary);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
  }
</style>
