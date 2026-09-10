# Multi-tenant SMB server (Samba, standalone) — install and operations

Copy-paste commands: do **not** run them as a block. Host data lives outside the repo.

Prerequisites: infra installed (see [01](01-install-general.md)) and tenants created
(`new-tenant.sh` then `deploy.sh`).

## How it works

Standalone mode on a single IP: SMB, which listens on port 445 over raw TCP and
**without SNI**, cannot be routed by domain. Hence a single `smbd` daemon, with one
`[<id>]` share per tenant on `${OC_DATA_ROOT}/tenants/<id>/share`.

Files are forced onto the OpenCapture service account (`$APP_UID`/`$APP_GID`), which
makes them readable **and** deletable by the fs-watcher. Design details in
`install/docker/host/smb/README.md`; same spirit as [SFTP](05-sftp-server.md).

## Starting point

Run these commands **from the repo root**, where the `git pull` was done. Note that
under `sudo`, `~` is `/root` — do not use `~/opencapture_docker`, `$PWD` is safe.

```bash
REPO="$PWD"
```

Take the uid, gid and name of the service account from the **global** `.env`; the
default is 1000:

```bash
APP_UID="$(grep -m1 '^APP_UID='  "$REPO/install/docker/.env" | cut -d= -f2)";  APP_UID="${APP_UID:-1000}"
APP_GID="$(grep -m1 '^APP_GID='  "$REPO/install/docker/.env" | cut -d= -f2)";  APP_GID="${APP_GID:-1000}"
APP_USER="$(grep -m1 '^APP_USER=' "$REPO/install/docker/.env" | cut -d= -f2)"; APP_USER="${APP_USER:-opencapture}"
```

## 1. Package — Samba

```bash
sudo apt update && sudo apt install -y samba
```

## 2. Service account on the host

This is what `force user` will target. What matters is the **number**: `force user` will
name whichever account **carries** `APP_UID`/`APP_GID`, which `new-smb-account.sh`
derives from the uid. That name may therefore differ from `$APP_USER`.

The logic follows the number: if the uid or gid is already carried by another name, that
one is reused; otherwise the account is created under the `.env` name. Tenant
authentication identity is a separate matter, covered in step 7.

```bash
getent group  "$APP_GID" >/dev/null || sudo groupadd -g "$APP_GID" "$APP_USER"
getent passwd "$APP_UID" >/dev/null || \
    sudo useradd -r -M -u "$APP_UID" -g "$APP_GID" -s /usr/sbin/nologin "$APP_USER"
```

Check the real name behind the uid and gid, the one `force user` will use:

```bash
getent passwd "$APP_UID"; getent group "$APP_GID"
```

## 3. Configuration

The repo's — a copy, or a symlink for a live link:

```bash
sudo cp "$REPO/install/docker/host/smb/smb.conf" /etc/samba/smb.conf
# sudo ln -sf "$REPO/install/docker/host/smb/smb.conf" /etc/samba/smb.conf
```

Create the tenant sections file, empty at first and filled by `new-smb-account.sh`. An
`include` pointing at a missing file is not fatal, but the warning is worth avoiding.

```bash
sudo touch /etc/samba/oc-shares.conf
sudo mkdir -p /var/log/samba
```

## 4. Primary group mapping ("Domain Users")

Do this **once per server**, after step 3: the command reads the local SID from
`/etc/samba/smb.conf`, and the resulting table (`group_mapping.tdb`) is global and
persistent — tenant accounts created later inherit it with nothing to replay.

`smbpasswd -a` gives every SMB account the primary group "Domain Users" (RID 513).
Without a mapping to a Unix group, `smbd` cannot build the access token:
**authentication succeeds**, but connecting to the share fails with
`NT_STATUS_NO_SUCH_USER`. The `idmap config *` block in `smb.conf` does not cover this
case — it only applies to *foreign* domains, whereas this SID belongs to the standalone
server's own local domain.

```bash
getent group smbusers >/dev/null || sudo groupadd -r smbusers
sudo net groupmap add rid=513 ntgroup="Domain Users" unixgroup=smbusers type=domain
```

Check — the output must no longer be empty:

```bash
sudo net groupmap list
# Domain Users (S-1-5-21-...-513) -> smbusers
```

Note that `smbusers` plays no part in the ownership of dropped files, which
`force user`/`force group` write as `APP_UID:APP_GID`. The group exists only to give the
token's primary group a gid. No restart is needed, and `winbind` is not involved:
`smbd` reads the table directly.

## 5. Firewall

A single port, NetBIOS staying disabled:

```bash
sudo ufw allow 445/tcp
```

## 6. Check the configuration, then start

`testparm -s` must pass without error. Only `smbd` is needed: `nmbd` is useless without
NetBIOS.

```bash
sudo testparm -s
sudo systemctl disable --now nmbd 2>/dev/null || true
sudo systemctl enable  --now smbd
sudo systemctl restart smbd
sudo systemctl status  smbd
```

## 7. Declare a tenant's SMB access

Throughout this section and the next, `<id>` is the tenant id — the one passed to
`new-tenant.sh`. It is at once the **share name** (`\\<server>\<id>`), the SMB login
name and the name of the shared directory (`$OC_DATA_ROOT/tenants/<id>/share`), so the
tenant must already exist.

The script creates the account, adds the section and reloads the configuration; the
password is prompted for. No restart: `smbcontrol all reload-config` reloads on the fly.

```bash
sudo ./install/docker/host/smb/new-smb-account.sh <id>
# e.g. sudo ./install/docker/host/smb/new-smb-account.sh test2
```

## 8. Operations

Logs in `/var/log/samba/log.<machine-client>`, one file per client machine.

Client test:

```bash
smbclient //<server>/<id> -U <id> -m SMB3
```

List the SMB accounts:

```bash
sudo pdbedit -L
```

Delete a tenant — remember to also remove the `[<id>]` section from
`/etc/samba/oc-shares.conf` before reloading:

```bash
sudo smbpasswd -x <id> ; sudo userdel <id>
sudo smbcontrol all reload-config
```

### Access from a Windows workstation

The share is not browsable (`browseable = no`) and NetBIOS is disabled: it shows up
neither under "Network" nor by typing `\\<server>` alone. Enter the full path.

From File Explorer (or Win+R): `\\<server>\<id>`, then the `<id>` credentials and its
SMB password. If Windows prefixes a domain, force the server's local account with
`.\<id>`.

Persistent network drive, from a command prompt on the workstation:

```
net use U: \\<server>\<id> /user:<id> * /persistent:yes
```

The `*` prompts for the password instead of writing it into the history. Check with
`net use`, unmount with `net use U: /delete`.

No anonymous access (`map to guest = never`) and SMB3 encryption is required — native on
Windows 10/11 and Server 2016+, nothing to enable client-side.

Files are only processed when dropped into the watched subdirectories:
`entrant\verifier\default` (or `ocr_only`, `default_mail`) and
`entrant\splitter\default`.

If it fails with "Multiple connections … using more than one user name", that is the
Windows limit of a single identity per SMB server: see the troubleshooting section in
`install/docker/host/smb/README.md`.

### Client domains

Set up one DNS alias (A or CNAME) per domain, pointing at the server's IP. The client
mounts `\\<server-domain>\<id>`; it is the **share name** that lets the server tell tenants
apart.
