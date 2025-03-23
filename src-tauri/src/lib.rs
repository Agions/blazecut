mod interfaces;
use interfaces::video::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_log::Builder::default()
      .level(log::LevelFilter::Info)
      .build())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_store::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
      get_video_metadata,
      extract_keyframes,
      generate_thumbnail,
      cleanup_temp_files
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
