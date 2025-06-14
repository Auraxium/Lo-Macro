#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};

static mut PORT: i32 = -1; //dev
                           // static mut PORT: i32 = 0; //prod
static mut CHILD: Option<Child> = None;

unsafe fn start_node_server() {
    if PORT == -1 {
        return;
    }
    let mut child = Command::new("node")
        .arg("server.js")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("Failed to spawn Node server");

    // Capture stdout in background thread
    if let Some(stdout) = child.stdout.take() {
        std::thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines().flatten() {
                println!("[node stdout] {}", line);
                if line.contains("server started on") {
                    PORT = line
                        .split_whitespace()
                        .last()
                        .unwrap()
                        .parse::<i32>()
                        .unwrap();
                    break;
                }
            }
        });
    }

    // Capture stderr in background thread
    if let Some(stderr) = child.stderr.take() {
        std::thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines().flatten() {
                eprintln!("[node stderr] {}", line);
            }
        });
    }

    CHILD = Some(child); // Store the child handle for later kill
}

unsafe fn kill_node_server() {
    if let Some(mut child) = CHILD.take() {
        let _ = child.kill();
        println!("child killed");
    }
}

#[tauri::command]
fn get_port() -> i32 {
    unsafe { PORT }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_port])
        .build(tauri::generate_context!())
        .expect("error while building")
        .run(|_app_handle, event| {
            if let tauri::RunEvent::ExitRequested { .. } = event {
                unsafe {
                    kill_node_server(); // Graceful exit
                }
            }
        });
}

fn main() {
    unsafe {
        start_node_server();
        run();
    }
}
