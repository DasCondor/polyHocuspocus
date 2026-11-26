# Security policy

## Reporting a vulnerability

Please report security problems privately, not in a public issue:

1. Open the repository's **[Security](https://github.com/DasCondor/polyHocuspocus/security)** tab.
2. Choose **Report a vulnerability** and describe what you found and how to reproduce it.

If that button isn't there, open an issue that only asks for a private contact. Leave the details out of it.

You should get a reply within a week. Fixes go out as new images on `ghcr.io/dascondor/polyhocuspocus` and a new deploy of the website.

## What's in scope

- The Docker images and `compose.yaml`: escaping a container, gaining privileges, or reaching the host or network when the documented settings say you shouldn't.
- The Node.js and Python web servers, and the website: cross-site scripting, injection, or anything that bypasses the security headers.
- The build and release pipeline: anything that could change a published image or the website without a reviewed commit.

The programs themselves are a card trick with no accounts, data or secrets, so "the trick can be predicted" is not a vulnerability.

## Supported versions

Only the latest images (the tags on `ghcr.io/dascondor/polyhocuspocus`) and the current website are supported. Pull again to get fixes:

```powershell
docker compose pull
```

## How the containers are hardened

See [🔒 Security in the README](README.md#-security).
