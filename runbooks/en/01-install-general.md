# General installation — shared infra (Traefik, network, backend image)

Copy-paste commands: do **not** run them as a block.

## System prerequisites — Docker Engine + Compose v2 (Debian)

From a root account, create the `edissyum` account:

```bash
useradd -m -s /bin/bash -G sudo edissyum
passwd edissyum
```

Log in with that account for everything that follows.

### OC_DATA_ROOT — the authoritative variable

The **single** root of all data kept outside the repo. It is the only value to decide
per server; everything derives from it: the global `.env` below, the directory tree,
Traefik, each tenant's `.env` via `new-tenant.sh`, the containers' volumes. Adapt it to
the server before continuing (for instance `/opt/edissyum/opencapture` or
`/var/edissyum/opencapture`).

Note that `docker compose` prefers this **exported** variable over the one in the
`.env`, hence the `source` below that keeps it exported in the session.

```bash
echo 'export OC_DATA_ROOT=/opt/edissyum/opencapture' >> ~/.bashrc
source ~/.bashrc
```

Also set the default editor (`nano`, `vi`…):

```bash
echo 'export EDITOR=nano' >> ~/.bashrc
source ~/.bashrc
```

### Installing Docker

Purge any old packages, then install the dependencies (`git` included for the clone
further below):

```bash
sudo apt remove docker.io docker-compose docker-doc podman-docker containerd runc
sudo apt update && sudo apt install -y ca-certificates curl gnupg lsb-release git curl gpg sshpass python3
```

`moreutils` and `jq` are what give you times in the local timezone: Docker normalizes
all timestamps to UTC, so `docker logs -t` stays stuck in UTC (see the logs section of
the guide).

```bash
sudo apt install moreutils jq
```

Official Docker GPG key:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

Official Docker repository:

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Docker Engine + CLI + Compose v2, enable on boot, then verify:

```bash
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker

systemctl status docker
sudo docker run hello-world
```

To use Docker without `sudo` — log out and back in before testing with `docker ps`:

```bash
sudo usermod -aG docker $USER
```

## OpenCapture — shared infra

Fetch the sources (create a GitHub token to use as the password):

```bash
git clone https://github.com/edissyum/opencapture_docker/
cd opencapture_docker
```

Create the data directory tree outside the repo (per tenant and shared). This data is
owned by the current user — the one behind `APP_UID` below — so that manual drops and
imports can write to it:

```bash
sudo mkdir -p "$OC_DATA_ROOT/tenants"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/ai-models"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/traefik/dynamic"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/traefik/certs"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/traefik/letsencrypt"
sudo chown -R "$(id -u):$(id -g)" "$OC_DATA_ROOT"
```

Shared Docker network, connecting Traefik to the tenant frontends:

```bash
docker network create frontend
```

### Shared backend image

Built only once for all tenants.

**Important**: `APP_UID`/`APP_GID` from the **global** `.env` are the uid baked into the
image (`/app` is the HOME of the service account). All tenants must run under this same
uid, otherwise `/app` is not writable for them.

Carry over `OC_DATA_ROOT` and align `APP_UID`/`APP_GID` with the current user, as
**numeric** values via `id -u` / `id -g` — definitely not `$USER`, which is a name and
not a uid. Edit the rest of the `.env` (ports…) as needed.

```bash
cp install/docker/.env.example install/docker/.env
sed -i "s#^OC_DATA_ROOT=.*#OC_DATA_ROOT=$OC_DATA_ROOT#" install/docker/.env
sed -i -e "s/^APP_UID=.*/APP_UID=$(id -u)/" -e "s/^APP_GID=.*/APP_GID=$(id -g)/" install/docker/.env
docker compose --project-directory install/docker/shared -f install/docker/shared/docker-compose.yml build backend
```

### Shared Traefik

A single daemon, reading `OC_DATA_ROOT` and `LETSENCRYPT_EMAIL` from the `.env` (via the
`install/docker/shared/.env` → `../.env` symlink). Do not prefix the command inline: an
empty `$OC_DATA_ROOT` would override the `.env` value and make compose fail. For Let's
Encrypt, set `LETSENCRYPT_EMAIL` in the `.env`; if another service already owns 80/443,
adjust `TRAEFIK_HTTP_PORT` / `TRAEFIK_HTTPS_PORT`.

```bash
docker compose -f install/docker/shared/traefik/docker-compose.traefik-server.yml up -d
```

Verify the container and the local dashboard on `127.0.0.1:8081`:

```bash
docker ps --filter name=opencapture_traefik
# curl -s http://127.0.0.1:8081/api/rawdata | head
```

Logs and restart:

```bash
docker logs -f opencapture_traefik
docker compose -f install/docker/shared/traefik/docker-compose.traefik-server.yml restart
```
