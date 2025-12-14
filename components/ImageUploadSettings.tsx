import { useEffect } from "react";
import type { ImageFlowSettingsCore, ImageUploaderProfile } from "./types";

export default function ImageUploadSettings(props: {
	value: ImageFlowSettingsCore;
	onChange: (v: ImageFlowSettingsCore) => void;
}) {
	const { value, onChange } = props;
	const profiles: ImageUploaderProfile[] = value.uploaderProfiles || [];
	const activeProfile =
		profiles.find((p) => p.id === value.activeUploaderProfileId) || null;

	function set(
		next: Partial<ImageFlowSettingsCore>,
		profilePatch?: Partial<ImageUploaderProfile>
	) {
		let merged: Partial<ImageFlowSettingsCore> = { ...next };
		if (profilePatch && activeProfile) {
			const nextProfiles = profiles.map((p) =>
				p.id === activeProfile.id ? { ...p, ...profilePatch } : p
			);
			merged = { ...merged, uploaderProfiles: nextProfiles };
		}
		onChange({ ...value, ...merged });
	}

	useEffect(() => {
		if (!value.uploadEnabled) return;
		if (profiles.length === 0) {
			const id = "default";
			const profile: ImageUploaderProfile = {
				id,
				name: "Default",
				uploaderType: value.uploaderType,
				uploaderCommandPath: value.uploaderCommandPath,
				deleteLocalAfterUpload: value.deleteLocalAfterUpload,
			};
			set({ uploaderProfiles: [profile], activeUploaderProfileId: id });
		}
	}, [value.uploadEnabled]);

	function addProfileFromCurrent() {
		const nextProfiles = [...profiles];
		const id = `profile_${Date.now()}_${nextProfiles.length}`;
		const profile: ImageUploaderProfile = {
			id,
			name: `Profile ${nextProfiles.length + 1}`,
			uploaderType: value.uploaderType,
			uploaderCommandPath: value.uploaderCommandPath,
			deleteLocalAfterUpload: value.deleteLocalAfterUpload,
		};
		nextProfiles.push(profile);
		set({
			uploaderProfiles: nextProfiles,
			activeUploaderProfileId: id,
		});
	}

	function updateProfile(id: string, patch: Partial<ImageUploaderProfile>) {
		const nextProfiles = profiles.map((p) =>
			p.id === id ? { ...p, ...patch } : p
		);
		set({ uploaderProfiles: nextProfiles });
	}

	function useProfile(profile: ImageUploaderProfile) {
		set({
			uploaderType: profile.uploaderType,
			uploaderCommandPath: profile.uploaderCommandPath,
			deleteLocalAfterUpload: profile.deleteLocalAfterUpload,
			activeUploaderProfileId: profile.id,
		});
	}

	function removeProfile(id: string) {
		const nextProfiles = profiles.filter((p) => p.id !== id);
		const next: Partial<ImageFlowSettingsCore> = {
			uploaderProfiles: nextProfiles,
		};
		if (value.activeUploaderProfileId === id) {
			const first = nextProfiles[0];
			next.activeUploaderProfileId = first ? first.id : null;
			if (first) {
				next.uploaderType = first.uploaderType;
				next.uploaderCommandPath = first.uploaderCommandPath;
				next.deleteLocalAfterUpload = first.deleteLocalAfterUpload;
			}
		}
		set(next);
	}

	function deleteActiveProfile() {
		if (!activeProfile) return;
		if (profiles.length <= 1) return;
		removeProfile(activeProfile.id);
	}

	function copyActiveProfile() {
		if (!activeProfile) return;
		const nextProfiles = [...profiles];
		const id = `profile_${Date.now()}_${nextProfiles.length}`;
		const profile: ImageUploaderProfile = {
			...activeProfile,
			id,
			name: `${activeProfile.name || "Profile"} copy`,
		};
		nextProfiles.push(profile);
		set({ uploaderProfiles: nextProfiles, activeUploaderProfileId: id });
	}
	return (
		<>
			<div className="setting-item-heading">
				<div className="setting-item-name">Image Upload</div>
			</div>

			<div className="setting-item">
				<div className="setting-item-info">
					<div className="setting-item-name">Enable image upload</div>
					<div className="setting-item-description">
						Upload pasted images through external tools. Currently
						PicList is supported; PicGo/PicGo-Core are TODO.
					</div>
				</div>
				<div className="setting-item-control">
					<div
						className={`checkbox-container ${
							value.uploadEnabled ? "is-enabled" : ""
						}`}
						role="checkbox"
						aria-checked={value.uploadEnabled}
						tabIndex={0}
						onClick={() =>
							set({ uploadEnabled: !value.uploadEnabled })
						}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								set({ uploadEnabled: !value.uploadEnabled });
							}
						}}
					>
						<input
							type="checkbox"
							checked={value.uploadEnabled}
							tabIndex={-1}
							readOnly
						/>
					</div>
				</div>
			</div>

			{value.uploadEnabled && (
				<div>
					<div className="setting-item">
						<div className="setting-item-info">
							<div className="setting-item-name">Profile</div>
							<div className="setting-item-description">
								Select a saved uploader profile;
							</div>
						</div>
						<div className="setting-item-control">
							<div
								style={{
									display: "flex",
									alignItems: "center",
								}}
							>
								<div>
									<select
										value={
											value.activeUploaderProfileId || ""
										}
										onChange={(e) => {
											const id = e.target.value;
											if (!id) {
												set({
													activeUploaderProfileId:
														null,
												});
												return;
											}
											const profile = profiles.find(
												(p) => p.id === id
											);
											if (profile) {
												useProfile(profile);
											}
										}}
									>
										{profiles.map((p) => (
											<option key={p.id} value={p.id}>
												{p.name || p.id}
											</option>
										))}
									</select>
									<input
										type="text"
										value={activeProfile?.name || ""}
										onChange={(e) => {
											if (!activeProfile) return;
											set(
												{},
												{
													name: e.target.value,
												}
											);
										}}
										placeholder="Profile name"
										style={{ marginLeft: "8px" }}
									/>
								</div>
							</div>
              
							<div style={{ marginTop: "8px" }}>
								<button
									type="button"
									onClick={copyActiveProfile}
								>
									Copy
								</button>
								<button
									type="button"
									onClick={deleteActiveProfile}
									disabled={
										!activeProfile || profiles.length <= 1
									}
									style={{ marginLeft: "8px" }}
								>
									Delete
								</button>
							</div>
						</div>
					</div>

					<div className="setting-item">
						<div className="setting-item-info">
							<div className="setting-item-name">Uploader</div>
							<div className="setting-item-description">
								Choose which uploader to use. PicList is
								supported now; PicGo/PicGo-Core are TODO.
							</div>
						</div>
						<div className="setting-item-control">
							<select
								value={value.uploaderType}
								onChange={(e) => {
									const nextType = e.target.value as any;
									set(
										{
											uploaderType: nextType,
										},
										{
											uploaderType: nextType,
										}
									);
								}}
							>
								<option value="none">None</option>
								<option value="piclist">PicList</option>
								<option value="picgo">PicGo</option>
								<option value="picgo_core">PicGo-Core</option>
							</select>
						</div>
					</div>

					<div className="setting-item">
						<div className="setting-item-info">
							<div className="setting-item-name">
								Uploader path
							</div>
							<div className="setting-item-description">
								Executable path for the selected uploader. For
								example <code>picgo</code>,{" "}
								<code>picgo-core</code>, <code>piclist</code>.
							</div>
						</div>
						<div className="setting-item-control">
							<input
								type="text"
								value={value.uploaderCommandPath}
								onChange={(e) => {
									const nextPath = e.target.value;
									set(
										{ uploaderCommandPath: nextPath },
										{ uploaderCommandPath: nextPath }
									);
								}}
								placeholder={
									value.uploaderType === "picgo_core"
										? "picgo-core"
										: value.uploaderType === "piclist"
										? "piclist"
										: "picgo"
								}
							/>
						</div>
					</div>

					<div className="setting-item">
						<div className="setting-item-info">
							<div className="setting-item-name">
								Delete local image after upload
							</div>
							<div className="setting-item-description">
								When enabled, the local image file will be
								removed after a successful upload.
							</div>
						</div>
						<div className="setting-item-control">
							<div
								className={`checkbox-container ${
									value.deleteLocalAfterUpload
										? "is-enabled"
										: ""
								}`}
								role="checkbox"
								aria-checked={value.deleteLocalAfterUpload}
								tabIndex={0}
								onClick={() => {
									const next = !value.deleteLocalAfterUpload;
									set(
										{ deleteLocalAfterUpload: next },
										{ deleteLocalAfterUpload: next }
									);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										const next =
											!value.deleteLocalAfterUpload;
										set(
											{ deleteLocalAfterUpload: next },
											{ deleteLocalAfterUpload: next }
										);
									}
								}}
							>
								<input
									type="checkbox"
									checked={value.deleteLocalAfterUpload}
									tabIndex={-1}
									readOnly
								/>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
