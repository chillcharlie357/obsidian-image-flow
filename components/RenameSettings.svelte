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

<div>
  <label><input type="checkbox" bind:checked={local.keepOriginal}>Keep original filename</label>
  <div>
    <input placeholder={"{date}-{time}-{random}"} bind:value={local.renamePattern} disabled={local.keepOriginal}>
  </div>
  <div>Example: {sampleName()}</div>
</div>
