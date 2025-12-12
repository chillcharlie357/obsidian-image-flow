<script lang="ts">
  import RenameSettings from './RenameSettings.svelte'
  import LocationSettings from './LocationSettings.svelte'
  import type { ImageFlowSettingsCore, NoteContext } from './types'
  interface Props { settings: ImageFlowSettingsCore; onSave: (s: ImageFlowSettingsCore) => void; ctx?: NoteContext }
  let { settings, onSave, ctx }: Props = $props()
  let local = $state({ ...settings })
  function save() { onSave(local) }
</script>

<div class="image-flow-settings">
  <div class="setting-item-heading">
    <div class="setting-item-name">Image Renaming</div>
  </div>

  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">Enable image renaming</div>
      <div class="setting-item-description">Automatically rename images when pasting</div>
    </div>
    <div class="setting-item-control">
      <div class="checkbox-container {local.renameEnabled ? 'is-enabled' : ''}" onclick={() => local.renameEnabled = !local.renameEnabled}>
        <input type="checkbox" bind:checked={local.renameEnabled}>
      </div>
    </div>
  </div>

  {#if local.renameEnabled}
    <RenameSettings 
      value={{ renamePattern: local.renamePattern, keepOriginal: local.keepOriginal }} 
      onChange={(v) => { local.renamePattern = v.renamePattern; local.keepOriginal = v.keepOriginal }} 
    />
  {/if}

  <div class="setting-item-heading">
    <div class="setting-item-name">Save Location</div>
  </div>

  <LocationSettings 
    value={{ saveLocationMode: local.saveLocationMode, customLocationPattern: local.customLocationPattern }} 
    ctx={ctx} 
    onChange={(v) => { local.saveLocationMode = v.saveLocationMode; local.customLocationPattern = v.customLocationPattern }} 
  />

  <div class="setting-item">
    <div class="setting-item-info"></div>
    <div class="setting-item-control">
      <button class="mod-cta" onclick={save}>Save Settings</button>
    </div>
  </div>
</div>

<style>
  .image-flow-settings {
    display: flex;
    flex-direction: column;
    gap: 0px;
  }
  .setting-item-heading {
    border-top: 1px solid var(--background-modifier-border);
    border-bottom: 1px solid var(--background-modifier-border);
    margin-top: 18px;
    padding: 18px 0 8px 0;
    font-weight: 600;
    color: var(--text-normal);
  }
  .image-flow-settings > .setting-item-heading:first-child {
    margin-top: 0;
    border-top: none;
  }
</style>
