#!/usr/bin/env bash
# MULTI-TENANT SFTP server (ProFTPD mod_sftp) — install + operations.
# Copy-paste reference (do NOT run it as a block). Host data outside the repo.
#
# SFTP-only mode: on a single-IP server, you can't serve a per-tenant FTPS
# cert (it would need SNI, unreliable on ProFTPD). SFTP has no domain cert
# (single SSH host key, TOFU) -> trivially multi-tenant.
# Chrooted virtual accounts on /opt/edissyum/opencapture/tenants/<id>/share, mapped to the
# OpenCapture service account ($APP_UID/$APP_GID). Detail: install/docker/host/sftp/README.md.
#
# Prerequisites: infra installed (01) ; tenants created (new-tenant.sh + deploy.sh).

# Run these commands FROM THE REPO ROOT (where you did git pull).
# NB: under sudo, `~` = /root -> do NOT use ~/opencapture_docker. $PWD is safe.
REPO="$PWD"

# ----------------------------------------------------------------------
# 1) Packages — ProFTPD + SFTP module
#    /!\ On Debian (tested: Debian 13 trixie), mod_sftp (and mod_tls) are
#    provided by proftpd-mod-crypto, NOT by proftpd-core.
# ----------------------------------------------------------------------
sudo apt update && sudo apt install -y proftpd-core proftpd-mod-crypto
# (apt already starts proftpd on Debian's default config -> restart it
#  in step 5 once OUR config is in place.)

# Make sure mod_sftp is loaded (uncomment the line if needed):
grep -q '^LoadModule mod_sftp.c' /etc/proftpd/modules.conf \
  || sudo sed -i 's/^# *LoadModule mod_sftp.c/LoadModule mod_sftp.c/' /etc/proftpd/modules.conf
# Check: the DSO exists AND the line is active.
ls /usr/lib/proftpd/mod_sftp.so && grep '^LoadModule mod_sftp.c' /etc/proftpd/modules.conf

# ----------------------------------------------------------------------
# 2) /etc/proftpd tree
# ----------------------------------------------------------------------
sudo mkdir -p /etc/proftpd/sftp/authorized_keys
sudo mkdir -p /var/log/proftpd

# Config = the repo's one (copy ; or symlink if you prefer a live link)
sudo cp "$REPO/install/docker/host/sftp/proftpd.conf" /etc/proftpd/proftpd.conf
# sudo ln -sf "$REPO/install/docker/host/sftp/proftpd.conf" /etc/proftpd/proftpd.conf

# Virtual accounts file (empty at first ; filled by new-sftp-account.sh)
sudo touch /etc/proftpd/ftpd.passwd && sudo chmod 600 /etc/proftpd/ftpd.passwd

# ----------------------------------------------------------------------
# 3) SSH host keys for the SFTP service (shared by all tenants)
# ----------------------------------------------------------------------
sudo ssh-keygen -t rsa     -b 4096 -f /etc/proftpd/sftp/ssh_host_rsa_key     -N '' -q
sudo ssh-keygen -t ed25519        -f /etc/proftpd/sftp/ssh_host_ed25519_key -N '' -q
sudo chmod 600 /etc/proftpd/sftp/ssh_host_*_key

# ----------------------------------------------------------------------
# 4) Firewall — a single port (SFTP)
# ----------------------------------------------------------------------
# sudo ufw allow 2222/tcp
# (To use the standard port 22 instead: change Port in
#  install/docker/host/sftp/proftpd.conf AND restrict the admin sshd to another IP/port — sensitive.)

# ----------------------------------------------------------------------
# 5) Check the conf then start ProFTPD
# ----------------------------------------------------------------------
sudo proftpd -t                                  # MUST pass (otherwise: see step 1, mod_sftp)
sudo systemctl enable proftpd                    # at boot
sudo systemctl restart proftpd                   # reloads OUR config (apt had started it on the default)
sudo systemctl status proftpd
# Without systemd: sudo proftpd  /  reload: sudo pkill -HUP proftpd

# ----------------------------------------------------------------------
# 6) Declare a tenant's SFTP access
# ----------------------------------------------------------------------
# sudo ./install/docker/host/sftp/new-sftp-account.sh <id>     # creates the chrooted virtual account (prompts for the password)
# e.g.: sudo ./install/docker/host/sftp/new-sftp-account.sh test2
#   -> no reload needed: ftpd.passwd is re-read on every connection.

# ----------------------------------------------------------------------
# 7) Operations
# ----------------------------------------------------------------------
# Logs: /var/log/proftpd/{proftpd.log,sftp.log}
# Client test (from a workstation): sftp -P 2222 <id>@<server>
# Remove a tenant:
#   sudo ftpasswd --passwd --file=/etc/proftpd/ftpd.passwd --delete-user --name=<id>
#   (no reload needed)
# Public key (instead of a password): drop the client's key into
#   /etc/proftpd/sftp/authorized_keys/<id>
