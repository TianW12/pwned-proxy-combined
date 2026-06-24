# Development Setup (WSL / Debian / Ubuntu)

This guide sets up the full dev environment: Linux (via WSL), the languages the
project needs (Python for the backend, Node.js for the frontend), and the code.

## 1. Set up WSL (Windows only)
Run these in **PowerShell**. Skip this section if you're already on Debian/Ubuntu.

```powershell
wsl --list                     # show installed Linux distros
wsl --update                   # update the WSL engine
wsl --set-default-version 2    # use WSL 2 (modern, faster)
wsl                            # enter the Ubuntu shell
```

## 2. Update the system
`apt` is Ubuntu's package manager. Refresh and upgrade before installing anything.

```bash
sudo apt update && sudo apt upgrade -y
```

## 3. Git (version control — to clone and manage the code)
```bash
sudo apt install -y git
git --version
```

## 4. Python 3.13 (backend language — the Django proxy in app/)
Ubuntu ships Python 3.10; the project needs 3.13, so add the deadsnakes PPA.

```bash
sudo apt install -y python3 python3-pip python3-venv      # base python tooling
sudo add-apt-repository ppa:deadsnakes/ppa -y             # source for newer python
sudo apt update
sudo apt install -y python3.13 python3.13-venv python3.13-dev
python3.13 --version                                      # expect: Python 3.13.x
```

## 5. Node.js 24 (frontend language — the Vite app in ui/app-vite)
Installed via nvm, the standard Node version manager.

```bash
# install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash

# load nvm into the current shell (also added to ~/.bashrc for future terminals)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 24                 # installs Node 24 + npm
node -v                        # expect: v24.x
npm -v
```

## 6. Get the code
```bash
mkdir -p ~/temp && cd ~/temp
git clone https://github.com/vicmrp/pwned-proxy-combined
cd pwned-proxy-combined
code .                         # open in VS Code (uses the WSL extension)
```

## Next steps
- Backend: see the `app/` setup (create `.env`, venv, migrate, runserver).
- Frontend: `cd ui/app-vite && npm install && npm run dev`.