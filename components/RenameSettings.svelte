<script lang="ts">
  import type { RenameSettingsValue } from './types'
  interface Props { value: RenameSettingsValue; onChange: (v: RenameSettingsValue) => void }
  let { value, onChange }: Props = $props()
  let local = $state({ ...value })
  $effect(() => { onChange(local) })

  function sampleName() {
    return generateName('image.png', local)
  }
  function generateName(original: string, v: RenameSettingsValue) {
    const base = original.replace(/\.[^/.]+$/, '')
    const ext = original.split('.').pop() || 'png'
    if (v.keepOriginal) return `${base}.${ext}`
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const random = Math.random().toString(36).slice(2, 8)
    const name = v.renamePattern
      .replace(/\{date\}/g, date)
      .replace(/\{time\}/g, time)
      .replace(/\{random\}/g, random)
      .replace(/\{filename\}/g, base)
    return `${name}.${ext}`
  }
</script>

<div class="setting-item">
  <div class="setting-item-info">
    <div class="setting-item-name">Keep original filename</div>
    <div class="setting-item-description">Use the original filename instead of generating a new one</div>
  </div>
  <div class="setting-item-control">
    <div class="checkbox-container {local.keepOriginal ? 'is-enabled' : ''}" onclick={() => local.keepOriginal = !local.keepOriginal}>
      <input type="checkbox" bind:checked={local.keepOriginal}>
    </div>
  </div>
</div>

<div class="setting-item">
  <div class="setting-item-info">
    <div class="setting-item-name">Rename Pattern</div>
    <div class="setting-item-description">
      Available: {`{date}, {time}, {random}, {filename}`}
      <div class="setting-item-description-sub">Preview: {sampleName()}</div>
    </div>
  </div>
  <div class="setting-item-control">
    <input type="text" bind:value={local.renamePattern} disabled={local.keepOriginal} placeholder="{`{date}-{time}-{random}`}">
  </div>
</div>

<style>
  .setting-item-description-sub {
    margin-top: 4px;
    font-size: 0.9em;
    color: var(--text-muted);
    font-family: var(--font-monospace);
  }
</style>
