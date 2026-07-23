#!/usr/bin/env bash
# MULTI-TENANT SMB server (Samba, standalone) — install + operations.
# Copy-paste reference (do NOT run as a single block). Host data outside the repo.
#
# Standalone mode, 1 IP: SMB (445, raw TCP, WITHOUT SNI) cannot be routed by
# domain -> A SINGLE smbd daemon, one [<id>] share per tenant on
# ${OC_DATA_ROOT}/tenants/<id>/share, files forced to the OpenCapture service account
# ($APP_UID/$APP_GID) -> readable AND deletable by the fs-watcher. Details:
# infra-host/smb/README.md. (Same spirit as SFTP: runbooks/en/05-sftp-server.md.)
#
# Prerequisites: infra installed (01); tenants created (new-tenant.sh + deploy.sh).

# Run these commands FROM THE REPO ROOT (where you did git pull).
# NB: under sudo, `~` = /root -> do NOT use ~/opencapture_docker. $PWD is safe.
REPO="$PWD"

# uid/gid/name of the OpenCapture service account (from the root .env; default 1000).
APP_UID="$(grep -m1 '^APP_UID='  "$REPO/.env" | cut -d= -f2)";  APP_UID="${APP_UID:-1000}"
APP_GID="$(grep -m1 '^APP_GID='  "$REPO/.env" | cut -d= -f2)";  APP_GID="${APP_GID:-1000}"
APP_USER="$(grep -m1 '^APP_USER=' "$REPO/.env" | cut -d= -f2)"; APP_USER="${APP_USER:-opencapture}"

# ----------------------------------------------------------------------
# 1) Package — Samba
# ----------------------------------------------------------------------
sudo apt update && sudo apt install -y samba

# ----------------------------------------------------------------------
# 2) Service account on the HOST side (what `force user` will target)
#    What matters is the NUMBER: `force user` will designate the NAME that CARRIES
#    APP_UID/APP_GID (new-smb-account.sh derives it from the UID). So the name can
#    differ from $APP_USER. -> We stick to the NUMBER: if the UID/GID is already
#    carried by another name, we REUSE it; otherwise we create one with the .env name.
#    (Tenants' auth identity is separate, step 6.)
# ----------------------------------------------------------------------
getent group  "$APP_GID" >/dev/null || sudo groupadd -g "$APP_GID" "$APP_USER"
getent passwd "$APP_UID" >/dev/null || \
    sudo useradd -r -M -u "$APP_UID" -g "$APP_GID" -s /usr/sbin/nologin "$APP_USER"
# Real name behind the UID/GID (= what `force user` will use):
getent passwd "$APP_UID"; getent group "$APP_GID"

# ----------------------------------------------------------------------
# 3) Config = the repo's one (copy; or symlink if you prefer a live link)
# ----------------------------------------------------------------------
sudo cp "$REPO/infra-host/smb/smb.conf" /etc/samba/smb.conf
# sudo ln -sf "$REPO/infra-host/smb/smb.conf" /etc/samba/smb.conf

# Tenant sections file (empty at first; filled in by new-smb-account.sh).
# `include`-ing a missing file isn't fatal, but this avoids the warning.
sudo touch /etc/samba/oc-shares.conf
sudo mkdir -p /var/log/samba

# ----------------------------------------------------------------------
# 4) Firewall — a single port (SMB on 445; NetBIOS disabled)
# ----------------------------------------------------------------------
# sudo ufw allow 445/tcp

# ----------------------------------------------------------------------
# 5) Check the conf then start Samba (smbd only; nmbd is useless without NetBIOS)
# ----------------------------------------------------------------------
sudo testparm -s                                 # MUST pass with no error
sudo systemctl disable --now nmbd 2>/dev/null || true
sudo systemctl enable  --now smbd
sudo systemctl restart smbd
sudo systemctl status  smbd

# ----------------------------------------------------------------------
# 6) Declare a tenant's SMB access
# ----------------------------------------------------------------------
# sudo ./new-smb-account.sh <id>    # creates account + section + reload (prompts for password)
# e.g.: sudo ./new-smb-account.sh test2
#   -> no restart: `smbcontrol all reload-config` reloads the conf hot.

# ----------------------------------------------------------------------
# 7) Operations
# ----------------------------------------------------------------------
# Logs: /var/log/samba/log.<client-machine>
# Client test:   smbclient //<server>/<id> -U <id> -m SMB3
# List SMB accounts:   sudo pdbedit -L
# Remove a tenant:
#   sudo smbpasswd -x <id> ; sudo userdel <id>
#   (remove the [<id>] section from /etc/samba/oc-shares.conf, then reload)
#   sudo smbcontrol all reload-config
#
# Client domains: 1 DNS alias (A/CNAME) per domain -> the server's IP.
# The client mounts \\<domain>\<id>; the server tells tenants apart by the SHARE NAME.
