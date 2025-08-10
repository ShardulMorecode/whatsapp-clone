import os
import shutil
import subprocess

FRONTEND_DIR = "frontend"
FRONTEND_OUT_DIR = os.path.join("backend", "frontend_out")

# Step 1: Install npm packages
subprocess.run(["npm", "install"], cwd=FRONTEND_DIR, check=True)

# Step 2: Build frontend (Next.js, React, etc.)
subprocess.run(["npm", "run", "build"], cwd=FRONTEND_DIR, check=True)

# Step 3: Export static files (if using Next.js SSG)
subprocess.run(["npm", "run", "export"], cwd=FRONTEND_DIR, check=True)

# Step 4: Copy build to backend
if os.path.exists(FRONTEND_OUT_DIR):
    shutil.rmtree(FRONTEND_OUT_DIR)

shutil.copytree(os.path.join(FRONTEND_DIR, "out"), FRONTEND_OUT_DIR)

print("✅ Frontend build copied to backend/frontend_out/")
