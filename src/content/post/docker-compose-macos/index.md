---
title: "How to get `docker compose` command working in macOS"
description: "Tweaking the docker-compose command installed via homebrew."
publishDate: "2025-07-26"
tags: ["docker", "tip", "macOS", "homebrew"]
---

The easiest way to set up docker CLI tooling is to simply install Docker Desktop. It's free for non-commercial usage and is fairly straightforward to use. If you are like me, however, and prefer to stick to open source tooling rather than being stuck with proprietary packages you cannot control, you are probably using an OSS Docker Desktop replacement like [Colima](https://github.com/abiosoft/colima).

For Colima to work as a Docker runtime, you'll need to install two things using homebrew:

1. `brew install docker` - the main docker command itself.
2. `brew install docker-compose` - the compose command that's shipped separately.

Newer versions of the official Docker CLI have shipped with `docker compose`, replacing the legacy `docker-compose` command. Unfortunately, this is not true for the homebrew packages.

Fortunately, the fix is incredibly simple. Just make the compose command available as a docker plugin (the `cliPluginsExtraDirs` section below):

```
// filepath: ~/.docker/config.json
{
        "auths": {},
        "currentContext": "colima",
         "cliPluginsExtraDirs": [
           "/opt/homebrew/lib/docker/cli-plugins"
        ]
}
```

After saving this file, `docker compose` will magically spring to life. And the `docker-compose` command will keep working too.

_Credit: Shout out to this [stackoverflow answer](https://stackoverflow.com/a/78751971)._