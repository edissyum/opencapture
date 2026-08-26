#!/usr/bin/env bash
# checkos.sh — Validateur de ressources AVANT `docker compose up`.
#
# Autonome (aucun couplage a deploy.sh). A lancer SUR L'HOTE cible. Il :
#   1. lit les valeurs des ancres x-res-* / x-cpuset-* de install/docker/shared/docker-compose.yml,
#   2. lit les ressources reelles de l'OS (RAM, swap, coeurs, version cgroup),
#   3. dit si ces valeurs sont TENABLES sur cet OS (PASS / WARN / FAIL),
#   4. preconise un NOMBRE MAX de tenants.
#
# Modele de cout : un tenant = 8 services longue-duree, un par ancre x-res-*
# (le 9e, `init`, est one-shot -> pic transitoire de +backend au 1er boot, non
# compte en regime permanent). La contrainte dimensionnante est la somme des
# mem_limit (plafond RAM DUR, OOM cgroup). memswap_limit>mem_limit n'a d'effet
# que si l'hote a du swap.
#
# Usage :
#   ./install/docker/host/checkos.sh [N]      # N optionnel = nombre de tenants a tester
#   CHECKOS_RESERVE_MIB=2048 ./install/docker/host/checkos.sh   # ajuster la reserve systeme
#
# Sortie : exit 0 si tout est vert, exit 1 si au moins un FAIL.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" \
    && until { [ -d backend ] && [ -d frontend ]; } || [ "$PWD" = / ]; do cd ..; done; pwd)"
[ -d "$REPO_ROOT/backend" ] || { echo "repo root not found from $0" >&2; exit 2; }
DOCKER_ROOT="$REPO_ROOT/install/docker"
COMPOSE="$DOCKER_ROOT/shared/docker-compose.yml"

# Reserve RAM pour l'OS + demon Docker + Traefik (tunable). Deplace directement
# le max de tenants -> expose en variable d'environnement.
RESERVE_MIB="${CHECKOS_RESERVE_MIB:-1536}"

# 8 services longue-duree par tenant, dans l'ordre d'affichage. La cle est le
# nom d'ancre (x-res-<cle>), pas forcement le nom de service.
PROFILES=(postgres rabbitmq backend verifier splitter mail fswatcher frontend)

# --- helpers d'affichage ---------------------------------------------------
if [ -t 1 ]; then
    C_OK=$'\033[32m'; C_WARN=$'\033[33m'; C_FAIL=$'\033[31m'; C_DIM=$'\033[2m'; C_OFF=$'\033[0m'
else
    C_OK=; C_WARN=; C_FAIL=; C_DIM=; C_OFF=
fi
WARN_CNT=0; FAIL_CNT=0
pass() { printf "  ${C_OK}[ OK ]${C_OFF} %s\n" "$*"; }
warn() { printf "  ${C_WARN}[WARN]${C_OFF} %s\n" "$*"; WARN_CNT=$((WARN_CNT + 1)); }
fail() { printf "  ${C_FAIL}[FAIL]${C_OFF} %s\n" "$*"; FAIL_CNT=$((FAIL_CNT + 1)); }
die()  { printf "checkos: %s\n" "$*" >&2; exit 2; }

# Filet de securite : convertit une mort silencieuse (set -e) en diagnostic.
trap 'ec=$?; printf "checkos: arret inattendu ligne %s (code %s). Diagnostic : bash -x %s\n" "$LINENO" "$ec" "$0" >&2' ERR

# --- pre-requis ------------------------------------------------------------
[ -f "$COMPOSE" ] || die "introuvable : $COMPOSE"

# Argument optionnel : nombre de tenants a tester.
TARGET=""
if [ "${1:-}" != "" ]; then
    case "$1" in
        -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
        *[!0-9]*)  die "argument invalide : '$1' (attendu : un entier = nb de tenants)" ;;
        *)         TARGET="$1" ;;
    esac
fi

# --- parsing des ancres ----------------------------------------------------
# Ligne d'une ancre : x-res-<nom>: &res-<nom> { mem_limit: 512m, ... }
# -m1 (pas de pipe -> pas de SIGPIPE) + || true (grep sans match = exit 1, ne doit
# PAS tuer le script via set -e : le die ci-dessous doit pouvoir s'afficher).
anchor_line() { grep -m1 -E "^x-res-$1:" "$COMPOSE" || true; }
# field <ligne> <cle> -> valeur brute (ex: 512m, 2g, 0, 1024)
field() { printf '%s\n' "$1" | sed -n "s/.*$2:[[:space:]]*\"\\?\\([0-9A-Za-z.-]\\+\\)\"\\?.*/\\1/p"; }

# to_mib <val> : convertit 512m|2g|1536|256k en MiB (base 1024, comme Docker).
to_mib() {
    local v="$1" u="${1: -1}" n
    case "$u" in
        [0-9]) echo $(( (v + 1048575) / 1048576 )) ;;         # octets -> MiB (ceil)
        [kK])  n="${v%?}"; echo $(( (n + 1023) / 1024 )) ;;
        [mM])  echo "${v%?}" ;;
        [gG])  n="${v%?}"; echo $(( n * 1024 )) ;;
        *)     echo 0 ;;
    esac
}
gib() { awk -v m="$1" 'BEGIN{printf "%.1f", m/1024}'; }

sum_mem=0; sum_memswap=0; swap_delta=0; sum_shares=0
verifier_mem=0; splitter_mem=0; has_swappy=0

printf "\n%-11s %9s %9s %9s %9s\n" "profil" "mem" "mem+swap" "swappy" "cpu_sh"
printf "%s\n" "${C_DIM}------------------------------------------------------------${C_OFF}"
for p in "${PROFILES[@]}"; do
    line="$(anchor_line "$p")"
    [ -n "$line" ] || die "ancre x-res-$p absente de $COMPOSE — fichier a jour ? (git pull, ou verifier le bloc x-res-* lignes ~81-96)"
    mem_mib=$(to_mib "$(field "$line" mem_limit)")
    swp_mib=$(to_mib "$(field "$line" memswap_limit)")
    swy=$(field "$line" mem_swappiness); swy="${swy:-0}"
    shr=$(field "$line" cpu_shares);     shr="${shr:-0}"

    sum_mem=$((sum_mem + mem_mib))
    sum_memswap=$((sum_memswap + swp_mib))
    swap_delta=$((swap_delta + swp_mib - mem_mib))
    sum_shares=$((sum_shares + shr))
    [ "$p" = verifier ] && verifier_mem=$mem_mib
    [ "$p" = splitter ] && splitter_mem=$mem_mib
    if [ "$swp_mib" -gt "$mem_mib" ] && [ "$swy" -gt 0 ]; then has_swappy=1; fi

    printf "%-11s %6s Mi %6s Mi %9s %9s\n" "$p" "$mem_mib" "$swp_mib" "$swy" "$shr"
done
printf "%s\n" "${C_DIM}------------------------------------------------------------${C_OFF}"
printf "%-11s %6s Mi %6s Mi %9s %9s\n" "= /tenant" "$sum_mem" "$sum_memswap" "-" "$sum_shares"
printf "  ${C_DIM}mem=%s GiB dur · mem+swap=%s GiB · swap possible=%s GiB${C_OFF}\n" \
    "$(gib "$sum_mem")" "$(gib "$sum_memswap")" "$(gib "$swap_delta")"

# --- cpuset ----------------------------------------------------------------
cpuset_line="$(grep -m1 -E "^x-cpuset-" "$COMPOSE" || true)"
cpuset_raw="$(printf '%s' "$cpuset_line" | sed -n 's/.*cpuset:[[:space:]]*"\?\([0-9,-]\+\)"\?.*/\1/p')"
[ -n "$cpuset_raw" ] || die "ancre x-cpuset-* introuvable dans $COMPOSE"
cpuset_max=-1; cpuset_count=0
IFS=',' read -ra _parts <<< "$cpuset_raw"
for part in "${_parts[@]}"; do
    if [[ "$part" == *-* ]]; then a="${part%-*}"; b="${part#*-}"; else a="$part"; b="$part"; fi
    for ((i = a; i <= b; i++)); do
        cpuset_count=$((cpuset_count + 1))
        if [ "$i" -gt "$cpuset_max" ]; then cpuset_max=$i; fi
    done
done

# --- faits de l'OS ---------------------------------------------------------
meminfo() { awk -v k="$1:" '$1==k{print $2}' /proc/meminfo; }
mem_total_mib=$(( $(meminfo MemTotal) / 1024 ))
avail_kib="$(meminfo MemAvailable)"; [ -n "$avail_kib" ] || avail_kib="$(meminfo MemFree)"
mem_avail_mib=$(( avail_kib / 1024 ))
swap_total_mib=$(( $(meminfo SwapTotal) / 1024 ))
ncpu="$(nproc)"
cgroup_fs="$(stat -fc %T /sys/fs/cgroup 2>/dev/null || echo '?')"
case "$cgroup_fs" in cgroup2fs) cgroup_ver="v2" ;; tmpfs|cgroupfs) cgroup_ver="v1" ;; *) cgroup_ver="?" ;; esac

usable_mib=$(( mem_total_mib - RESERVE_MIB ))

printf "\n%s OS %s\n" "${C_DIM}===${C_OFF}" "${C_DIM}=========================================================${C_OFF}"
printf "  RAM totale   : %s MiB (%s GiB)   dispo maintenant : %s MiB\n" \
    "$mem_total_mib" "$(gib "$mem_total_mib")" "$mem_avail_mib"
printf "  Swap         : %s MiB\n" "$swap_total_mib"
printf "  Coeurs (nproc): %s\n" "$ncpu"
printf "  cgroup       : %s (%s)\n" "$cgroup_ver" "$cgroup_fs"
printf "  Reserve OS   : %s MiB  ->  utilisable tenants : %s MiB\n" "$RESERVE_MIB" "$usable_mib"

# --- max de tenants --------------------------------------------------------
if [ "$sum_mem" -gt 0 ] && [ "$usable_mib" -gt 0 ]; then
    max_tenants=$(( usable_mib / sum_mem ))
else
    max_tenants=0
fi
# Chiffre indicatif "optimiste" : workers OCR bursty (verifier+splitter) comptes
# a 50 % de leur plafond. NE sert PAS de verdict, juste d'indication.
discount=$(( (verifier_mem + splitter_mem) / 2 ))
opt_pt=$(( sum_mem - discount )); [ "$opt_pt" -gt 0 ] || opt_pt=$sum_mem
opt_max=$(( usable_mib / opt_pt ))

# --- verdicts --------------------------------------------------------------
printf "\n%s Verdicts %s\n" "${C_DIM}===${C_OFF}" "${C_DIM}===================================================${C_OFF}"

# 1) cpuset valide pour l'OS
need_cpu=$(( cpuset_max + 1 ))
if [ "$ncpu" -ge "$need_cpu" ]; then
    pass "cpuset \"$cpuset_raw\" : l'hote a $ncpu coeurs (>= $need_cpu requis)."
else
    fail "cpuset \"$cpuset_raw\" reference le coeur $cpuset_max mais l'hote n'a que $ncpu coeurs -> Docker refusera. Corriger l'ancre en \"1-$(( ncpu - 1 ))\"."
fi

# 2) un tenant tient-il seul ?
if [ "$sum_mem" -le "$usable_mib" ]; then
    pass "un tenant ($sum_mem MiB dur) tient dans les $usable_mib MiB utilisables."
else
    fail "un seul tenant ($sum_mem MiB dur) DEPASSE les $usable_mib MiB utilisables : reduire verifier/splitter/backend, ou baisser la reserve."
fi

# 3) coherence swap
if [ "$has_swappy" -eq 1 ]; then
    if [ "$swap_total_mib" -eq 0 ]; then
        warn "hote SANS swap mais verifier/splitter declarent memswap_limit>mem_limit : c'est un no-op, ils sont plafonnes DUR a mem_limit (${verifier_mem}/${splitter_mem} MiB) -> l'OCR peut OOM."
    elif [ "$max_tenants" -gt 0 ] && [ "$swap_total_mib" -lt $(( swap_delta * max_tenants )) ]; then
        warn "swap ($swap_total_mib MiB) < besoin pic si $max_tenants tenants swappent ($(( swap_delta * max_tenants )) MiB) : debordement possible sous charge."
    else
        pass "swap present ($swap_total_mib MiB), coherent avec les profils swappy."
    fi
else
    pass "aucun profil swappy : swap non requis."
fi

# 4) cgroup v2 : mem_swappiness par conteneur ignore
if [ "$cgroup_ver" = v2 ] && [ "$has_swappy" -eq 1 ]; then
    warn "cgroup v2 : Docker IGNORE mem_swappiness par conteneur (les 60 de verifier/splitter n'ont pas d'effet)."
fi

# 5) contention CPU (info, pas un plafond)
if [ "$max_tenants" -ge 1 ]; then
    ctn=$(( 8 * max_tenants ))
    printf "  ${C_DIM}[info]${C_OFF} a %s tenants : ~%s conteneurs sur %s coeurs (cpuset) -> arbitrage par cpu_shares, load eleve possible en pic.\n" \
        "$max_tenants" "$ctn" "$cpuset_count"
fi

# --- stubs presents (reutilise le glob de deploy.sh discover_all) ----------
stub_count=0
if [ -d "$DOCKER_ROOT/stub-tenants" ]; then
    for d in "$DOCKER_ROOT"/stub-tenants/*/; do
        [ -e "$d" ] || continue
        n="$(basename "$d")"
        case "$n" in _*|.*) continue ;; esac
        [ -f "${d}docker-compose.yml" ] && stub_count=$((stub_count + 1))
    done
fi

# --- conclusion ------------------------------------------------------------
printf "\n%s Conclusion %s\n" "${C_DIM}===${C_OFF}" "${C_DIM}=================================================${C_OFF}"
printf "  ${C_OK}Max tenants recommande : %s${C_OFF}  (contrainte : RAM ; ~%s GiB/tenant)\n" \
    "$max_tenants" "$(gib "$sum_mem")"
printf "  ${C_DIM}indicatif optimiste (workers OCR a 50%%) : %s tenants${C_OFF}\n" "$opt_max"
[ "$stub_count" -gt 0 ] && printf "  stubs actuellement definis : %s\n" "$stub_count"

if [ -n "$TARGET" ]; then
    need=$(( sum_mem * TARGET ))
    if [ "$TARGET" -le "$max_tenants" ]; then
        pass "cible demandee : $TARGET tenants -> OK ($need MiB <= $usable_mib MiB)."
    else
        fail "cible demandee : $TARGET tenants -> $need MiB requis > $usable_mib MiB utilisables (max = $max_tenants)."
    fi
fi
if [ "$stub_count" -gt "$max_tenants" ]; then
    warn "$stub_count stubs definis pour un max de $max_tenants : ne pas tous les demarrer en meme temps."
fi

printf "\n"
if [ "$FAIL_CNT" -gt 0 ]; then
    printf "${C_FAIL}=> %s FAIL, %s WARN : configuration NON tenable en l'etat.${C_OFF}\n" "$FAIL_CNT" "$WARN_CNT"
    exit 1
elif [ "$WARN_CNT" -gt 0 ]; then
    printf "${C_WARN}=> 0 FAIL, %s WARN : tenable, avec reserves ci-dessus.${C_OFF}\n" "$WARN_CNT"
else
    printf "${C_OK}=> Tout est vert.${C_OFF}\n"
fi
exit 0
