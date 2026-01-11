---
title: "Saga Pattern Demystified: Orchestration vs Choreography"
url: "https://open.substack.com/pub/bytebytego/p/saga-pattern-demystified-orchestration?utm_campaign=post-expanded-share&utm_medium=web"
excerpt: "In this article, we will look at how the Saga pattern works and the pros and cons of various approaches to implement this pattern."
readDate: "2026-01-11T04:27:46.554Z"
---

TIL that there's a name for the inter-service communication pattern that I implemented in our microservices solution five years ago.

It's called Choreography-based Saga. This is where each service listens for interesting events from other services to trigger actions.

The alternative is Orchestration-based Saga where a central orchestrator listens to events from and issues commands to services.
