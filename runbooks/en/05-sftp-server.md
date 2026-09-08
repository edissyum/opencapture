# Multi-tenant SFTP server (ProFTPD mod_sftp) — install and operations

Copy-paste commands: do **not** run them as a block. Host data lives outside the repo.

Prerequisites: infra installed (see [01](01-install-general.md)) and tenants created
(`new-tenant.sh` then `deploy.sh`).

## Why SFTP and not FTPS

On a single-IP server it is impossible to serve one FTPS certificate per tenant: that
would need SNI, which is unreliable on ProFTPD. SFTP, on the other hand, uses no domain
certificate — a single SSH host key, TOFU-style — which makes multi-tenancy trivial.

Accounts are virtual and chrooted to `$OC_DATA_ROOT/tenants/<id>/share`, mapped to the
OpenCapture service account (`$APP_UID`/`$APP_GID`). Design details in
`install/docker/host/sftp/README.md`.

## Starting point

Run these commands **from the repo root**, where the `git pull` was done. Note that
under `sudo`, `~` is `/root` — do not use `~/opencapture_docker`, `$PWD` is safe.

```bash
REPO="$PWD"
```

## 1. Packages — ProFTPD and the SFTP module

**Careful**: on Debian (tested on Debian 13 trixie), `mod_sftp` and `mod_tls` ship in
`proftpd-mod-crypto`, **not** in `proftpd-core`.

```bash
sudo apt update && sudo apt install -y proftpd-core proftpd-mod-crypto
```

APT already starts ProFTPD on the default Debian configuration; it gets restarted at
step 5, once the repo configuration is in place.

Make sure `mod_sftp` is loaded, uncommenting the line if needed:

```bash
grep -q '^LoadModule mod_sftp.c' /etc/proftpd/modules.conf \
  || sudo sed -i 's/^# *LoadModule mod_sftp.c/LoadModule mod_sftp.c/' /etc/proftpd/modules.conf
```

Check that the DSO exists **and** that the line is active:

```bash
ls /usr/lib/proftpd/mod_sftp.so && grep '^LoadModule mod_sftp.c' /etc/proftpd/modules.conf
```

## 2. The /etc/proftpd tree

```bash
sudo mkdir -p /etc/proftpd/sftp/authorized_keys
sudo mkdir -p /var/log/proftpd
```

The configuration is the repo's — a copy, or a symlink for a live link:

```bash
sudo cp "$REPO/install/docker/host/sftp/proftpd.conf" /etc/proftpd/proftpd.conf
# sudo ln -sf "$REPO/install/docker/host/sftp/proftpd.conf" /etc/proftpd/proftpd.conf
```

Create the virtual accounts file, empty at first and filled by `new-sftp-account.sh`:

```bash
sudo touch /etc/proftpd/ftpd.passwd && sudo chmod 600 /etc/proftpd/ftpd.passwd
```

## 3. SSH host keys

Shared by all tenants.

```bash
sudo ssh-keygen -t rsa     -b 4096 -f /etc/proftpd/sftp/ssh_host_rsa_key     -N '' -q
sudo ssh-keygen -t ed25519        -f /etc/proftpd/sftp/ssh_host_ed25519_key -N '' -q
sudo chmod 600 /etc/proftpd/sftp/ssh_host_*_key
```

## 4. Firewall

A single port to open:

```bash
sudo ufw allow 2222/tcp
```

To use the standard port 22 instead, change `Port` in
`install/docker/host/sftp/proftpd.conf` **and** restrict the admin sshd to another IP or
port — a sensitive operation.

## 5. Check the configuration, then start

`proftpd -t` must pass; if it fails, go back to step 1 about `mod_sftp`. The `restart`
is needed to load the repo configuration, since APT started the service on the default
one.

```bash
sudo proftpd -t
sudo systemctl enable proftpd
sudo systemctl restart proftpd
sudo systemctl status proftpd
```

Without systemd: `sudo proftpd` to start, `sudo pkill -HUP proftpd` to reload.

## 6. Declare a tenant's SFTP access

The script creates the chrooted virtual account and asks for the password. No reload is
needed: `ftpd.passwd` is re-read on every connection.

```bash
sudo ./install/docker/host/sftp/new-sftp-account.sh <id>
# e.g. sudo ./install/docker/host/sftp/new-sftp-account.sh test2
```

## 7. Operations

Logs in `/var/log/proftpd/proftpd.log` and `/var/log/proftpd/sftp.log`.

Client test from a workstation:

```bash
sftp -P 2222 <id>@<serveur>
```

Delete a tenant — no reload needed:

```bash
sudo ftpasswd --passwd --file=/etc/proftpd/ftpd.passwd --delete-user --name=<id>
```

For public-key authentication instead of a password, drop the client's key into
`/etc/proftpd/sftp/authorized_keys/<id>`.
