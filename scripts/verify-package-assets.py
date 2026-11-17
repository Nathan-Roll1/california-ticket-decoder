"""Check release digests and package identities before a registry upload."""
import argparse
import hashlib
import json
import re
import tarfile
import zipfile
from email.parser import BytesParser
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("registry", choices=("npm", "pypi"))
parser.add_argument("version")
parser.add_argument("checksum_digest")
parser.add_argument("directory", type=Path)
args = parser.parse_args()
if not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", args.version):
    raise SystemExit("Expected a stable numeric package version")
if not re.fullmatch(r"[0-9a-f]{64}", args.checksum_digest):
    raise SystemExit("Expected a reviewed SHA256SUMS digest")
root = args.directory
manifest = (root / "SHA256SUMS.txt").read_bytes()
if hashlib.sha256(manifest).hexdigest() != args.checksum_digest:
    raise SystemExit("Checksum manifest differs from the reviewed release")
checksums = {}
for line in manifest.decode("utf8").splitlines():
    match = re.fullmatch(r"([0-9a-f]{64})  ([A-Za-z0-9_.-]+)", line)
    if not match or match[2] in checksums:
        raise SystemExit("Invalid or duplicate checksum entry")
    checksums[match[2]] = match[1]

name = "california-ticket-decoder"
prefix = f"california_ticket_decoder-{args.version}"
if args.registry == "npm":
    files = [f"{name}-{args.version}.tgz"]
else:
    files = [prefix + "-py3-none-any.whl", prefix + ".tar.gz"]
folder = root / "dist"
if set(p.name for p in folder.iterdir()) != set(files):
    raise SystemExit("Unexpected or missing release asset")
for file in files:
    if hashlib.sha256((folder / file).read_bytes()).hexdigest() != checksums.get(file):
        raise SystemExit("Package bytes differ from reviewed checksum")

if args.registry == "npm":
    with tarfile.open(folder / files[0]) as archive:
        package = json.load(archive.extractfile("package/package.json"))
    if package["name"] != name or package["version"] != args.version:
        raise SystemExit("Mismatched npm name or version")
    repository = package.get("repository", {})
    repository_url = "git+https://github.com/Nathan-Roll1/california-ticket-decoder.git"
    if not isinstance(repository, dict) or repository.get("url") != repository_url:
        raise SystemExit("For OIDC publish, build a new reviewed release with the correct repository.url")
else:
    with zipfile.ZipFile(folder / files[0]) as wheel:
        meta = wheel.read(prefix + ".dist-info/METADATA")
    with tarfile.open(folder / files[1]) as source:
        pkg_info = source.extractfile(prefix + "/PKG-INFO").read()
    for data in (meta, pkg_info):
        fields = BytesParser().parsebytes(data)
        if fields["Name"] != name or fields["Version"] != args.version:
            raise SystemExit("Mismatched Python name or version")
print(f"{args.registry} {args.version}: verified {len(files)} release assets")
