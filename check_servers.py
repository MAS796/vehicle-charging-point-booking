import socket
import time

print("=" * 60)
print("🔍 CHECKING SERVER STATUS")
print("=" * 60)
print("")

time.sleep(5)

# Test Backend
print("Testing Backend (port 8000)...")
try:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(3)
    result = sock.connect_ex(('127.0.0.1', 8000))
    sock.close()
    if result == 0:
        print("✅ BACKEND: http://127.0.0.1:8000 - RUNNING")
        backend_ok = True
    else:
        print("❌ BACKEND: Not responding")
        backend_ok = False
except Exception as e:
    print(f"❌ BACKEND: Error - {e}")
    backend_ok = False

time.sleep(2)

# Test Frontend  
print("")
print("Testing Frontend (port 3000)...")
try:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(3)
    result = sock.connect_ex(('127.0.0.1', 3000))
    sock.close()
    if result == 0:
        print("✅ FRONTEND: http://localhost:3000 - RUNNING")
        frontend_ok = True
    else:
        print("❌ FRONTEND: Still starting or not responding")
        frontend_ok = False
except Exception as e:
    print(f"⏳ FRONTEND: {e}")
    frontend_ok = False

print("")
print("=" * 60)

if backend_ok and frontend_ok:
    print("✅ ALL SYSTEMS OPERATIONAL!")
    print("")
    print("👉 OPEN http://localhost:3000 IN YOUR BROWSER")
    print("")
elif backend_ok:
    print("⚠️  Backend is ready, Frontend still compiling...")
    print("")
    print("Wait 30-60 seconds then:")
    print("👉 OPEN http://localhost:3000 IN YOUR BROWSER")
else:
    print("⚠️  Servers are starting...")
    print("Please wait 30 seconds and try again")

print("=" * 60)
