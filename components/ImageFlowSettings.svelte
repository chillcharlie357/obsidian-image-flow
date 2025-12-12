<script lang="ts">
  import RenameSettings from './RenameSettings.svelte'
  import LocationSettings from './LocationSettings.svelte'
  import type { ImageFlowSettingsCore, NoteContext } from './types'
  interface Props { settings: ImageFlowSettingsCore; onSave: (s: ImageFlowSettingsCore) => void; ctx?: NoteContext }
  let { settings, onSave, ctx }: Props = $props()
  let local = $state({ ...settings })
  function save() { onSave(local) }
</script>

<div>
  <label><input type="checkbox" bind:checked={local.renameEnabled}>Enable image renaming</label>
  <RenameSettings value={{ renamePattern: local.renamePattern, keepOriginal: local.keepOriginal }} onChange={(v) => { local.renamePattern = v.renamePattern; local.keepOriginal = v.keepOriginal }} />
  <LocationSettings value={{ saveLocationMode: local.saveLocationMode, customLocationPattern: local.customLocationPattern }} ctx={ctx} onChange={(v) => { local.saveLocationMode = v.saveLocationMode; local.customLocationPattern = v.customLocationPattern }} />
  <button onclick={save}>Save</button>
</div>

<style>
  div { padding: 8px }
  input { margin: 4px }
</style>

 
