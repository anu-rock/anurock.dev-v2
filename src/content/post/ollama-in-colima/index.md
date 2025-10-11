---
title: "Ollama in Colima"
description: "Running Ollama in a Colima container might require adjusting memory limits. Here's how to do it."
publishDate: "2025-10-11"
tags: ["ollama", "colima", "docker", "llm"]
---

[Ollama](https://ollama.com/) is a popular tool for running large language models (LLMs) locally. [Colima](https://github.com/abiosoft/colima) is a container runtime that provides a lightweight and efficient way to run Docker containers on macOS and Linux. Think of Colima as a drop-in replacement for Docker Desktop, but in CLI form. And 100% open source.

Running decent LLM models locally requires, well, a shit-load of compute. And lots of GPU power. Apple Silicon chips handle such workloads gracefully. My Apple M3 Pro laptop runs llama3.1 inferences within a few seconds. However, things get messier in resource-constrained environments like containers.

Container runtimes like Colima and Docker Desktop impose sane defaults on resource usage, which can be limiting. For example, the default memory limit for a container might be set to a fraction of the host's total memory, making it challenging to run large models without tweaking these settings.

I recently ran into this issue while trying to run Ollama in a Colima container. The default memory limit was too low, causing the model to fail during initialization. To resolve this, I had to increase the memory limit for the container using the `--memory` flag when starting the Colima instance.

Here's how to do it.

First, stop all running Colima instances:
```bash
colima stop
```

Next, start a new Colima instance with increased memory limits:
```bash
colima start --cpu 4 --memory 8
```
In this example, I've allocated 4 CPU cores and 8GB of memory to the Colima instance. Adjust these values based on your system's capabilities and the requirements of the model you intend to run. Typically, Ollama will explicitly tell you in the error message how much memory it needs for the model you're trying to load.

---
Until next time,  
Cheers ✌️