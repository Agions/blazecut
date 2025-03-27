// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use serde::{Deserialize, Serialize};
use tauri::command;
use std::path::{Path, PathBuf};
use std::fs;
use std::error::Error;

#[derive(Serialize, Deserialize, Debug)]
struct VideoMetadata {
    duration: f64,
    width: u32,
    height: u32,
    fps: f64,
    codec: String,
    bitrate: u32,
}

/// 分析视频文件获取元数据
#[command]
fn analyze_video(path: String) -> Result<VideoMetadata, String> {
    println!("分析视频: {}", path);
    
    // 确保FFmpeg已安装
    if !is_ffmpeg_installed() {
        return Err("未安装FFmpeg，请先安装FFmpeg后再试".into());
    }
    
    // 执行FFmpeg命令获取视频信息
    let output = Command::new("ffprobe")
        .args(&[
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            &path
        ])
        .output()
        .map_err(|e| format!("运行ffprobe失败: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("ffprobe命令执行失败: {}", String::from_utf8_lossy(&output.stderr)));
    }
    
    // 解析FFmpeg输出的JSON
    let json_output = String::from_utf8_lossy(&output.stdout);
    let json_value: serde_json::Value = serde_json::from_str(&json_output)
        .map_err(|e| format!("解析JSON失败: {}", e))?;
    
    // 提取视频元数据
    let streams = json_value["streams"].as_array().ok_or("无法获取视频流信息")?;
    let video_stream = streams.iter()
        .find(|s| s["codec_type"].as_str().unwrap_or("") == "video")
        .ok_or("未找到视频流")?;
    
    let width = video_stream["width"].as_u64().unwrap_or(0) as u32;
    let height = video_stream["height"].as_u64().unwrap_or(0) as u32;
    
    // 获取帧率
    let fps_str = video_stream["r_frame_rate"].as_str().unwrap_or("0/1");
    let fps = parse_fps(fps_str);
    
    // 获取编解码器
    let codec = video_stream["codec_name"].as_str().unwrap_or("unknown").to_string();
    
    // 获取时长和比特率
    let format = &json_value["format"];
    let duration = format["duration"].as_str().unwrap_or("0")
        .parse::<f64>().unwrap_or(0.0);
    
    let bitrate = format["bit_rate"].as_str().unwrap_or("0")
        .parse::<u32>().unwrap_or(0);
    
    Ok(VideoMetadata {
        duration,
        width,
        height,
        fps,
        codec,
        bitrate,
    })
}

/// 从视频中提取关键帧
#[command]
fn extract_key_frames(path: String, count: u32) -> Result<Vec<String>, String> {
    println!("提取关键帧: {}, 数量: {}", path, count);
    
    // 确保FFmpeg已安装
    if !is_ffmpeg_installed() {
        return Err("未安装FFmpeg，请先安装FFmpeg后再试".into());
    }
    
    // 获取视频时长
    let metadata = analyze_video(path.clone())?;
    let duration = metadata.duration;
    
    // 创建临时目录存放关键帧
    let temp_dir = std::env::temp_dir().join("blazecut_keyframes");
    fs::create_dir_all(&temp_dir).map_err(|e| format!("创建临时目录失败: {}", e))?;
    
    // 计算均匀分布的帧位置
    let mut frame_positions = Vec::new();
    let segment = duration / (count as f64 + 1.0);
    
    for i in 1..=count {
        let position = segment * (i as f64);
        frame_positions.push(position);
    }
    
    let mut frame_paths = Vec::new();
    
    // 提取每个位置的帧
    for (i, &position) in frame_positions.iter().enumerate() {
        let output_path = temp_dir.join(format!("frame_{}.jpg", i+1));
        let output_str = output_path.to_str().ok_or("路径转换失败")?;
        
        // 使用FFmpeg提取帧
        let status = Command::new("ffmpeg")
            .args(&[
                "-ss", &format!("{}", position),
                "-i", &path,
                "-vframes", "1",
                "-q:v", "2",
                "-f", "image2",
                output_str
            ])
            .status()
            .map_err(|e| format!("运行ffmpeg失败: {}", e))?;
        
        if !status.success() {
            return Err("提取帧失败".into());
        }
        
        frame_paths.push(output_str.to_string());
    }
    
    Ok(frame_paths)
}

/// 生成视频缩略图
#[command]
fn generate_thumbnail(path: String) -> Result<String, String> {
    println!("生成缩略图: {}", path);
    
    // 确保FFmpeg已安装
    if !is_ffmpeg_installed() {
        return Err("未安装FFmpeg，请先安装FFmpeg后再试".into());
    }
    
    // 创建临时目录存放缩略图
    let temp_dir = std::env::temp_dir().join("blazecut_thumbnails");
    fs::create_dir_all(&temp_dir).map_err(|e| format!("创建临时目录失败: {}", e))?;
    
    // 生成随机文件名
    let thumbnail_path = temp_dir.join(format!("thumb_{}.jpg", random_id()));
    let thumbnail_str = thumbnail_path.to_str().ok_or("路径转换失败")?;
    
    // 使用FFmpeg获取视频的15%位置的一帧作为缩略图
    let status = Command::new("ffmpeg")
        .args(&[
            "-ss", "15%",
            "-i", &path,
            "-vframes", "1",
            "-vf", "scale=320:-1",
            "-q:v", "2",
            "-f", "image2",
            thumbnail_str
        ])
        .status()
        .map_err(|e| format!("运行ffmpeg失败: {}", e))?;
    
    if !status.success() {
        return Err("生成缩略图失败".into());
    }
    
    Ok(thumbnail_str.to_string())
}

// 工具函数: 检查FFmpeg是否安装
fn is_ffmpeg_installed() -> bool {
    let ffmpeg = Command::new("ffmpeg")
        .arg("-version")
        .output();
    
    let ffprobe = Command::new("ffprobe")
        .arg("-version")
        .output();
    
    ffmpeg.is_ok() && ffprobe.is_ok()
}

// 工具函数: 解析FFmpeg帧率字符串 (如 "24000/1001")
fn parse_fps(fps_str: &str) -> f64 {
    let parts: Vec<&str> = fps_str.split('/').collect();
    if parts.len() == 2 {
        let numerator = parts[0].parse::<f64>().unwrap_or(0.0);
        let denominator = parts[1].parse::<f64>().unwrap_or(1.0);
        if denominator > 0.0 {
            return numerator / denominator;
        }
    }
    return 0.0;
}

// 工具函数: 生成随机ID
fn random_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();
    
    format!("{}", now)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            analyze_video,
            extract_key_frames,
            generate_thumbnail
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
