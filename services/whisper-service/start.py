#!/usr/bin/env python3
"""
Cross-platform Whisper service startup script.
Works on both Windows and Linux.
"""
import os
import sys
import platform
import subprocess
from pathlib import Path

def main():
    script_dir = Path(__file__).parent.absolute()
    os.chdir(script_dir)
    
    venv_dir = script_dir / "venv"
    
    if not venv_dir.exists():
        print("❌ Virtual environment not found. Run setup script first.", file=sys.stderr)
        sys.exit(1)
    
    # Determine platform-specific paths
    is_windows = platform.system() == "Windows"
    
    if is_windows:
        python_exe = venv_dir / "Scripts" / "python.exe"
        activate_script = venv_dir / "Scripts" / "activate.bat"
    else:
        python_exe = venv_dir / "bin" / "python3"
        activate_script = venv_dir / "bin" / "activate"
    
    if not python_exe.exists():
        print(f"❌ Python executable not found in venv: {python_exe}", file=sys.stderr)
        sys.exit(1)
    
    # Set environment variables
    env = os.environ.copy()
    
    # CUDA library path (Linux only)
    if not is_windows:
        cuda_path = "/usr/local/lib/ollama/cuda_v12"
        ld_library_path = env.get("LD_LIBRARY_PATH", "")
        env["LD_LIBRARY_PATH"] = f"{cuda_path}:{ld_library_path}" if ld_library_path else cuda_path
    
    # Whisper configuration
    env["WHISPER_MODEL"] = env.get("WHISPER_MODEL", "medium")
    env["WHISPER_DEVICE"] = env.get("WHISPER_DEVICE", "cuda" if not is_windows else "cpu")
    env["WHISPER_COMPUTE_TYPE"] = env.get("WHISPER_COMPUTE_TYPE", "float16")
    env["PORT"] = env.get("PORT", "8001")
    env["HOST"] = env.get("HOST", "127.0.0.1")
    
    # Print startup info
    print("🚀 Starting Whisper Transcription Service")
    print(f"   Platform: {platform.system()}")
    print(f"   Model: {env['WHISPER_MODEL']}")
    print(f"   Device: {env['WHISPER_DEVICE']}")
    print(f"   Compute Type: {env['WHISPER_COMPUTE_TYPE']}")
    print(f"   Listening on: http://{env['HOST']}:{env['PORT']}")
    print("")
    
    # Start the server using venv Python
    server_script = script_dir / "server.py"
    
    try:
        subprocess.run([str(python_exe), str(server_script)], env=env, check=True)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down Whisper service...")
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed with exit code {e.returncode}", file=sys.stderr)
        sys.exit(e.returncode)

if __name__ == "__main__":
    main()
